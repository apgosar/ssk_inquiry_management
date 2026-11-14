"use client";

import { startTransition, useActionState, useEffect, useState, useSyncExternalStore } from "react";
import { inputClass, FieldGroup, FieldLabel, Select } from "@/components/fields";
import { Button } from "@/components/Button";
import type { LeadFormState } from "@/lib/lead-schema";
import { localDateString } from "@/lib/dates";
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE, normalizeCountryCode } from "@/lib/phone";
import { checkDuplicatesAction, type DuplicateMatch } from "@/app/leads/duplicates";
import { statusLabel } from "@/components/StatusPill";
import { format } from "date-fns";

type Option = { id: string; label: string };
type ReasonOption = Option & { requiresDetail: boolean };

export function LeadForm({
  action,
  centres,
  coordinators,
  reasons,
  defaultValues,
  submitLabel,
  checkDuplicates = false,
}: {
  action: (state: LeadFormState, formData: FormData) => Promise<LeadFormState>;
  centres: Option[];
  coordinators: Option[];
  reasons: ReasonOption[];
  defaultValues?: Partial<{
    dateOfInquiry: string;
    motherName: string;
    countryCode: string;
    contactNumber: string;
    centreId: string;
    motherLocation: string;
    coordinatorId: string;
    status: string;
    reasonNotJoiningIds: string[];
    otherReason: string;
    enrollmentDate: string;
    notes: string;
  }>;
  submitLabel: string;
  /** Warn when the name or mobile number matches an existing inquiry (new-inquiry page only). */
  checkDuplicates?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const values = { ...defaultValues, ...state.values };
  const [status, setStatus] = useState(values.status || "PENDING");
  // The user's local "today". Empty on the server, filled in right after hydration (no mismatch).
  const today = useSyncExternalStore(
    () => () => {},
    () => localDateString(),
    () => ""
  );
  const [pickedInquiryDate, setInquiryDate] = useState(values.dateOfInquiry || "");
  // A new inquiry starts on today's date; an edited one keeps its own.
  const inquiryDate = pickedInquiryDate || today;
  const [enrollmentDate, setEnrollmentDate] = useState(values.enrollmentDate || "");
  const [reasonIds, setReasonIds] = useState<string[]>(defaultValues?.reasonNotJoiningIds ?? []);
  const [reasonError, setReasonError] = useState("");
  const [otherReason, setOtherReason] = useState(values.otherReason || "");
  const reasonNeedsDetail = reasons.some((r) => reasonIds.includes(r.id) && r.requiresDetail);

  const [motherName, setMotherName] = useState(values.motherName || "");
  const initialCode = values.countryCode || DEFAULT_COUNTRY_CODE;
  const [codeChoice, setCodeChoice] = useState(
    COUNTRY_CODES.some((c) => c.code === initialCode) ? initialCode : "other"
  );
  const [customCode, setCustomCode] = useState(
    COUNTRY_CODES.some((c) => c.code === initialCode) ? "" : initialCode
  );
  const countryCode = codeChoice === "other" ? normalizeCountryCode(customCode) : codeChoice;
  const [contactNumber, setContactNumber] = useState(values.contactNumber || "");

  // Looks for an existing inquiry with the same name or mobile number, shortly after typing stops.
  const dupQuery = `${motherName.trim()}|${countryCode}|${contactNumber}`;
  const [dup, setDup] = useState<{ key: string; matches: DuplicateMatch[] }>({ key: "", matches: [] });
  useEffect(() => {
    if (!checkDuplicates) return;
    const nameOk = motherName.trim().length >= 3;
    const numberOk = contactNumber.length >= (countryCode === "+91" ? 10 : 5);
    if (!countryCode || (!nameOk && !numberOk)) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const matches = await checkDuplicatesAction(motherName, countryCode, contactNumber);
        if (!cancelled) setDup({ key: dupQuery, matches });
      } catch {
        /* a failed check must never get in the way of entering the inquiry */
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [checkDuplicates, motherName, countryCode, contactNumber, dupQuery]);
  const duplicates = dup.key === dupQuery ? dup.matches : [];
  const errors = state.fieldErrors || {};

  // Picking Enrolled defaults the enrollment date to today in the user's own timezone.
  function handleStatusChange(next: string) {
    setStatus(next);
    if (next === "ENROLLED" && !enrollmentDate) {
      // Today, but never before the inquiry date.
      setEnrollmentDate(inquiryDate && inquiryDate > today ? inquiryDate : today);
    }
  }

  return (
    // Submitting via onSubmit (instead of action={...}) stops React 19 from resetting the form
    // after the action finishes, which would wipe the user's entries when the server rejects them.
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (status === "NOT_JOINING" && reasonIds.length === 0) {
          setReasonError("Select at least one reason for not joining.");
          return;
        }
        const formData = new FormData(e.currentTarget);
        startTransition(() => formAction(formData));
      }}
      className="pb-4"
    >
      <FieldGroup>
        <FieldLabel htmlFor="dateOfInquiry">Date of inquiry</FieldLabel>
        <input
          id="dateOfInquiry"
          name="dateOfInquiry"
          type="date"
          required
          max={today || undefined}
          value={inquiryDate}
          onChange={(e) => setInquiryDate(e.target.value)}
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
          value={motherName}
          onChange={(e) => setMotherName(e.target.value)}
          autoComplete="off"
          className={inputClass}
          placeholder="Full name"
        />
        {errors.motherName && <FieldError message={errors.motherName} />}
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="contactNumber">Contact number</FieldLabel>
        <div className="flex gap-2">
          <div className="w-[8.5rem] shrink-0">
            <Select
              aria-label="Country code"
              value={codeChoice}
              onChange={(e) => setCodeChoice(e.target.value)}
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} {c.label}
                </option>
              ))}
              <option value="other">Other…</option>
            </Select>
          </div>
          <input
            id="contactNumber"
            name="contactNumber"
            type="tel"
            inputMode="numeric"
            required
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, "").slice(0, 14))}
            pattern={countryCode === "+91" ? "[0-9]{10}" : "[0-9]{5,14}"}
            title={countryCode === "+91" ? "Enter a 10-digit mobile number" : "Enter the mobile number without the country code"}
            autoComplete="off"
            className={inputClass}
            placeholder={countryCode === "+91" ? "10-digit mobile number" : "Mobile number"}
          />
        </div>
        {codeChoice === "other" && (
          <input
            type="text"
            inputMode="tel"
            aria-label="Other country code"
            required
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value.replace(/[^\d+]/g, "").slice(0, 5))}
            className={`${inputClass} mt-2`}
            placeholder="Country code, e.g. +33"
          />
        )}
        <input type="hidden" name="countryCode" value={countryCode} />
        {errors.countryCode && <FieldError message={errors.countryCode} />}
        {errors.contactNumber && <FieldError message={errors.contactNumber} />}
        {duplicates.length > 0 && <DuplicateWarning matches={duplicates} />}
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
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          <option value="PENDING">Pending / On Hold</option>
          <option value="ENROLLED">Enrolled</option>
          <option value="NOT_JOINING">Not Joining</option>
        </Select>
      </FieldGroup>

      {status === "ENROLLED" && (
        <FieldGroup>
          <FieldLabel htmlFor="enrollmentDate">Date of enrollment</FieldLabel>
          <input
            id="enrollmentDate"
            name="enrollmentDate"
            type="date"
            required
            min={inquiryDate || undefined}
            value={enrollmentDate}
            onChange={(e) => setEnrollmentDate(e.target.value)}
            className={inputClass}
          />
          {errors.enrollmentDate && <FieldError message={errors.enrollmentDate} />}
        </FieldGroup>
      )}

      {status === "NOT_JOINING" && (
        <FieldGroup>
          <fieldset>
            <legend className="mb-1.5 block text-sm font-medium text-foreground">
              Reasons for not joining
            </legend>
            <p className="mb-2 text-xs text-muted">Select all that apply.</p>
            <div className="space-y-2">
              {reasons.map((r) => {
                const checked = reasonIds.includes(r.id);
                return (
                  <label
                    key={r.id}
                    className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 text-sm ${
                      checked ? "border-primary bg-primary-soft" : "border-border bg-surface"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="reasonNotJoiningIds"
                      value={r.id}
                      checked={checked}
                      onChange={() => {
                        setReasonError("");
                        setReasonIds((prev) =>
                          prev.includes(r.id) ? prev.filter((x) => x !== r.id) : [...prev, r.id]
                        );
                      }}
                      className="h-5 w-5 shrink-0 accent-primary"
                    />
                    <span>{r.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          {(reasonError || errors.reasonNotJoiningIds) && (
            <FieldError message={reasonError || errors.reasonNotJoiningIds || ""} />
          )}
        </FieldGroup>
      )}

      {status === "NOT_JOINING" && reasonNeedsDetail && (
        <FieldGroup>
          <FieldLabel htmlFor="otherReason">Please specify the reason</FieldLabel>
          <textarea
            id="otherReason"
            name="otherReason"
            rows={3}
            required
            maxLength={500}
            value={otherReason}
            onChange={(e) => setOtherReason(e.target.value)}
            className={inputClass}
            placeholder="Type the reason for not joining…"
          />
          {errors.otherReason && <FieldError message={errors.otherReason} />}
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

function DuplicateWarning({ matches }: { matches: DuplicateMatch[] }) {
  const numberMatch = matches.some((m) => m.sameNumber);
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`mt-3 rounded-xl border p-3 text-sm ${
        numberMatch
          ? "border-not-joining bg-not-joining-soft text-foreground"
          : "border-pending bg-pending-soft text-foreground"
      }`}
    >
      <p className="font-semibold">
        {numberMatch
          ? "This mobile number is already in the system"
          : "An inquiry with this name already exists"}
      </p>
      <p className="mb-2 text-xs text-muted">
        You can still save, but check this isn&apos;t a duplicate first.
      </p>
      <ul className="space-y-2">
        {matches.map((m) => (
          <li key={m.id} className="rounded-lg bg-surface/70 px-3 py-2">
            <p className="font-medium">
              {m.motherName}{" "}
              <span className="text-xs font-normal text-muted">
                ({[m.sameNumber && "same mobile number", m.sameName && "same name"]
                  .filter(Boolean)
                  .join(" and ")})
              </span>
            </p>
            <p className="text-xs text-muted">
              {format(new Date(`${m.dateOfInquiry}T00:00:00`), "d MMM yyyy")} · {m.centre} · {statusLabel(m.status)} ·
              handled by {m.handledBy}
              {m.mine && (
                <>
                  {" · "}
                  <a
                    href={`/leads/${m.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline"
                  >
                    Open
                  </a>
                </>
              )}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
