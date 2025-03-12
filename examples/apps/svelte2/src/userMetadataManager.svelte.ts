import type {
	IPresence,
	ISessionClient,
	LatestValueManager,
} from "@fluidframework/presence/alpha";
import type { SudokuUser } from "./user.svelte";
import { PresenceWorkspaceManager } from "./presenceManager.svelte";
import { SvelteMap } from "svelte/reactivity";

export class UserMetadataManager extends PresenceWorkspaceManager<SudokuUser> {
	constructor(
		presence: IPresence,
		public readonly valueManager: LatestValueManager<SudokuUser>,
		private readonly user: SudokuUser,
	) {
		super(presence, valueManager);

		presence.events.on("attendeeJoined", () => {
			this.valueManager.local = this.user;
		});

		presence.events.on("attendeeDisconnected", (session: ISessionClient) => {
			this.reactiveState.delete(session);
			// probably unnecessary
			this.valueManager.local = this.user;
		});

		valueManager.events.on("updated", (data) => {
			this.reactiveState.set(data.client, data.value);
		});
		this.valueManager.local = this.user;
	}
}
