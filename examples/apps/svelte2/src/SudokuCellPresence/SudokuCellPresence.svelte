<script lang="ts">
import { Indicator } from "svelte-5-ui-lib";
import type { CellPresenceProps } from "./props";
import type { ISessionClient } from "@fluidframework/presence/alpha";
import { getContext } from "svelte";
import { type CellCoordinate } from "../coordinate";
import type { SelectionManager } from "../selectionManager.svelte";
import { SelectionManagerContextKey, UserMetadataManagerContextKey } from "../constants";
import type { UserMetadataManager } from "../userMetadataManager.svelte";

const { coordinate }: CellPresenceProps = $props();

// This could come from props as well.
const { data: cellSelection } = getContext<SelectionManager>(SelectionManagerContextKey);
const userMetadataManager = getContext<UserMetadataManager>(UserMetadataManagerContextKey);
// const presence = getContext<IPresence>(PresenceContextKey);
const user = userMetadataManager.getDataForCurrentUser();

// if (!user) {
// 	throw new Error("User not found");
// }

function compareCells(cell1: CellCoordinate, cell2: CellCoordinate) {
	return cell1[0] === cell2[0] && cell1[1] === cell2[1];
}

function getPresenceIndicatorPosition(index: number) {
	switch (index) {
		case 0:
			return "top-right";
		case 1:
			return "top-center";
		case 2:
			return "top-left";
		case 3:
			return "center-right";
		case 4:
			return "center-left";
		case 5:
			return "bottom-right";
		case 6:
			return "bottom-center";
		case 7:
			return "bottom-left";
		default:
			throw new Error("Invalid index");
	}
}

const presenceIndicators = $derived.by(() => {
	const toRender: ISessionClient[] = [];
	for (const [owner, cell] of cellSelection.entries()) {
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
