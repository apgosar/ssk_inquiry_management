import { format, startOfMonth, subMonths } from "date-fns";
import { loadDashboardData } from "@/lib/dashboard";
import { getAllCentres, getAllCoordinators } from "@/lib/lookups";
import { FilterBar } from "@/components/FilterBar";
import { KpiTile } from "@/components/KpiTile";
import { ChartCard } from "@/components/charts/ChartCard";
import { TrendChart } from "@/components/charts/TrendChart";
import { ConversionBarChart } from "@/components/charts/ConversionBarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { StackedMonthlyChart } from "@/components/charts/StackedMonthlyChart";
import { ReasonBarChart } from "@/components/charts/ReasonBarChart";
import { LinkButton } from "@/components/Button";
import { Card } from "@/components/Card";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string;
    to?: string;
    centreId?: string;
    coordinatorId?: string;
  }>;
}) {
  const params = await searchParams;
  const to = params.to ? new Date(params.to) : new Date();
  const from = params.from
    ? new Date(params.from)
    : startOfMonth(subMonths(new Date(), 5));

  const [data, centres, coordinators] = await Promise.all([
    loadDashboardData({
      from,
      to,
      centreId: params.centreId || undefined,
      coordinatorId: params.coordinatorId || undefined,
    }),
    getAllCentres(),
    getAllCoordinators(),
  ]);

  const printHref = `/admin/dashboard/print?${new URLSearchParams({
    from: format(from, "yyyy-MM-dd"),
    to: format(to, "yyyy-MM-dd"),
    ...(params.centreId ? { centreId: params.centreId } : {}),
    ...(params.coordinatorId ? { coordinatorId: params.coordinatorId } : {}),
  }).toString()}`;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted">
            {format(from, "d MMM yyyy")} – {format(to, "d MMM yyyy")}
          </p>
        </div>
        <div className="flex gap-2">
          <LinkButton href="/admin/leads" variant="outline" size="sm">
            View all leads
          </LinkButton>
          <LinkButton href={printHref} variant="outline" size="sm" target="_blank">
            Print / PDF report
          </LinkButton>
        </div>
      </div>

      <FilterBar
        basePath="/admin/dashboard"
        from={format(from, "yyyy-MM-dd")}
        to={format(to, "yyyy-MM-dd")}
        centres={centres}
        coordinators={coordinators}
        centreId={params.centreId}
        coordinatorId={params.coordinatorId}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiTile label="Total inquiries" value={String(data.total)} />
        <KpiTile
          label="Pending / On Hold"
          value={String(data.pendingCount)}
          tone="pending"
        />
        <KpiTile label="Enrolled" value={String(data.enrolledCount)} tone="enrolled" />
        <KpiTile
          label="Not joining"
          value={String(data.notJoiningCount)}
          tone="notJoining"
        />
        <KpiTile
          label="Conversion rate"
          value={`${data.conversionRate.toFixed(1)}%`}
        />
        <KpiTile
          label="Avg. days to close"
          value={data.avgDaysToClose === null ? "—" : data.avgDaysToClose.toFixed(1)}
        />
        <KpiTile label="New inquiries today" value={String(data.newToday)} />
        <KpiTile label="New this week" value={String(data.newThisWeek)} />
        <KpiTile
          label="Month-over-month"
          value={data.momGrowth === null ? "—" : `${data.momGrowth >= 0 ? "+" : ""}${data.momGrowth.toFixed(0)}%`}
          sub="Inquiry volume vs previous month"
        />
      </div>

      <div className="mb-6">
        <ChartCard
          title="Leads converted — overall"
          subtitle="Monthly inquiries, enrollments and conversion rate"
        >
          <TrendChart data={data.monthlyTrend} />
        </ChartCard>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Conversion by centre" subtitle="Total inquiries vs enrolled">
          <ConversionBarChart
            data={data.byCentre}
            height={Math.max(220, data.byCentre.length * 34)}
          />
        </ChartCard>
        <ChartCard title="Conversion by coordinator" subtitle="Total inquiries vs enrolled">
          <ConversionBarChart
            data={data.byCoordinator}
            height={Math.max(220, data.byCoordinator.length * 34)}
          />
        </ChartCard>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Conversion by location"
          subtitle="Top locations of mothers enquiring"
        >
          <ConversionBarChart
            data={data.byLocation}
            height={Math.max(220, data.byLocation.length * 34)}
          />
        </ChartCard>
        <ChartCard title="Status distribution" subtitle="Where every inquiry stands today">
          <DonutChart data={data.statusDistribution} />
        </ChartCard>
      </div>

      <div className="mb-6">
        <ChartCard
          title="Total inquiries per month by coordinator"
          subtitle="Who handled how much volume, month by month"
        >
          <StackedMonthlyChart data={data.monthlyByCoordinator} seriesKeys={data.coordinatorNames} />
        </ChartCard>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Reason for not joining"
          subtitle="Why leads didn't convert"
        >
          {data.reasonDistribution.length === 0 ? (
            <EmptyNote text="No 'Not Joining' leads in this period." />
          ) : (
            <ReasonBarChart data={data.reasonDistribution} />
          )}
        </ChartCard>
        <ChartCard
          title="Pending / On-Hold aging"
          subtitle="How long open leads have been waiting for follow-up"
        >
          <ReasonBarChart
            data={data.agingBuckets.map((b) => ({ label: b.label, count: b.count }))}
          />
        </ChartCard>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <LeaderboardCard
          title="Coordinator leaderboard"
          subtitle="Ranked by conversion rate (min. 3 leads)"
          rows={data.coordinatorLeaderboard}
        />
        <LeaderboardCard
          title="Centre leaderboard"
          subtitle="Ranked by conversion rate (min. 3 leads)"
          rows={data.centreLeaderboard}
        />
      </div>
    </div>
  );
}

function EmptyNote({ text }: { text: string }) {
  return (
    <p className="flex h-40 items-center justify-center text-center text-sm text-muted">
      {text}
    </p>
  );
}

function LeaderboardCard({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: { name: string; total: number; enrolled: number; conversionRate: number }[];
}) {
  return (
    <Card className="p-4 sm:p-5">
      <h3 className="font-heading text-lg font-semibold text-foreground">{title}</h3>
      <p className="mb-3 text-xs text-muted">{subtitle}</p>
      {rows.length === 0 ? (
        <EmptyNote text="Not enough data yet." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-1.5 pr-2">#</th>
                <th className="py-1.5 pr-2">Name</th>
                <th className="py-1.5 pr-2 text-right">Total</th>
                <th className="py-1.5 pr-2 text-right">Enrolled</th>
                <th className="py-1.5 text-right">Conv. %</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.name} className="border-t border-border">
                  <td className="py-1.5 pr-2 text-muted">{i + 1}</td>
                  <td className="py-1.5 pr-2 font-medium text-foreground">{r.name}</td>
                  <td className="py-1.5 pr-2 text-right">{r.total}</td>
                  <td className="py-1.5 pr-2 text-right">{r.enrolled}</td>
                  <td className="py-1.5 text-right font-semibold text-enrolled">
                    {r.conversionRate.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
