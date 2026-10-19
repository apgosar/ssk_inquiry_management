import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { getAllCentres, getAllCoordinators } from "@/lib/lookups";
import { buildLeadWhere, type LeadSearchParams } from "@/lib/lead-filters";
import { LeadsFilterBar } from "./LeadsFilterBar";
import { StatusPill } from "@/components/StatusPill";
import { PhoneActions } from "@/components/PhoneActions";
import { LinkButton } from "@/components/Button";

const PAGE_SIZE = 50;

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<LeadSearchParams & { page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const where = buildLeadWhere(params);

  const [leads, total, centres, coordinators] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: { centre: true, coordinator: true, reasonNotJoining: true },
      orderBy: { dateOfInquiry: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.lead.count({ where }),
    getAllCentres(),
    getAllCoordinators(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const exportQuery = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v) as [string, string][]
  ).toString();

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">All Leads</h1>
          <p className="text-sm text-muted">{total} matching leads</p>
        </div>
        <div className="flex gap-2">
          <LinkButton href={`/api/export/xlsx?${exportQuery}`} variant="outline" size="sm">
            Export XLSX
          </LinkButton>
          <LinkButton href={`/api/export/pdf?${exportQuery}`} variant="outline" size="sm" target="_blank">
            Export PDF
          </LinkButton>
        </div>
      </div>

      <LeadsFilterBar
        from={params.from || ""}
        to={params.to || ""}
        centres={centres}
        coordinators={coordinators}
        centreId={params.centreId}
        coordinatorId={params.coordinatorId}
        status={params.status}
        q={params.q}
      />

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Mother</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Centre</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Coordinator</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-border last:border-0">
                <td className="whitespace-nowrap px-4 py-3">
                  {format(lead.dateOfInquiry, "d MMM yyyy")}
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{lead.motherName}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="whitespace-nowrap">{lead.contactNumber}</span>
                    <PhoneActions phone={lead.contactNumber} />
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">{lead.centre.name}</td>
                <td className="px-4 py-3">{lead.motherLocation}</td>
                <td className="whitespace-nowrap px-4 py-3">{lead.coordinator.name}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <StatusPill status={lead.status} />
                </td>
                <td className="px-4 py-3 text-xs text-muted">
                  {lead.reasonNotJoining?.label || "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Link href={`/admin/leads/${lead.id}`} className="text-sm font-medium text-primary">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted">
                  No leads match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/leads?${new URLSearchParams({
                ...(Object.fromEntries(
                  Object.entries(params).filter(([, v]) => v)
                ) as Record<string, string>),
                page: String(p),
              }).toString()}`}
              className={
                p === page
                  ? "rounded-full bg-primary px-3 py-1 text-white"
                  : "rounded-full border border-border px-3 py-1 text-foreground"
              }
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
