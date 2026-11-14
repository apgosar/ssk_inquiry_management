export const DEFAULT_COUNTRY_CODE = "+91";

/** Common country codes offered in the form's dropdown; anything else can be typed via "Other". */
export const COUNTRY_CODES: { code: string; label: string }[] = [
  { code: "+91", label: "India" },
  { code: "+1", label: "USA / Canada" },
  { code: "+44", label: "UK" },
  { code: "+971", label: "UAE" },
  { code: "+61", label: "Australia" },
  { code: "+65", label: "Singapore" },
  { code: "+64", label: "New Zealand" },
  { code: "+254", label: "Kenya" },
  { code: "+27", label: "South Africa" },
  { code: "+966", label: "Saudi Arabia" },
  { code: "+974", label: "Qatar" },
  { code: "+968", label: "Oman" },
];

export function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** "91", " +91", "+ 91" -> "+91". Returns "" when there are no digits. */
export function normalizeCountryCode(raw: string): string {
  const digits = digitsOnly(raw);
  return digits ? `+${digits}` : "";
}

/** The number without its country code, digits only (a leading trunk "0" is dropped for India). */
export function nationalDigits(phone: string, countryCode: string = DEFAULT_COUNTRY_CODE): string {
  let digits = digitsOnly(phone);
  if (countryCode === "+91") {
    if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
    else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  }
  return digits;
}

export function formatPhone(phone: string, countryCode: string = DEFAULT_COUNTRY_CODE): string {
  return `${countryCode} ${phone}`;
}

export function telHref(phone: string, countryCode: string = DEFAULT_COUNTRY_CODE): string {
  return `tel:+${digitsOnly(countryCode)}${nationalDigits(phone, countryCode)}`;
}

/** wa.me expects the full international number with no leading +. */
export function whatsappHref(phone: string, countryCode: string = DEFAULT_COUNTRY_CODE): string {
  return `https://wa.me/${digitsOnly(countryCode)}${nationalDigits(phone, countryCode)}`;
}
