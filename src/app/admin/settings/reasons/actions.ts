"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import * as svc from "@/lib/lookup-service";

const PATH = "/admin/settings/reasons";

export async function createReasonAction(formData: FormData) {
  await requireAdmin();
  await svc.createLookupItem("reason", String(formData.get("label") || ""));
  revalidatePath(PATH);
}

export async function toggleReasonAction(formData: FormData) {
  await requireAdmin();
  await svc.setLookupActive(
    "reason",
    String(formData.get("id")),
    formData.get("active") === "true"
  );
  revalidatePath(PATH);
}

export async function renameReasonAction(formData: FormData) {
  await requireAdmin();
  await svc.renameLookupItem(
    "reason",
    String(formData.get("id")),
    String(formData.get("label") || "")
  );
  revalidatePath(PATH);
}

export async function moveReasonAction(formData: FormData) {
  await requireAdmin();
  await svc.reorderLookupItem(
    "reason",
    String(formData.get("id")),
    formData.get("direction") as "up" | "down"
  );
  revalidatePath(PATH);
}
