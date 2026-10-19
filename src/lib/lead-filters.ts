import type { Prisma, LeadStatus } from "@prisma/client";
import { startOfDay, endOfDay } from "date-fns";

export type LeadSearchParams = {
  from?: string;
  to?: string;
  centreId?: string;
  coordinatorId?: string;
  status?: string;
  q?: string;
};

export function buildLeadWhere(params: LeadSearchParams): Prisma.LeadWhereInput {
  const where: Prisma.LeadWhereInput = {};

  if (params.from || params.to) {
    where.dateOfInquiry = {
      ...(params.from ? { gte: startOfDay(new Date(params.from)) } : {}),
      ...(params.to ? { lte: endOfDay(new Date(params.to)) } : {}),
    };
  }
  if (params.centreId) where.centreId = params.centreId;
  if (params.coordinatorId) where.coordinatorId = params.coordinatorId;
  if (params.status) where.status = params.status as LeadStatus;
  if (params.q) {
    where.OR = [
      { motherName: { contains: params.q, mode: "insensitive" } },
      { contactNumber: { contains: params.q } },
      { motherLocation: { contains: params.q, mode: "insensitive" } },
    ];
  }

  return where;
}
