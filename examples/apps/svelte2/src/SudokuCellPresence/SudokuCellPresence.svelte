<script lang="ts">
import { Indicator } from "svelte-5-ui-lib";
import type { CellPresenceProps } from "./props";
import type { ISessionClient } from "@fluidframework/presence/alpha";
import { getContext } from "svelte";
import type { SelectionManager } from "../selectionManager.svelte";
import { SelectionManagerContextKey, UserMetadataManagerContextKey } from "../constants";
import type { UserMetadataManager } from "../userMetadataManager.svelte";
import { compareCells, getPresenceIndicatorPosition } from "./utils";

const { coordinate }: CellPresenceProps = $props();

// This could come from props as well.
const selectionManager = getContext<SelectionManager>(SelectionManagerContextKey);
const userMetadataManager = getContext<UserMetadataManager>(UserMetadataManagerContextKey);
// const presence = getContext<IPresence>(PresenceContextKey);
const user = userMetadataManager.local;

// if (!user) {
// 	throw new Error("User not found");
// }

const presenceIndicators = $derived.by(() => {
	const toRender: ISessionClient[] = [];
	for (const [owner, cell] of selectionManager.data) {
		if (
			toRender.length < 8 &&
			owner.getConnectionStatus() === "Connected" &&
			compareCells(cell, coordinate)
		) {
			toRender.push(owner);
		}
	}
	return toRender;
});
</script>

{#each presenceIndicators as session, index (session.sessionId)}
	<Indicator
		color={user?.color}
		border={false}
		size="lg"
		placement={getPresenceIndicatorPosition(index)}
	></Indicator>
{/each}
