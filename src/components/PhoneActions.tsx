import { telHref, whatsappHref } from "@/lib/phone";
import { LinkButton } from "@/components/Button";

export function PhoneActions({
  phone,
  size = "sm",
}: {
  phone: string;
  size?: "sm" | "md";
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <LinkButton href={telHref(phone)} variant="outline" size={size} aria-label={`Call ${phone}`}>
        <PhoneIcon /> Call
      </LinkButton>
      <LinkButton
        href={whatsappHref(phone)}
        variant="whatsapp"
        size={size}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`WhatsApp ${phone}`}
      >
        <WhatsAppIcon /> WhatsApp
      </LinkButton>
    </span>
  );
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.56.57 1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.49a1 1 0 011 1 11.36 11.36 0 00.57 3.56 1 1 0 01-.25 1.02l-2.2 2.21z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.29-.15-1.73-.85-2-.95-.27-.1-.46-.15-.66.15-.2.29-.76.94-.93 1.14-.17.2-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.76-1.44-1.71-1.6-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.51-.07-.15-.66-1.59-.91-2.18-.24-.57-.48-.5-.66-.5h-.56c-.2 0-.51.07-.78.37-.27.29-1.02 1-1.02 2.44s1.05 2.83 1.19 3.02c.15.2 2.06 3.15 5 4.42.7.3 1.24.48 1.67.61.7.22 1.34.19 1.84.12.56-.08 1.73-.71 1.98-1.39.24-.68.24-1.27.17-1.39-.07-.12-.27-.2-.56-.34z" />
      <path d="M12.04 2C6.58 2 2.15 6.42 2.15 11.87c0 1.86.52 3.6 1.42 5.09L2 22l5.19-1.53a9.8 9.8 0 004.84 1.27h.01c5.46 0 9.89-4.42 9.89-9.87S17.5 2 12.04 2zm0 17.87h-.01a8.2 8.2 0 01-4.18-1.14l-.3-.18-3.08.91.92-3-.19-.31a8.14 8.14 0 01-1.26-4.28c0-4.51 3.68-8.18 8.2-8.18a8.14 8.14 0 018.19 8.18c0 4.51-3.68 8.2-8.19 8.2z" />
    </svg>
  );
}
