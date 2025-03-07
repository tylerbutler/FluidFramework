import type { ISessionClient, LatestValueManager } from "@fluidframework/presence/alpha";
import { SvelteMap } from "svelte/reactivity";
import type { CellCoordinate } from "./coordinate";

export const SelectionManagerContextKey = "SelectionManager";
export type CellSelectionMap = SvelteMap<ISessionClient, CellCoordinate>;

export class SelectionManager {
	/**
	 * A reactive map that tracks the selected cells for each client.
	 * The key is the session client, and the value is the selected cell coordinate.
	 */
	public readonly reactiveState: CellSelectionMap = $state(
		new SvelteMap<ISessionClient, CellCoordinate>(),
	);

	constructor(public readonly valueManager: LatestValueManager<CellCoordinate>) {
		// Wire up event listener to update the reactive map when the remote users' cell selection is updated
		valueManager.events.on("updated", (data) => {
			// Update the selection state with the new coordinate
			this.reactiveState.set(data.client, data.value);
		});
	}
}
