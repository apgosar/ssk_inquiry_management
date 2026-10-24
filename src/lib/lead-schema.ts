import { z } from "zod";

export const leadSchema = z
  .object({
    dateOfInquiry: z.string().min(1, "Date of inquiry is required."),
    motherName: z.string().trim().min(1, "Name of mother is required."),
    contactNumber: z
      .string()
      .trim()
      .min(6, "Enter a valid contact number.")
      .max(20, "Enter a valid contact number."),
    centreId: z.string().min(1, "Select a centre."),
    motherLocation: z.string().trim().min(1, "Location of mother is required."),
    coordinatorId: z.string().min(1, "Select who handled the inquiry."),
    status: z.enum(["PENDING", "ENROLLED", "NOT_JOINING"]),
    reasonNotJoiningId: z.string().optional().or(z.literal("")),
    enrollmentDate: z.string().optional().or(z.literal("")),
    notes: z.string().trim().optional().or(z.literal("")),
  })
  .refine(
    (data) => data.status !== "NOT_JOINING" || !!data.reasonNotJoiningId,
    {
      message: "Select a reason for not joining.",
      path: ["reasonNotJoiningId"],
    }
  )
  .refine(
    // The server runs in UTC while users are in other timezones (India is ahead, the Americas
    // behind), so allow up to one day of slack. The form itself caps the picker at the user's
    // own local "today".
    (data) => data.dateOfInquiry <= new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    {
      message: "Date of inquiry can't be in the future.",
      path: ["dateOfInquiry"],
    }
  )
  .refine((data) => data.status !== "ENROLLED" || !!data.enrollmentDate, {
    message: "Select the date of enrollment.",
    path: ["enrollmentDate"],
  })
  .refine(
    // Both are YYYY-MM-DD strings, so string comparison is date comparison.
    (data) =>
      data.status !== "ENROLLED" || !data.enrollmentDate || data.enrollmentDate >= data.dateOfInquiry,
    {
      message: "Date of enrollment can't be before the date of inquiry.",
      path: ["enrollmentDate"],
    }
  );

export type LeadFormValues = z.infer<typeof leadSchema>;

export type LeadFormState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof LeadFormValues, string>>;
  values?: Record<string, string>;
};

export function parseLeadFormData(formData: FormData) {
  return leadSchema.safeParse({
    dateOfInquiry: formData.get("dateOfInquiry"),
    motherName: formData.get("motherName"),
    contactNumber: formData.get("contactNumber"),
    centreId: formData.get("centreId"),
    motherLocation: formData.get("motherLocation"),
    coordinatorId: formData.get("coordinatorId"),
    status: formData.get("status"),
    reasonNotJoiningId: formData.get("reasonNotJoiningId") ?? "",
    enrollmentDate: formData.get("enrollmentDate") ?? "",
    notes: formData.get("notes") ?? "",
  });
}

export function fieldErrorsFrom(
  error: z.ZodError<LeadFormValues>
): LeadFormState["fieldErrors"] {
  const out: LeadFormState["fieldErrors"] = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof LeadFormValues;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
