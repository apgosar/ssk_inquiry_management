import { LabelHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import clsx from "clsx";

export const inputClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

export function FieldLabel({
  className,
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { children: ReactNode }) {
  return (
    <label
      className={clsx("block text-sm font-medium text-foreground mb-1.5", className)}
      {...props}
    >
      {children}
    </label>
  );
}

export function FieldGroup({ children }: { children: ReactNode }) {
  return <div className="mb-5">{children}</div>;
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <div className="relative">
      <select
        className={clsx(inputClass, "appearance-none pr-10", className)}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
        width="14"
        height="14"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}
