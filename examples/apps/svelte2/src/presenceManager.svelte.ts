import type {
	IPresence,
	ISessionClient,
	LatestValueManager,
} from "@fluidframework/presence/alpha";
import { SvelteMap } from "svelte/reactivity";

export abstract class PresenceWorkspaceManager<T> {
	protected readonly reactiveState = $state(new SvelteMap<ISessionClient, T>());

	public readonly data = $derived.by(() => {
		return new SvelteMap(
			[...this.reactiveState].filter(
				([session]) => session.getConnectionStatus() === "Connected",
			),
		);
	});

	public getDataForCurrentUser() {
		return this.valueManager.local;
	}

	constructor(
		protected presence: IPresence,
		public readonly valueManager: LatestValueManager<T>,
	) {
		// Wire up event listener to update the reactive map when the remote users' data is updated
		valueManager.events.on("updated", (data) => {
			// Update the selection state with the new coordinate
			this.reactiveState.set(data.client, data.value as any);
		});
	}
}
