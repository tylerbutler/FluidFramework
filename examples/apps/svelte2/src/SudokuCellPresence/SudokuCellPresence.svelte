<script lang="ts">
	import { Indicator } from "svelte-5-ui-lib";
	import type { CellPresenceProps } from "./props";
	import { mapStringToColor } from "../colors";
	import type { ISessionClient } from "@fluidframework/presence/alpha";
	import { getContext } from "svelte";
	import type { SvelteMap } from "svelte/reactivity";
	import { type CellCoordinate } from "../coordinate";

	const { coordinate }: CellPresenceProps = $props();
	// const selectionMap = getContext<SvelteMap<ISessionClient, CellCoordinate>>('selectionMap');

	const selectionState = getContext<SvelteMap<ISessionClient, CellCoordinate>>("selectionState");

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
	// {#each selectionMap.entries() as [owner, cell], index (owner)}
	// 	<!-- {@debug owners} -->
	// 	{#if index < 8 && owner.getConnectionStatus() === "Connected" && cell === coordinate}
	// 		<Indicator
	// 			color={mapStringToColor(owner.sessionId)}
	// 			border={false}
	// 			size="lg"
	// 			placement={getPresenceIndicatorPosition(index)}
	// 		></Indicator>
	// 	{/if}
	// {/each}

	const indicators = $derived.by(() => {
		const toRender: ISessionClient[] = [];
		for (const [owner, cell] of selectionState.entries()) {
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

{#each indicators as owner, index (owner.sessionId)}
	<!-- {@debug owners} -->
		<Indicator
			color={mapStringToColor(owner.sessionId)}
			border={false}
			size="lg"
			placement={getPresenceIndicatorPosition(index)}
		></Indicator>
{/each}
