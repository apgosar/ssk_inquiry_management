"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import {
  parseLeadFormData,
  fieldErrorsFrom,
  type LeadFormState,
} from "@/lib/lead-schema";

export async function updateLeadAdminAction(
  leadId: string,
  _prevState: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  await requireAdmin();

  const existing = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!existing) {
    return { error: "Lead not found." };
  }

  const parsed = parseLeadFormData(formData);
  if (!parsed.success) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error),
      values: Object.fromEntries(formData.entries()) as Record<string, string>,
    };
  }

  const data = parsed.data;

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      dateOfInquiry: new Date(data.dateOfInquiry),
      motherName: data.motherName,
      contactNumber: data.contactNumber,
      centreId: data.centreId,
      motherLocation: data.motherLocation,
      coordinatorId: data.coordinatorId,
      status: data.status,
      reasonNotJoiningId:
        data.status === "NOT_JOINING" ? data.reasonNotJoiningId || null : null,
      notes: data.notes || null,
      statusChangedAt:
        data.status !== existing.status ? new Date() : existing.statusChangedAt,
    },
  });

  revalidatePath("/admin/leads");
  revalidatePath("/admin/dashboard");
  redirect("/admin/leads?updated=1");
}

export async function deleteLeadAdminAction(formData: FormData) {
  await requireAdmin();
  const leadId = String(formData.get("leadId") || "");
  if (!leadId) return;
  await prisma.lead.delete({ where: { id: leadId } });
  revalidatePath("/admin/leads");
  revalidatePath("/admin/dashboard");
  redirect("/admin/leads?deleted=1");
}
