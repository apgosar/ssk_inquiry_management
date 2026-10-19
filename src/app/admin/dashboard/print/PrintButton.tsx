"use client";

import { Button } from "@/components/Button";

export function PrintButton() {
  return (
    <Button size="sm" onClick={() => window.print()} className="no-print">
      Print / Save as PDF
    </Button>
  );
}
