"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { nationalDigits, normalizeCountryCode } from "@/lib/phone";

export type DuplicateMatch = {
  id: string;
  motherName: string;
  dateOfInquiry: string; // YYYY-MM-DD
  centre: string;
  handledBy: string;
  status: "PENDING" | "ENROLLED" | "NOT_JOINING";
  sameNumber: boolean;
  sameName: boolean;
  /** Only the person who entered a lead can open it. */
  mine: boolean;
};

/**
 * Looks for existing inquiries with the same mobile number or the same name. Searches every
 * coordinator's leads (a duplicate is a duplicate whoever entered it) but only returns the few
 * fields needed for a warning, never the contact number or notes.
 */
export async function checkDuplicatesAction(
  name: string,
  countryCode: string,
  number: string
): Promise<DuplicateMatch[]> {
  const session = await getSession();
  if (!session) return [];

  const cc = normalizeCountryCode(countryCode) || "+91";
  const digits = nationalDigits(number, cc);
  const cleanName = name.trim().replace(/\s+/g, " ");

  const checkNumber = digits.length >= (cc === "+91" ? 10 : 5);
  const checkName = cleanName.length >= 3;
  if (!checkNumber && !checkName) return [];

  const leads = await prisma.lead.findMany({
    where: {
      OR: [
        ...(checkNumber ? [{ countryCode: cc, contactNumber: digits }] : []),
        ...(checkName ? [{ motherName: { equals: cleanName, mode: "insensitive" as const } }] : []),
      ],
    },
    include: { centre: true, coordinator: true },
    orderBy: { dateOfInquiry: "desc" },
    take: 5,
  });

  return leads.map((l) => ({
    id: l.id,
    motherName: l.motherName,
    dateOfInquiry: l.dateOfInquiry.toISOString().slice(0, 10),
    centre: l.centre.name,
    handledBy: l.coordinator.name,
    status: l.status,
    sameNumber: checkNumber && l.countryCode === cc && l.contactNumber === digits,
    sameName: checkName && l.motherName.trim().replace(/\s+/g, " ").toLowerCase() === cleanName.toLowerCase(),
    mine: l.createdByUserId === session.sub,
  }));
}
