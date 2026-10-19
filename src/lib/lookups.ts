import { prisma } from "@/lib/db";

export async function getActiveCentres() {
  return prisma.centre.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getActiveCoordinators() {
  return prisma.coordinator.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getActiveReasons() {
  return prisma.reasonNotJoining.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  });
}

export async function getAllCentres() {
  return prisma.centre.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
}

export async function getAllCoordinators() {
  return prisma.coordinator.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
}

export async function getAllReasons() {
  return prisma.reasonNotJoining.findMany({ orderBy: [{ sortOrder: "asc" }, { label: "asc" }] });
}
