import { prisma } from "@/lib/db";
import type { LeadFormValues } from "@/lib/lead-schema";

/**
 * Some reasons (e.g. "Others") ask the coordinator to type the actual reason. Returns the text to
 * store (null when it doesn't apply, so it is cleared if the status or reason changes), or an
 * error message when the chosen reason needs a detail and none was entered.
 */
export async function resolveOtherReason(
  data: LeadFormValues
): Promise<{ otherReason: string | null; error?: string }> {
  if (data.status !== "NOT_JOINING" || !data.reasonNotJoiningId) return { otherReason: null };

  const reason = await prisma.reasonNotJoining.findUnique({
    where: { id: data.reasonNotJoiningId },
    select: { requiresDetail: true },
  });
  if (!reason?.requiresDetail) return { otherReason: null };

  const text = (data.otherReason || "").trim();
  if (!text) return { otherReason: null, error: "Please enter the reason." };
  return { otherReason: text };
}
