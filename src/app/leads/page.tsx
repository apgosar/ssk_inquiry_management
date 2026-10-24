import Link from "next/link";
import { requireCoordinator } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/Button";
import { PendingLeadList } from "./PendingLeadList";

export default async function PendingLeadsPage() {
  const session = await requireCoordinator();

  const leads = await prisma.lead.findMany({
    where: { createdByUserId: session.sub, status: "PENDING" },
    include: { centre: true, coordinator: true },
    orderBy: { dateOfInquiry: "asc" },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Pending / On Hold <span className="ml-1 text-primary lining-nums">{leads.length}</span>
        </h1>
        <Link href="/leads/new">
          <Button size="sm">+ New</Button>
        </Link>
      </div>

      <PendingLeadList
        leads={leads.map((l) => ({
          id: l.id,
          dateOfInquiry: l.dateOfInquiry,
          motherName: l.motherName,
          contactNumber: l.contactNumber,
          motherLocation: l.motherLocation,
          status: l.status,
          centre: { name: l.centre.name },
          coordinator: { name: l.coordinator.name },
        }))}
      />
    </div>
  );
}
