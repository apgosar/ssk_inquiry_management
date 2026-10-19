"use client";

import { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/Button";

export function ConfirmSubmitButton({
  confirmMessage,
  children,
  ...props
}: ComponentProps<typeof Button> & {
  confirmMessage: string;
  children: ReactNode;
}) {
  return (
    <Button
      {...props}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </Button>
  );
}
