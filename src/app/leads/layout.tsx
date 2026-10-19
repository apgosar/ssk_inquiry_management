import { ReactNode } from "react";
import { requireCoordinator } from "@/lib/auth";
import { logoutAction } from "@/lib/logout-action";
import { CoordinatorNav } from "./CoordinatorNav";

export default async function CoordinatorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireCoordinator();

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <header className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/95 px-4 py-3 backdrop-blur">
        <div>
          <p className="font-heading text-lg font-semibold leading-none text-foreground">
            Sanskar Shakti
          </p>
          <p className="text-xs text-muted">{session.name}</p>
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

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-5">
        {children}
      </main>

      <CoordinatorNav />
    </div>
  );
}
