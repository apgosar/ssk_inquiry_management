import type { Metadata } from "next";
import { Cormorant_Garamond, Albert_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const albertSans = Albert_Sans({
  variable: "--font-albert",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sanskar Shakti | Leads",
  description: "Inquiry and lead management for Sanskar Shakti",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${albertSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
