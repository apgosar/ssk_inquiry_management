import Link from "next/link";
import { requireCoordinator } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LeadListCard } from "@/components/LeadListCard";
import { Button } from "@/components/Button";

export default async function PendingLeadsPage() {
  const session = await requireCoordinator();

  const leads = await prisma.lead.findMany({
    where: { createdByUserId: session.sub, status: "PENDING" },
    include: { centre: true, coordinator: true },
    orderBy: { dateOfInquiry: "asc" },
  });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Pending / On Hold
          </h1>
          <p className="text-sm text-muted">
            {leads.length} lead{leads.length === 1 ? "" : "s"} waiting on you
          </p>
        </div>
        <Link href="/leads/new">
          <Button size="sm">+ New</Button>
        </Link>
      </div>

      {leads.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
          No pending inquiries. Nice and caught up — add a new inquiry any time.
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
