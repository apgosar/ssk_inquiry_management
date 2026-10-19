import { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={clsx(
        "bg-surface border border-border rounded-2xl shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
