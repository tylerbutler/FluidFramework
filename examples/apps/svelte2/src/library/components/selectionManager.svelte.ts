import type { IPresence, LatestValueManager } from "@fluidframework/presence/alpha";
import type { CellCoordinate } from "../coordinate";
import { PresenceWorkspaceManager } from "./presenceManager.svelte";

export class SelectionManager extends PresenceWorkspaceManager<CellCoordinate> {
	constructor(
		protected presence: IPresence,
		public readonly valueManager: LatestValueManager<CellCoordinate>,
	) {
		super(presence, valueManager);
		presence.events.on("attendeeDisconnected", (session) => {
			// Update the selection state with the new coordinate
			this.reactiveState.delete(session);
		});
	}
}
