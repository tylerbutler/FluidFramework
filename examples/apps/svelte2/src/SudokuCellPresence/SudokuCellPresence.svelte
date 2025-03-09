<script lang="ts">
import { Badge } from "yesvelte";
import type { CellPresenceProps } from "./props";
import { mapStringToColor } from "../colors";
import type { ISessionClient } from "@fluidframework/presence/alpha";
import { getContext } from "svelte";
import { type CellCoordinate } from "../coordinate";
import { SelectionManagerContextKey, type SelectionManager } from "../selectionManager.svelte";

const { coordinate }: CellPresenceProps = $props();

// This could come from props as well.
const { reactiveState } = getContext<SelectionManager>(SelectionManagerContextKey);

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
	for (const [owner, cell] of reactiveState.entries()) {
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
		<Badge
			color={mapStringToColor(session.sessionId)}
			border={false}
			placement={getPresenceIndicatorPosition(index)}
		></Badge>
{/each}
