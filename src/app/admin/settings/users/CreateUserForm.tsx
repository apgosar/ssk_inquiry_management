"use client";

import { useActionState, useState } from "react";
import { createUserAction, type UserFormState } from "./actions";
import { inputClass, FieldGroup, FieldLabel, Select } from "@/components/fields";
import { Button } from "@/components/Button";

type Option = { id: string; name: string };

const initialState: UserFormState = {};

export function CreateUserForm({ coordinators }: { coordinators: Option[] }) {
  const [state, formAction, pending] = useActionState(createUserAction, initialState);
  const [role, setRole] = useState<"ADMIN" | "COORDINATOR">("COORDINATOR");

  return (
    <form action={formAction}>
      <div className="grid gap-3 sm:grid-cols-2">
        <FieldGroup>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <input id="name" name="name" type="text" required className={inputClass} />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <input id="email" name="email" type="email" required className={inputClass} />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="password">Temporary password</FieldLabel>
          <input
            id="password"
            name="password"
            type="text"
            required
            minLength={6}
            className={inputClass}
            placeholder="At least 6 characters"
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="role">Role</FieldLabel>
          <Select
            id="role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as "ADMIN" | "COORDINATOR")}
          >
            <option value="COORDINATOR">Coordinator</option>
            <option value="ADMIN">Admin</option>
          </Select>
        </FieldGroup>
        {role === "COORDINATOR" && (
          <FieldGroup>
            <FieldLabel htmlFor="coordinatorId">Links to coordinator (optional)</FieldLabel>
            <Select id="coordinatorId" name="coordinatorId" defaultValue="">
              <option value="">Not linked</option>
              {coordinators.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FieldGroup>
        )}
      </div>

      {state.error && <p className="mb-3 text-sm text-not-joining">{state.error}</p>}

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}
