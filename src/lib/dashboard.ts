import { prisma } from "@/lib/db";
import {
  format,
  eachMonthOfInterval,
  differenceInCalendarDays,
  subDays,
  startOfDay,
  endOfDay,
} from "date-fns";
import type { Lead, Centre, Coordinator, ReasonNotJoining } from "@prisma/client";

export type DashboardFilter = {
  from: Date;
  to: Date;
  centreId?: string;
  coordinatorId?: string;
};

type LeadWithRelations = Lead & {
  centre: Centre;
  coordinator: Coordinator;
  reasonNotJoining: ReasonNotJoining | null;
};

export async function loadDashboardData(filter: DashboardFilter) {
  const leads = await prisma.lead.findMany({
    where: {
      dateOfInquiry: { gte: startOfDay(filter.from), lte: endOfDay(filter.to) },
      ...(filter.centreId ? { centreId: filter.centreId } : {}),
      ...(filter.coordinatorId ? { coordinatorId: filter.coordinatorId } : {}),
    },
    include: { centre: true, coordinator: true, reasonNotJoining: true },
    orderBy: { dateOfInquiry: "asc" },
  });

  return computeDashboard(leads, filter);
}

function monthKey(d: Date) {
  return format(d, "yyyy-MM");
}

function computeDashboard(leads: LeadWithRelations[], filter: DashboardFilter) {
  const total = leads.length;
  const enrolled = leads.filter((l) => l.status === "ENROLLED");
  const notJoining = leads.filter((l) => l.status === "NOT_JOINING");
  const pending = leads.filter((l) => l.status === "PENDING");
  const conversionRate = total ? (enrolled.length / total) * 100 : 0;

  const months = eachMonthOfInterval({ start: filter.from, end: filter.to }).map((d) =>
    format(d, "yyyy-MM")
  );

  const monthlyTrend = months.map((m) => {
    const inMonth = leads.filter((l) => monthKey(l.dateOfInquiry) === m);
    const enrolledInMonth = inMonth.filter((l) => l.status === "ENROLLED").length;
    return {
      month: m,
      monthLabel: format(new Date(`${m}-01`), "MMM yy"),
      total: inMonth.length,
      enrolled: enrolledInMonth,
      conversionRate: inMonth.length ? (enrolledInMonth / inMonth.length) * 100 : 0,
    };
  });

  type Agg = { id: string; name: string; total: number; enrolled: number };

  function aggregateBy(keyFn: (l: LeadWithRelations) => { id: string; name: string }) {
    const map = new Map<string, Agg>();
    for (const l of leads) {
      const { id, name } = keyFn(l);
      const cur = map.get(id) || { id, name, total: 0, enrolled: 0 };
      cur.total += 1;
      if (l.status === "ENROLLED") cur.enrolled += 1;
      map.set(id, cur);
    }
    return [...map.values()].map((a) => ({
      ...a,
      conversionRate: a.total ? (a.enrolled / a.total) * 100 : 0,
    }));
  }

  const byCentre = aggregateBy((l) => ({ id: l.centre.id, name: l.centre.name })).sort(
    (a, b) => b.total - a.total
  );
  const byCoordinator = aggregateBy((l) => ({
    id: l.coordinator.id,
    name: l.coordinator.name,
  })).sort((a, b) => b.total - a.total);
  const byLocation = aggregateBy((l) => ({
    id: l.motherLocation.trim().toLowerCase(),
    name: l.motherLocation.trim(),
  }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 12);

  const coordinatorNames = [...new Set(leads.map((l) => l.coordinator.name))].sort();
  const monthlyByCoordinator = months.map((m) => {
    const row: Record<string, number | string> = {
      month: m,
      monthLabel: format(new Date(`${m}-01`), "MMM yy"),
    };
    for (const name of coordinatorNames) row[name] = 0;
    for (const l of leads) {
      if (monthKey(l.dateOfInquiry) === m) {
        row[l.coordinator.name] = (row[l.coordinator.name] as number) + 1;
      }
    }
    return row;
  });

  const statusDistribution = [
    { name: "Pending / On Hold", value: pending.length, key: "PENDING" as const },
    { name: "Enrolled", value: enrolled.length, key: "ENROLLED" as const },
    { name: "Not Joining", value: notJoining.length, key: "NOT_JOINING" as const },
  ];

  const reasonMap = new Map<string, number>();
  for (const l of notJoining) {
    const label = l.reasonNotJoining?.label || "Unspecified";
    reasonMap.set(label, (reasonMap.get(label) || 0) + 1);
  }
  const reasonDistribution = [...reasonMap.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const now = new Date();
  const agingBuckets = [
    { label: "0-7 days", count: 0 },
    { label: "8-14 days", count: 0 },
    { label: "15-30 days", count: 0 },
    { label: "30+ days", count: 0 },
  ];
  for (const l of pending) {
    const days = differenceInCalendarDays(now, l.dateOfInquiry);
    if (days <= 7) agingBuckets[0].count += 1;
    else if (days <= 14) agingBuckets[1].count += 1;
    else if (days <= 30) agingBuckets[2].count += 1;
    else agingBuckets[3].count += 1;
  }

  const closed = [...enrolled, ...notJoining];
  const avgDaysToClose = closed.length
    ? closed.reduce(
        (sum, l) => {
          // Enrolled leads use the recorded enrollment date; older ones (and Not Joining)
          // fall back to the day the status was changed in the app.
          const closedOn = l.status === "ENROLLED" ? l.enrollmentDate ?? l.statusChangedAt : l.statusChangedAt;
          return sum + differenceInCalendarDays(closedOn, l.dateOfInquiry);
        },
        0
      ) / closed.length
    : null;

  let momGrowth: number | null = null;
  if (monthlyTrend.length >= 2) {
    const prev = monthlyTrend[monthlyTrend.length - 2].total;
    const curr = monthlyTrend[monthlyTrend.length - 1].total;
    momGrowth = prev > 0 ? ((curr - prev) / prev) * 100 : curr > 0 ? 100 : 0;
  }

  const todayStr = format(now, "yyyy-MM-dd");
  const newToday = leads.filter((l) => format(l.dateOfInquiry, "yyyy-MM-dd") === todayStr)
    .length;
  const weekAgo = subDays(now, 7);
  const newThisWeek = leads.filter((l) => l.dateOfInquiry >= weekAgo).length;

  const MIN_SAMPLE = 3;
  const coordinatorLeaderboard = [...byCoordinator]
    .filter((c) => c.total >= MIN_SAMPLE)
    .sort((a, b) => b.conversionRate - a.conversionRate);
  const centreLeaderboard = [...byCentre]
    .filter((c) => c.total >= MIN_SAMPLE)
    .sort((a, b) => b.conversionRate - a.conversionRate);

  return {
    total,
    enrolledCount: enrolled.length,
    notJoiningCount: notJoining.length,
    pendingCount: pending.length,
    conversionRate,
    monthlyTrend,
    byCentre,
    byCoordinator,
    byLocation,
    monthlyByCoordinator,
    coordinatorNames,
    statusDistribution,
    reasonDistribution,
    agingBuckets,
    avgDaysToClose,
    momGrowth,
    newToday,
    newThisWeek,
    coordinatorLeaderboard,
    centreLeaderboard,
  };
}

export type DashboardData = Awaited<ReturnType<typeof loadDashboardData>>;
