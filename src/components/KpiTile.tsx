import clsx from "clsx";
import { Card } from "@/components/Card";

export function KpiTile({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "pending" | "enrolled" | "notJoining";
}) {
  const toneClass = {
    default: "text-foreground",
    pending: "text-pending",
    enrolled: "text-enrolled",
    notJoining: "text-not-joining",
  }[tone];

  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className={clsx("mt-1 font-heading text-3xl font-semibold", toneClass)}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </Card>
  );
}
