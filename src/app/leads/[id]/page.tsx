import { notFound } from "next/navigation";
import { requireCoordinator } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getActiveCentres, getActiveCoordinators, getActiveReasons } from "@/lib/lookups";
import { LeadForm } from "@/components/LeadForm";
import { updateLeadAction } from "@/app/leads/actions";
import { PhoneActions } from "@/components/PhoneActions";

export default async function EditLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireCoordinator();

  const [lead, centres, coordinators, reasons] = await Promise.all([
    prisma.lead.findUnique({ where: { id } }),
    getActiveCentres(),
    getActiveCoordinators(),
    getActiveReasons(),
  ]);

  if (!lead || lead.createdByUserId !== session.sub) {
    notFound();
  }

  const boundAction = updateLeadAction.bind(null, lead.id);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          {lead.motherName}
        </h1>
        <PhoneActions phone={lead.contactNumber} />
      </div>
      <LeadForm
        action={boundAction}
        centres={centres.map((c) => ({ id: c.id, label: c.name }))}
        coordinators={coordinators.map((c) => ({ id: c.id, label: c.name }))}
        reasons={reasons.map((r) => ({ id: r.id, label: r.label }))}
        defaultValues={{
          dateOfInquiry: lead.dateOfInquiry.toISOString().slice(0, 10),
          motherName: lead.motherName,
          contactNumber: lead.contactNumber,
          centreId: lead.centreId,
          motherLocation: lead.motherLocation,
          coordinatorId: lead.coordinatorId,
          status: lead.status,
          reasonNotJoiningId: lead.reasonNotJoiningId || "",
          // Leads enrolled before this field existed fall back to the date they were marked Enrolled.
          enrollmentDate:
            (lead.enrollmentDate ?? (lead.status === "ENROLLED" ? lead.statusChangedAt : null))
              ?.toISOString()
              .slice(0, 10) || "",
          notes: lead.notes || "",
        }}
        submitLabel="Save changes"
      />
    </div>
  );
}
