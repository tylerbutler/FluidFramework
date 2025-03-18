import type {
	IPresence,
	ISessionClient,
	LatestValueManager,
} from "@fluidframework/presence/alpha";
import { SvelteMap } from "svelte/reactivity";
import type { SudokuUser } from "./user.svelte";

export class UserMetadataManager {
	private reactiveState = $state(new SvelteMap<ISessionClient, SudokuUser>());

	public readonly data = $derived.by(() => {
		return new SvelteMap(
			Array.from(this.reactiveState).filter(
				([session]) => session.getConnectionStatus() === "Connected",
			),
		);
	});

	public readonly allState = $derived(this.reactiveState);

	public get local() {
		return this.valueManager.local;
	}

	public set local(value: SudokuUser) {
		this.valueManager.local = value;
		this.reactiveState.set(this.presence.getMyself(), value);
	}

	constructor(
		private readonly presence: IPresence,
		private readonly valueManager: LatestValueManager<SudokuUser>,
	) {
		// Wire up event listener to update the reactive map when the remote users' data is updated
		this.valueManager.events.on("updated", (data) => {
			this.reactiveState.set(data.client, data.value);
		});

		// this.valueManager.events.on("localUpdated", ({value}) => {
		// 	this.reactiveState.set(presence.getMyself(), value);
		// });

		presence.events.on("attendeeJoined", (session: ISessionClient) => {
			// The condition below will always be true, because when a presence attendee joins,
			// The metadata manager can't know anything about it that presence doesn't itself know.
			// if (!this.reactiveState.has(session)) {
			// 	console.error(`Session ${session.sessionId} joined with no user metadata.`);
			// }
		});

		presence.events.on("attendeeDisconnected", (session: ISessionClient) => {
			this.reactiveState.delete(session);
		});
	}
}
