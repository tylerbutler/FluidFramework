// import type {
// 	IPresence,
// 	ISessionClient,
// 	LatestValueManager,
// } from "@fluidframework/presence/alpha";
// import { SvelteMap } from "svelte/reactivity";
// import type { SudokuUser } from "./user.svelte";

// export class UserIdManager {
// 	private reactiveState = $state(new SvelteMap<ISessionClient, SudokuUser>());

// 	public readonly data = $derived.by(() => {
// 		return new SvelteMap(
// 			Array.from(this.reactiveState).filter(
// 				([session]) => session.getConnectionStatus() === "Connected",
// 			),
// 		);
// 	});

// 	public readonly allState = $derived(this.reactiveState);

// 	public setMyValue(user: SudokuUser) {
// 		this.valueManager.local = user;
// 	}

// 	constructor(
// 		protected presence: IPresence,
// 		public readonly valueManager: LatestValueManager<SudokuUser>,
// 	) {
// 		// Wire up event listener to update the reactive map when the remote users' data is updated
// 		valueManager.events.on("updated", (data) => {
// 			this.reactiveState.set(data.client, data.value);
// 		});
// 	}
// }
