import { LoginForm } from "./LoginForm";
import { Card } from "@/components/Card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="mb-8 text-center">
        <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-heading text-2xl">
          S
        </div>
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          Sanskar Shakti
        </h1>
        <p className="mt-1 text-sm uppercase tracking-wide text-muted">
          Lead Management
        </p>
      </div>

      <Card className="w-full max-w-sm p-6 sm:p-8">
        <LoginForm />
      </Card>

      <p className="mt-6 text-xs text-muted">
        Accounts are created by an admin. Contact your coordinator lead if you
        need access.
      </p>
    </main>
  );
}
