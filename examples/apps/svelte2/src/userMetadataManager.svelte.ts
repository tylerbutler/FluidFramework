import type { ISessionClient, LatestValueManager } from "@fluidframework/presence/alpha";
import { SvelteMap } from "svelte/reactivity";
import type { SudokuUser } from "./user.svelte";

export class UserMetadataManager {
	public readonly reactiveState = $state(new SvelteMap<ISessionClient, SudokuUser>());

	constructor(
		public readonly valueManager: LatestValueManager<SudokuUser>,
		private readonly user: SudokuUser,
	) {
		valueManager.events.on("updated", (data) => {
			this.reactiveState.set(data.client, data.value);
		});
		this.valueManager.local = this.user;
	}
}
