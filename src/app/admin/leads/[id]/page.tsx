import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAllCentres, getAllCoordinators, getAllReasons } from "@/lib/lookups";
import { LeadForm } from "@/components/LeadForm";
import { updateLeadAdminAction, deleteLeadAdminAction } from "@/app/admin/leads/actions";
import { PhoneActions } from "@/components/PhoneActions";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";

export default async function AdminEditLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [lead, centres, coordinators, reasons] = await Promise.all([
    prisma.lead.findUnique({ where: { id }, include: { createdByUser: true } }),
    getAllCentres(),
    getAllCoordinators(),
    getAllReasons(),
  ]);

  if (!lead) notFound();

  const boundAction = updateLeadAdminAction.bind(null, lead.id);

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            {lead.motherName}
          </h1>
          <p className="text-xs text-muted">Entered by {lead.createdByUser.name}</p>
        </div>
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

      <form action={deleteLeadAdminAction} className="mt-2">
        <input type="hidden" name="leadId" value={lead.id} />
        <ConfirmSubmitButton
          type="submit"
          variant="danger"
          size="sm"
          className="w-full"
          confirmMessage="Delete this lead permanently? This cannot be undone."
        >
          Delete lead
        </ConfirmSubmitButton>
      </form>
    </div>
  );
}
