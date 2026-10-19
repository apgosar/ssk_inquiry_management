import { Select, inputClass, FieldLabel } from "@/components/fields";
import { Button } from "@/components/Button";
import { format, startOfMonth, startOfYear, subMonths } from "date-fns";

type Option = { id: string; name: string };

export function FilterBar({
  basePath,
  from,
  to,
  centres,
  coordinators,
  centreId,
  coordinatorId,
}: {
  basePath: string;
  from: string;
  to: string;
  centres: Option[];
  coordinators: Option[];
  centreId?: string;
  coordinatorId?: string;
}) {
  const today = format(new Date(), "yyyy-MM-dd");
  const presets = [
    { label: "Last 3 months", from: format(startOfMonth(subMonths(new Date(), 2)), "yyyy-MM-dd") },
    { label: "Last 6 months", from: format(startOfMonth(subMonths(new Date(), 5)), "yyyy-MM-dd") },
    { label: "This year", from: format(startOfYear(new Date()), "yyyy-MM-dd") },
    { label: "Last 12 months", from: format(startOfMonth(subMonths(new Date(), 11)), "yyyy-MM-dd") },
  ];

  function presetHref(presetFrom: string) {
    const params = new URLSearchParams();
    params.set("from", presetFrom);
    params.set("to", today);
    if (centreId) params.set("centreId", centreId);
    if (coordinatorId) params.set("coordinatorId", coordinatorId);
    return `${basePath}?${params.toString()}`;
  }

  return (
    <form
      method="get"
      action={basePath}
      className="mb-5 rounded-2xl border border-border bg-surface p-4"
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {presets.map((p) => (
          <a
            key={p.label}
            href={presetHref(p.from)}
            className="rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-foreground hover:border-primary/40"
          >
            {p.label}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <FieldLabel htmlFor="from" className="text-xs">
            From
          </FieldLabel>
          <input id="from" name="from" type="date" defaultValue={from} className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="to" className="text-xs">
            To
          </FieldLabel>
          <input id="to" name="to" type="date" defaultValue={to} className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="centreId" className="text-xs">
            Centre
          </FieldLabel>
          <Select id="centreId" name="centreId" defaultValue={centreId || ""}>
            <option value="">All centres</option>
            {centres.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <FieldLabel htmlFor="coordinatorId" className="text-xs">
            Coordinator
          </FieldLabel>
          <Select id="coordinatorId" name="coordinatorId" defaultValue={coordinatorId || ""}>
            <option value="">All coordinators</option>
            {coordinators.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-3">
        <Button type="submit" size="sm">
          Apply filters
        </Button>
      </div>
    </form>
  );
}
