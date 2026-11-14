import { prisma } from "@/lib/db";
import type { LeadFormValues } from "@/lib/lead-schema";

/**
 * Some reasons (e.g. "Others") ask the coordinator to type the actual reason. Returns the text to
 * store (null when it doesn't apply, so it is cleared if the status or reasons change), or an
 * error message when any chosen reason needs a detail and none was entered.
 */
export async function resolveOtherReason(
  data: LeadFormValues
): Promise<{ otherReason: string | null; error?: string }> {
  if (data.status !== "NOT_JOINING" || data.reasonNotJoiningIds.length === 0) {
    return { otherReason: null };
  }

  const needsDetail = await prisma.reasonNotJoining.count({
    where: { id: { in: data.reasonNotJoiningIds }, requiresDetail: true },
  });
  if (needsDetail === 0) return { otherReason: null };

  const text = (data.otherReason || "").trim();
  if (!text) return { otherReason: null, error: "Please enter the reason." };
  return { otherReason: text };
}
