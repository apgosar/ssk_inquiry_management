import { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/lib/logout-action";
import { AdminNav } from "./AdminNav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen">
      <header className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/95 px-4 py-3 backdrop-blur">
        <div>
          <p className="font-heading text-lg font-semibold leading-none text-foreground">
            Sanskar Shakti
          </p>
          <p className="text-xs text-muted">{session.name} · Admin</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-xs font-medium text-muted underline underline-offset-2"
          >
            Sign out
          </button>
        </form>
      </header>
      <AdminNav />
      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
