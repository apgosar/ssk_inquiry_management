import clsx from "clsx";
import type { LeadStatus } from "@prisma/client";

const STATUS_LABEL: Record<LeadStatus, string> = {
  PENDING: "Pending / On Hold",
  ENROLLED: "Enrolled",
  NOT_JOINING: "Not Joining",
};

const STATUS_CLASSES: Record<LeadStatus, string> = {
  PENDING: "bg-pending-soft text-pending",
  ENROLLED: "bg-enrolled-soft text-enrolled",
  NOT_JOINING: "bg-not-joining-soft text-not-joining",
};

export function statusLabel(status: LeadStatus): string {
  return STATUS_LABEL[status];
}

export function StatusPill({ status }: { status: LeadStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        STATUS_CLASSES[status]
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
