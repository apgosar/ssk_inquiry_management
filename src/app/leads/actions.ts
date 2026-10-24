"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCoordinator } from "@/lib/auth";
import {
  parseLeadFormData,
  fieldErrorsFrom,
  type LeadFormState,
} from "@/lib/lead-schema";

export async function createLeadAction(
  _prevState: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  const session = await requireCoordinator();
  const parsed = parseLeadFormData(formData);

  if (!parsed.success) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error),
      values: Object.fromEntries(formData.entries()) as Record<string, string>,
    };
  }

  const data = parsed.data;

  await prisma.lead.create({
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
      enrollmentDate:
        data.status === "ENROLLED" && data.enrollmentDate
          ? new Date(data.enrollmentDate)
          : null,
      notes: data.notes || null,
      createdByUserId: session.sub,
      statusChangedAt: new Date(),
    },
  });

  revalidatePath("/leads");
  revalidatePath("/leads/all");
  redirect("/leads?created=1");
}

export async function updateLeadAction(
  leadId: string,
  _prevState: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  const session = await requireCoordinator();

  const existing = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!existing || existing.createdByUserId !== session.sub) {
    return { error: "You can only edit inquiries you entered yourself." };
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
      enrollmentDate:
        data.status === "ENROLLED" && data.enrollmentDate
          ? new Date(data.enrollmentDate)
          : null,
      notes: data.notes || null,
      statusChangedAt:
        data.status !== existing.status ? new Date() : existing.statusChangedAt,
    },
  });

  revalidatePath("/leads");
  revalidatePath("/leads/all");
  revalidatePath(`/leads/${leadId}`);
  redirect("/leads/all?updated=1");
}
