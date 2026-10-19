import { getAllCoordinators } from "@/lib/lookups";
import { LookupTable } from "@/components/LookupTable";
import {
  createCoordinatorAction,
  toggleCoordinatorAction,
  renameCoordinatorAction,
  moveCoordinatorAction,
} from "./actions";

export default async function CoordinatorsSettingsPage() {
  const coordinators = await getAllCoordinators();

  return (
    <LookupTable
      title="Coordinators"
      description="The 'Inquiry handled by' dropdown on the inquiry form. This is separate from login accounts — manage logins under Users."
      placeholder="New coordinator name"
      items={coordinators.map((c) => ({ id: c.id, label: c.name, active: c.active }))}
      createAction={createCoordinatorAction}
      toggleAction={toggleCoordinatorAction}
      renameAction={renameCoordinatorAction}
      moveAction={moveCoordinatorAction}
    />
  );
}
