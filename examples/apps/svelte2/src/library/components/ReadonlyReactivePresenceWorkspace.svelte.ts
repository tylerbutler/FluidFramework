import type { Presence, Attendee, LatestRaw } from "@fluidframework/presence/alpha";
import { SvelteMap } from "svelte/reactivity";

export class ReadonlyReactivePresenceWorkspace<T extends object> {
	protected readonly reactiveState = $state(new SvelteMap<Attendee, T>());

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
		protected presence: Presence,
		public readonly valueManager: LatestRaw<T>,
	) {
		// Wire up event listener to update the reactive map when the remote users' data is updated
		valueManager.events.on("remoteUpdated", (data) => {
			this.reactiveState.set(data.attendee, data.value as any);
		});
		// valueManager.events.on("localUpdated", (data) => {
		// 	// Update the selection state with the new coordinate
		// 	this.reactiveState.set(data.client, data.value as any);
		// });
		presence.attendees.events.on("attendeeDisconnected", (session: Attendee) => {
			this.reactiveState.delete(session);
		});
	}

	public static create<T extends object>(
		presence: Presence,
		valueManager: LatestRaw<T>,
	): ReadonlyReactivePresenceWorkspace<T> {
		return new ReadonlyReactivePresenceWorkspace<T>(presence, valueManager);
	}
}
