"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import * as svc from "@/lib/lookup-service";

const PATH = "/admin/settings/coordinators";

export async function createCoordinatorAction(formData: FormData) {
  await requireAdmin();
  await svc.createLookupItem("coordinator", String(formData.get("label") || ""));
  revalidatePath(PATH);
}

export async function toggleCoordinatorAction(formData: FormData) {
  await requireAdmin();
  await svc.setLookupActive(
    "coordinator",
    String(formData.get("id")),
    formData.get("active") === "true"
  );
  revalidatePath(PATH);
}

export async function renameCoordinatorAction(formData: FormData) {
  await requireAdmin();
  await svc.renameLookupItem(
    "coordinator",
    String(formData.get("id")),
    String(formData.get("label") || "")
  );
  revalidatePath(PATH);
}

export async function moveCoordinatorAction(formData: FormData) {
  await requireAdmin();
  await svc.reorderLookupItem(
    "coordinator",
    String(formData.get("id")),
    formData.get("direction") as "up" | "down"
  );
  revalidatePath(PATH);
}
