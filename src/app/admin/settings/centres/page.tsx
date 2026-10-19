import { getAllCentres } from "@/lib/lookups";
import { LookupTable } from "@/components/LookupTable";
import {
  createCentreAction,
  toggleCentreAction,
  renameCentreAction,
  moveCentreAction,
} from "./actions";

export default async function CentresSettingsPage() {
  const centres = await getAllCentres();

  return (
    <LookupTable
      title="Centres"
      description="The centre dropdown shown on the inquiry form. Deactivate a centre instead of deleting it so past leads stay intact."
      placeholder="New centre name"
      items={centres.map((c) => ({ id: c.id, label: c.name, active: c.active }))}
      createAction={createCentreAction}
      toggleAction={toggleCentreAction}
      renameAction={renameCentreAction}
      moveAction={moveCentreAction}
    />
  );
}
