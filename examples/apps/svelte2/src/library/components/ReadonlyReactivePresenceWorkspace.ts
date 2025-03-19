import type {
	IPresence,
	ISessionClient,
	LatestValueManager,
} from "@fluidframework/presence/alpha";
import { SvelteMap } from "svelte/reactivity";

/**
 * A class that exposes reactive properties from a backing Presence Value Manager.
 */
export class ReadonlyReactivePresenceWorkspace<T extends object> {
	/**
	 * Reactive map of session client to state data. This is accessed via the data property.
	 */
	protected readonly reactiveState = $state(new SvelteMap<ISessionClient, T>());

	/**
	 * Access the unfiltered reactive data. Use the data property to filter out disconnected sessions.
	 */
	public readonly unfilteredData = $derived(this.reactiveState);

	public readonly data = $derived.by(() => {
		return new SvelteMap(
			[...this.reactiveState].filter(
				([session]) => session.getConnectionStatus() === "Connected",
			),
		);
	});

	public get local() {
		return this.valueManager.local;
	}

	constructor(
		protected presence: IPresence,
		public readonly valueManager: LatestValueManager<T>,
		includeLocal = true,
	) {
		// Wire up event listener to update the reactive map when the remote users' data is updated
		valueManager.events.on("updated", (data) => {
			this.reactiveState.set(data.client, data.value as any);
		});

		if (includeLocal) {
			valueManager.events.on("localUpdated", (data) => {
				// Update the selection state with the new coordinate
				this.reactiveState.set(this.presence.getMyself(), data.value as any);
			});
		}

		presence.events.on("attendeeDisconnected", (session: ISessionClient) => {
			this.reactiveState.delete(session);
		});
	}

	// public static create<T extends object>(
	// 	presence: IPresence,
	// 	valueManager: LatestValueManager<T>,
	// ): ReadonlyReactivePresenceWorkspace<T> {
	// 	return new ReadonlyReactivePresenceWorkspace<T>(presence, valueManager);
	// }
}
