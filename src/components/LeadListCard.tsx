import Link from "next/link";
import { Card } from "@/components/Card";
import { StatusPill } from "@/components/StatusPill";
import { PhoneActions } from "@/components/PhoneActions";
import { format } from "date-fns";

export type LeadListItem = {
  id: string;
  dateOfInquiry: Date;
  motherName: string;
  contactNumber: string;
  motherLocation: string;
  status: "PENDING" | "ENROLLED" | "NOT_JOINING";
  centre: { name: string };
  coordinator: { name: string };
};

export function LeadListCard({
  lead,
  href,
  showCoordinator = false,
}: {
  lead: LeadListItem;
  href: string;
  showCoordinator?: boolean;
}) {
  return (
    <Card className="p-4 hover:border-primary/40 transition-colors">
      <Link href={href} className="block">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-heading text-lg font-semibold text-foreground">
              {lead.motherName}
            </p>
            <p className="text-xs text-muted">
              {format(lead.dateOfInquiry, "d MMM yyyy")} · {lead.centre.name}
              {showCoordinator ? ` · ${lead.coordinator.name}` : ""}
            </p>
            <p className="mt-0.5 text-xs text-muted">{lead.motherLocation}</p>
          </div>
          <StatusPill status={lead.status} />
        </div>
      </Link>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-sm text-foreground">{lead.contactNumber}</span>
        <PhoneActions phone={lead.contactNumber} />
      </div>
    </Card>
  );
}
