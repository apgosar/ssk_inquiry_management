import { Select, inputClass, FieldLabel } from "@/components/fields";
import { Button } from "@/components/Button";

type Option = { id: string; name: string };

export function LeadsFilterBar({
  from,
  to,
  centres,
  coordinators,
  centreId,
  coordinatorId,
  status,
  q,
}: {
  from: string;
  to: string;
  centres: Option[];
  coordinators: Option[];
  centreId?: string;
  coordinatorId?: string;
  status?: string;
  q?: string;
}) {
  return (
    <form
      method="get"
      action="/admin/leads"
      className="mb-5 rounded-2xl border border-border bg-surface p-4"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="col-span-2 sm:col-span-3 lg:col-span-2">
          <FieldLabel htmlFor="q" className="text-xs">
            Search name or phone
          </FieldLabel>
          <input id="q" name="q" type="text" defaultValue={q} className={inputClass} placeholder="Search…" />
        </div>
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
          <FieldLabel htmlFor="status" className="text-xs">
            Status
          </FieldLabel>
          <Select id="status" name="status" defaultValue={status || ""}>
            <option value="">All statuses</option>
            <option value="PENDING">Pending / On Hold</option>
            <option value="ENROLLED">Enrolled</option>
            <option value="NOT_JOINING">Not Joining</option>
          </Select>
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
