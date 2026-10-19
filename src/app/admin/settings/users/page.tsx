import { prisma } from "@/lib/db";
import { getAllCoordinators } from "@/lib/lookups";
import { Card } from "@/components/Card";
import { CreateUserForm } from "./CreateUserForm";
import { toggleUserActiveAction, resetPasswordAction } from "./actions";
import { inputClass } from "@/components/fields";
import clsx from "clsx";

export default async function UsersSettingsPage() {
  const [users, coordinators] = await Promise.all([
    prisma.user.findMany({
      include: { coordinator: true },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    }),
    getAllCoordinators(),
  ]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Users</h1>
      <p className="mb-5 text-sm text-muted">
        Create login accounts for coordinators and other admins. There is no public
        sign-up — access is only granted here.
      </p>

      <Card className="mb-6 p-4 sm:p-5">
        <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
          Add account
        </h2>
        <CreateUserForm coordinators={coordinators.map((c) => ({ id: c.id, name: c.name }))} />
      </Card>

      <div className="space-y-2">
        {users.map((user) => (
          <Card key={user.id} className="flex flex-wrap items-center gap-3 p-3">
            <div className="min-w-[160px] flex-1">
              <p className="font-medium text-foreground">
                {user.name}{" "}
                <span
                  className={clsx(
                    "ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                    user.role === "ADMIN"
                      ? "bg-primary-soft text-primary"
                      : "bg-surface-muted text-muted"
                  )}
                >
                  {user.role}
                </span>
              </p>
              <p className="text-xs text-muted">
                {user.email}
                {user.coordinator ? ` · linked to ${user.coordinator.name}` : ""}
              </p>
            </div>

            <form action={resetPasswordAction} className="flex shrink-0 gap-2">
              <input type="hidden" name="id" value={user.id} />
              <input
                name="password"
                type="text"
                placeholder="New password"
                minLength={6}
                className={clsx(inputClass, "w-36 py-1.5 text-sm")}
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg border border-border px-3 text-xs font-medium text-foreground"
              >
                Reset
              </button>
            </form>

            <form action={toggleUserActiveAction} className="shrink-0">
              <input type="hidden" name="id" value={user.id} />
              <input type="hidden" name="active" value={(!user.active).toString()} />
              <button
                type="submit"
                className={clsx(
                  "rounded-full px-3 py-1.5 text-xs font-semibold",
                  user.active ? "bg-enrolled-soft text-enrolled" : "bg-surface-muted text-muted"
                )}
              >
                {user.active ? "Active" : "Inactive"}
              </button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
