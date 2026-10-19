"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";

const PATH = "/admin/settings/users";

export type UserFormState = { error?: string };

export async function createUserAction(
  _prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "COORDINATOR") as "ADMIN" | "COORDINATOR";
  const coordinatorId = String(formData.get("coordinatorId") || "") || null;

  if (!name || !email || password.length < 6) {
    return { error: "Name, email and a password of at least 6 characters are required." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      coordinatorId: role === "COORDINATOR" ? coordinatorId : null,
    },
  });

  revalidatePath(PATH);
  return {};
}

export async function toggleUserActiveAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  await prisma.user.update({ where: { id }, data: { active } });
  revalidatePath(PATH);
}

export async function resetPasswordAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const password = String(formData.get("password") || "");
  if (password.length < 6) return;
  const passwordHash = await hashPassword(password);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
  revalidatePath(PATH);
}
