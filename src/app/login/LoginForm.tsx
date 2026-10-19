"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";
import { inputClass, FieldGroup, FieldLabel } from "@/components/fields";
import { Button } from "@/components/Button";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction}>
      <FieldGroup>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className={inputClass}
          placeholder="you@sanskarshakti.org"
        />
      </FieldGroup>
      <FieldGroup>
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
          placeholder="••••••••"
        />
      </FieldGroup>

      {state.error && (
        <p className="mb-4 text-sm text-not-joining">{state.error}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
