import { requireCoordinator } from "@/lib/auth";
import { getActiveCentres, getActiveCoordinators, getActiveReasons } from "@/lib/lookups";
import { LeadForm } from "@/components/LeadForm";
import { createLeadAction } from "@/app/leads/actions";

export default async function NewInquiryPage() {
  const session = await requireCoordinator();
  const [centres, coordinators, reasons] = await Promise.all([
    getActiveCentres(),
    getActiveCoordinators(),
    getActiveReasons(),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <h1 className="mb-5 font-heading text-2xl font-semibold text-foreground">
        New Inquiry
      </h1>
      <LeadForm
        action={createLeadAction}
        centres={centres.map((c) => ({ id: c.id, label: c.name }))}
        coordinators={coordinators.map((c) => ({ id: c.id, label: c.name }))}
        reasons={reasons.map((r) => ({ id: r.id, label: r.label }))}
        defaultValues={{
          dateOfInquiry: today,
          coordinatorId: session.coordinatorId || "",
          status: "PENDING",
        }}
        submitLabel="Save inquiry"
      />
    </div>
  );
}
