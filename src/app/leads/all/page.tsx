import Link from "next/link";
import clsx from "clsx";
import { requireCoordinator } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LeadListCard } from "@/components/LeadListCard";
import type { LeadStatus } from "@prisma/client";

const TABS: { value: LeadStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "ENROLLED", label: "Enrolled" },
  { value: "NOT_JOINING", label: "Not Joining" },
];

export default async function AllLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await requireCoordinator();
  const { status } = await searchParams;
  const activeTab = (status as LeadStatus | undefined) || "ALL";

  const leads = await prisma.lead.findMany({
    where: {
      createdByUserId: session.sub,
      ...(activeTab !== "ALL" ? { status: activeTab } : {}),
    },
    include: { centre: true, coordinator: true },
    orderBy: { dateOfInquiry: "desc" },
  });

  return (
    <div>
      <h1 className="mb-4 font-heading text-2xl font-semibold text-foreground">
        All My Leads
      </h1>

      <div className="mb-5 flex gap-2 overflow-x-auto">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "ALL" ? "/leads/all" : `/leads/all?status=${tab.value}`}
            className={clsx(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.value
                ? "border-primary bg-primary text-white"
                : "border-border bg-surface text-foreground"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {leads.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
          No leads here yet.
        </p>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <LeadListCard key={lead.id} lead={lead} href={`/leads/${lead.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
