import { inputClass } from "@/components/fields";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import clsx from "clsx";

type Item = { id: string; label: string; active: boolean };

export function LookupTable({
  title,
  description,
  placeholder,
  items,
  createAction,
  toggleAction,
  renameAction,
  moveAction,
}: {
  title: string;
  description: string;
  placeholder: string;
  items: Item[];
  createAction: (formData: FormData) => void;
  toggleAction: (formData: FormData) => void;
  renameAction: (formData: FormData) => void;
  moveAction: (formData: FormData) => void;
}) {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">{title}</h1>
      <p className="mb-5 text-sm text-muted">{description}</p>

      <Card className="mb-6 p-4">
        <form action={createAction} className="flex flex-col gap-2 sm:flex-row">
          <input
            name="label"
            type="text"
            required
            placeholder={placeholder}
            className={inputClass}
          />
          <Button type="submit" size="md" className="shrink-0">
            + Add
          </Button>
        </form>
      </Card>

      <div className="space-y-2">
        {items.map((item, index) => (
          <Card key={item.id} className="flex flex-wrap items-center gap-3 p-3">
            <div className="flex shrink-0 gap-1">
              <form action={moveAction}>
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="direction" value="up" />
                <button
                  type="submit"
                  disabled={index === 0}
                  className="rounded-lg border border-border px-2 py-1 text-xs text-foreground disabled:opacity-30"
                  aria-label="Move up"
                >
                  ↑
                </button>
              </form>
              <form action={moveAction}>
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="direction" value="down" />
                <button
                  type="submit"
                  disabled={index === items.length - 1}
                  className="rounded-lg border border-border px-2 py-1 text-xs text-foreground disabled:opacity-30"
                  aria-label="Move down"
                >
                  ↓
                </button>
              </form>
            </div>

            <form action={renameAction} className="flex flex-1 min-w-[180px] gap-2">
              <input type="hidden" name="id" value={item.id} />
              <input
                name="label"
                type="text"
                defaultValue={item.label}
                className={clsx(inputClass, "py-1.5")}
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg border border-border px-3 text-xs font-medium text-foreground"
              >
                Save
              </button>
            </form>

            <form action={toggleAction} className="shrink-0">
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="active" value={(!item.active).toString()} />
              <button
                type="submit"
                className={clsx(
                  "rounded-full px-3 py-1.5 text-xs font-semibold",
                  item.active
                    ? "bg-enrolled-soft text-enrolled"
                    : "bg-surface-muted text-muted"
                )}
              >
                {item.active ? "Active" : "Inactive"}
              </button>
            </form>
          </Card>
        ))}
        {items.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
            Nothing here yet — add the first one above.
          </p>
        )}
      </div>
    </div>
  );
}
