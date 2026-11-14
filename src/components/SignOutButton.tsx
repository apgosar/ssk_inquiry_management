"use client";

import { useFormStatus } from "react-dom";
import clsx from "clsx";

/** Must be rendered inside the <form action={logoutAction}>; shows progress until the redirect. */
export function SignOutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={pending ? "Signing out" : "Sign out"}
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-sm font-medium text-foreground transition-colors",
        "hover:border-primary/40 hover:bg-surface-muted active:scale-95",
        pending && "cursor-wait opacity-70"
      )}
    >
      {pending ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ) : (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
      )}
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
