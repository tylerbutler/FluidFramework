import type { ISessionClient, LatestValueManager } from "@fluidframework/presence/alpha";
import { SvelteMap } from "svelte/reactivity";

export abstract class PresenceWorkspaceManager<T> {
	/**
	 * A reactive map that tracks the selected cells for each client.
	 * The key is the session client, and the value is the selected cell coordinate.
	 */
	public readonly reactiveState = $state(new SvelteMap<ISessionClient, T>());

	constructor(public readonly valueManager: LatestValueManager<T>) {
		// Wire up event listener to update the reactive map when the remote users' cell selection is updated
		valueManager.events.on("updated", (data) => {
			// Update the selection state with the new coordinate
			this.reactiveState.set(data.client, data.value as any);
		});
	}
}
