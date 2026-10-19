export function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function telHref(phone: string): string {
  const digits = digitsOnly(phone);
  return `tel:${digits}`;
}

/** wa.me expects a full international number with no leading +. Assumes India (91) for bare 10-digit numbers. */
export function whatsappHref(phone: string): string {
  let digits = digitsOnly(phone);
  if (digits.length === 10) {
    digits = `91${digits}`;
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = `91${digits.slice(1)}`;
  }
  return `https://wa.me/${digits}`;
}
