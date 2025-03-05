<script lang="ts">
import { Indicator } from "svelte-5-ui-lib";
import type { CellPresenceProps } from "./props";
import { mapStringToColor } from "../colors";

const { owners = $bindable() }: CellPresenceProps = $props();
// const selectionMap = getContext<SvelteMap<ISessionClient, CellCoordinate>>('selectionMap');

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
</script>

{#each owners as owner, index (owner)}
	<!-- {@debug owners} -->
	{#if index < 8}
		<Indicator
			color={mapStringToColor(owner.sessionId)}
			border={false}
			size="lg"
			placement={getPresenceIndicatorPosition(index)}
		></Indicator>
	{/if}
{/each}
