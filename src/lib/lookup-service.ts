import { prisma } from "@/lib/db";

export type LookupKind = "centre" | "coordinator" | "reason";

async function getMaxSortOrder(kind: LookupKind): Promise<number> {
  switch (kind) {
    case "centre": {
      const row = await prisma.centre.findFirst({ orderBy: { sortOrder: "desc" } });
      return row?.sortOrder ?? -1;
    }
    case "coordinator": {
      const row = await prisma.coordinator.findFirst({ orderBy: { sortOrder: "desc" } });
      return row?.sortOrder ?? -1;
    }
    case "reason": {
      const row = await prisma.reasonNotJoining.findFirst({ orderBy: { sortOrder: "desc" } });
      return row?.sortOrder ?? -1;
    }
  }
}

export async function createLookupItem(kind: LookupKind, label: string) {
  const value = label.trim();
  if (!value) throw new Error("Name is required.");
  const sortOrder = (await getMaxSortOrder(kind)) + 1;

  switch (kind) {
    case "centre":
      return prisma.centre.create({ data: { name: value, sortOrder } });
    case "coordinator":
      return prisma.coordinator.create({ data: { name: value, sortOrder } });
    case "reason":
      return prisma.reasonNotJoining.create({ data: { label: value, sortOrder } });
  }
}

export async function setLookupActive(kind: LookupKind, id: string, active: boolean) {
  switch (kind) {
    case "centre":
      return prisma.centre.update({ where: { id }, data: { active } });
    case "coordinator":
      return prisma.coordinator.update({ where: { id }, data: { active } });
    case "reason":
      return prisma.reasonNotJoining.update({ where: { id }, data: { active } });
  }
}

export async function renameLookupItem(kind: LookupKind, id: string, label: string) {
  const value = label.trim();
  if (!value) throw new Error("Name is required.");
  switch (kind) {
    case "centre":
      return prisma.centre.update({ where: { id }, data: { name: value } });
    case "coordinator":
      return prisma.coordinator.update({ where: { id }, data: { name: value } });
    case "reason":
      return prisma.reasonNotJoining.update({ where: { id }, data: { label: value } });
  }
}

type NormalizedItem = { id: string; label: string; sortOrder: number };

async function listNormalized(kind: LookupKind): Promise<NormalizedItem[]> {
  switch (kind) {
    case "centre": {
      const rows = await prisma.centre.findMany({ orderBy: { sortOrder: "asc" } });
      return rows.map((r) => ({ id: r.id, label: r.name, sortOrder: r.sortOrder }));
    }
    case "coordinator": {
      const rows = await prisma.coordinator.findMany({ orderBy: { sortOrder: "asc" } });
      return rows.map((r) => ({ id: r.id, label: r.name, sortOrder: r.sortOrder }));
    }
    case "reason": {
      const rows = await prisma.reasonNotJoining.findMany({ orderBy: { sortOrder: "asc" } });
      return rows.map((r) => ({ id: r.id, label: r.label, sortOrder: r.sortOrder }));
    }
  }
}

async function setSortOrder(kind: LookupKind, id: string, sortOrder: number) {
  switch (kind) {
    case "centre":
      return prisma.centre.update({ where: { id }, data: { sortOrder } });
    case "coordinator":
      return prisma.coordinator.update({ where: { id }, data: { sortOrder } });
    case "reason":
      return prisma.reasonNotJoining.update({ where: { id }, data: { sortOrder } });
  }
}

export async function reorderLookupItem(
  kind: LookupKind,
  id: string,
  direction: "up" | "down"
) {
  const items = await listNormalized(kind);
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return;
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= items.length) return;

  const a = items[index];
  const b = items[swapIndex];
  await Promise.all([
    setSortOrder(kind, a.id, b.sortOrder),
    setSortOrder(kind, b.id, a.sortOrder),
  ]);
}
