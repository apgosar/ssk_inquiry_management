import { getAllReasons } from "@/lib/lookups";
import { LookupTable } from "@/components/LookupTable";
import {
  createReasonAction,
  toggleReasonAction,
  renameReasonAction,
  moveReasonAction,
} from "./actions";

export default async function ReasonsSettingsPage() {
  const reasons = await getAllReasons();

  return (
    <LookupTable
      title="Reasons for not joining"
      description="Shown when a coordinator marks a lead as Not Joining."
      placeholder="New reason"
      items={reasons.map((r) => ({ id: r.id, label: r.label, active: r.active }))}
      createAction={createReasonAction}
      toggleAction={toggleReasonAction}
      renameAction={renameReasonAction}
      moveAction={moveReasonAction}
    />
  );
}
