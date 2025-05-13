<script lang="ts">
import { Indicator } from "svelte-5-ui-lib";
import type { CellPresenceProps, SelectionManager, UserMetadataManager } from "./props";
import type { Attendee } from "@fluidframework/presence/alpha";
import { compareCells, getPresenceIndicatorPosition } from "./SudokuCellPresence.js";
import { getSelectionManager, getUserMetadataManager } from "$lib/context";

const { coordinate }: CellPresenceProps = $props();

const selectionManager = getSelectionManager();
const userMetadataManager = getUserMetadataManager();
const user = userMetadataManager.local;

// if (!user) {
// 	throw new Error("User not found");
// }

const presenceIndicators = $derived.by(() => {
	const toRender: Attendee[] = [];
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

{#each presenceIndicators as session, index (session.attendeeId)}
	<Indicator
		color={user?.color}
		border={false}
		size="lg"
		placement={getPresenceIndicatorPosition(index)}
	></Indicator>
{/each}
