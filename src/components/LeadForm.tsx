"use client";

import { useActionState, useState } from "react";
import { inputClass, FieldGroup, FieldLabel, Select } from "@/components/fields";
import { Button } from "@/components/Button";
import type { LeadFormState } from "@/lib/lead-schema";

type Option = { id: string; label: string };

export function LeadForm({
  action,
  centres,
  coordinators,
  reasons,
  defaultValues,
  submitLabel,
}: {
  action: (state: LeadFormState, formData: FormData) => Promise<LeadFormState>;
  centres: Option[];
  coordinators: Option[];
  reasons: Option[];
  defaultValues?: Partial<{
    dateOfInquiry: string;
    motherName: string;
    contactNumber: string;
    centreId: string;
    motherLocation: string;
    coordinatorId: string;
    status: string;
    reasonNotJoiningId: string;
    notes: string;
  }>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const values = { ...defaultValues, ...state.values };
  const [status, setStatus] = useState(values.status || "PENDING");
  const errors = state.fieldErrors || {};

  return (
    <form action={formAction} className="pb-4">
      <FieldGroup>
        <FieldLabel htmlFor="dateOfInquiry">Date of inquiry</FieldLabel>
        <input
          id="dateOfInquiry"
          name="dateOfInquiry"
          type="date"
          required
          defaultValue={values.dateOfInquiry}
          className={inputClass}
        />
        {errors.dateOfInquiry && <FieldError message={errors.dateOfInquiry} />}
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="motherName">Name of mother</FieldLabel>
        <input
          id="motherName"
          name="motherName"
          type="text"
          required
          defaultValue={values.motherName}
          className={inputClass}
          placeholder="Full name"
        />
        {errors.motherName && <FieldError message={errors.motherName} />}
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="contactNumber">Contact number</FieldLabel>
        <input
          id="contactNumber"
          name="contactNumber"
          type="tel"
          inputMode="tel"
          required
          defaultValue={values.contactNumber}
          className={inputClass}
          placeholder="10-digit mobile number"
        />
        {errors.contactNumber && <FieldError message={errors.contactNumber} />}
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="centreId">Centre</FieldLabel>
        <Select id="centreId" name="centreId" required defaultValue={values.centreId || ""}>
          <option value="" disabled>
            Select centre
          </option>
          {centres.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </Select>
        {errors.centreId && <FieldError message={errors.centreId} />}
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="motherLocation">Location of mother</FieldLabel>
        <input
          id="motherLocation"
          name="motherLocation"
          type="text"
          required
          defaultValue={values.motherLocation}
          className={inputClass}
          placeholder="City / area"
        />
        {errors.motherLocation && <FieldError message={errors.motherLocation} />}
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="coordinatorId">Inquiry handled by</FieldLabel>
        <Select
          id="coordinatorId"
          name="coordinatorId"
          required
          defaultValue={values.coordinatorId || ""}
        >
          <option value="" disabled>
            Select coordinator
          </option>
          {coordinators.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </Select>
        {errors.coordinatorId && <FieldError message={errors.coordinatorId} />}
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="status">Status</FieldLabel>
        <Select
          id="status"
          name="status"
          required
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="PENDING">Pending / On Hold</option>
          <option value="ENROLLED">Enrolled</option>
          <option value="NOT_JOINING">Not Joining</option>
        </Select>
      </FieldGroup>

      {status === "NOT_JOINING" && (
        <FieldGroup>
          <FieldLabel htmlFor="reasonNotJoiningId">Reason for not joining</FieldLabel>
          <Select
            id="reasonNotJoiningId"
            name="reasonNotJoiningId"
            required={status === "NOT_JOINING"}
            defaultValue={values.reasonNotJoiningId || ""}
          >
            <option value="" disabled>
              Select reason
            </option>
            {reasons.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </Select>
          {errors.reasonNotJoiningId && (
            <FieldError message={errors.reasonNotJoiningId} />
          )}
        </FieldGroup>
      )}

      <FieldGroup>
        <FieldLabel htmlFor="notes">Notes / remarks</FieldLabel>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={values.notes}
          className={inputClass}
          placeholder="Any follow-up notes…"
        />
      </FieldGroup>

      {state.error && <p className="mb-4 text-sm text-not-joining">{state.error}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}

function FieldError({ message }: { message: string }) {
  return <p className="mt-1.5 text-xs text-not-joining">{message}</p>;
}
