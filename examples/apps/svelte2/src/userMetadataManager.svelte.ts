import type { SudokuAppUser } from "./user.svelte";
import type { ISessionClient, LatestValueManager } from "@fluidframework/presence/alpha";
import { SvelteMap } from "svelte/reactivity";

export class UserMetadataManager {
	public readonly reactiveState = $state(new SvelteMap<ISessionClient, SudokuAppUser>());

	constructor(
		public readonly valueManager: LatestValueManager<SudokuAppUser>,
		user: SudokuAppUser,
	) {
		valueManager.events.on("updated", (data) => {
			this.reactiveState.set(data.client, data.value);
		});
		this.valueManager.local = user;
	}
}
