import type {
	IPresence,
	ISessionClient,
	LatestValueManager,
} from "@fluidframework/presence/alpha";
import { SvelteMap } from "svelte/reactivity";
import type { SudokuUser } from "./User.svelte";
import { PresenceWorkspaceManager } from "./PresenceWorkspaceManager.svelte";

export class UserMetadataManager extends PresenceWorkspaceManager<SudokuUser> {
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
		super(presence, valueManager);
	}
}
