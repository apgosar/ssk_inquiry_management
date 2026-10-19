"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import * as svc from "@/lib/lookup-service";

const PATH = "/admin/settings/centres";

export async function createCentreAction(formData: FormData) {
  await requireAdmin();
  await svc.createLookupItem("centre", String(formData.get("label") || ""));
  revalidatePath(PATH);
}

export async function toggleCentreAction(formData: FormData) {
  await requireAdmin();
  await svc.setLookupActive(
    "centre",
    String(formData.get("id")),
    formData.get("active") === "true"
  );
  revalidatePath(PATH);
}

export async function renameCentreAction(formData: FormData) {
  await requireAdmin();
  await svc.renameLookupItem(
    "centre",
    String(formData.get("id")),
    String(formData.get("label") || "")
  );
  revalidatePath(PATH);
}

export async function moveCentreAction(formData: FormData) {
  await requireAdmin();
  await svc.reorderLookupItem(
    "centre",
    String(formData.get("id")),
    formData.get("direction") as "up" | "down"
  );
  revalidatePath(PATH);
}
