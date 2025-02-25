<script lang="ts">
import type {
	ISessionClient,
	LatestMapValueManager,
	LatestValueClientData,
	LatestValueManager,
} from "@fluidframework/presence/alpha";
import { Coordinate, type CellCoordinate, type CoordinateString } from "./coordinate";
import { type SudokuAppProps } from "./props";
import Cell from "./Cell.svelte";
import { SvelteSet } from "svelte/reactivity";
import { difference } from "./utils";

const {
	puzzle,
	sessionClient,
	// selectionCoordinate,
	selectionMap,
}: Omit<SudokuAppProps, "presence"> & {
	// readonly selectionCoordinate: LatestValueManager<CellCoordinate>;
	readonly selectionMap: LatestMapValueManager<string[], CoordinateString>;
} = $props();

// const coordinateDataAttributeName = "cellcoordinate";

const getCellInputElement = (coord: CoordinateString): HTMLInputElement =>
	document.getElementById(`${sessionClient.sessionId}-${coord}`) as HTMLInputElement;

const moveCell = (keyString: string, coordIn: CoordinateString) => {
	const coord = coordIn;
	let newCoord = coordIn;
	switch (keyString) {
		case "ArrowDown":
		case "s":
			newCoord = Coordinate.moveDown(coord);
			break;
		case "ArrowUp":
		case "w":
			newCoord = Coordinate.moveUp(coord);
			break;
		case "ArrowLeft":
		case "a":
			newCoord = Coordinate.moveLeft(coord);
			break;
		case "ArrowRight":
		case "d":
			newCoord = Coordinate.moveRight(coord);
			break;
		default:
			newCoord = coord;
	}

	const newCell = getCellInputElement(newCoord);
	newCell.focus();

	// Remove the owner from the old cell
	const oldOwners = selectionMap.local.get(coord);
	if (oldOwners !== undefined) {
		const newArray = oldOwners.filter((owner) => owner !== sessionClient.sessionId);
		selectionMap.local.set(coord, newArray);
	}

	// selectionCoordinate.local = Coordinate.asArrayNumbers(newCoord);
	const owners = [...(selectionMap.local.get(newCoord) ?? [])];

	owners.push(sessionClient.sessionId);
	selectionMap.local.set(newCoord, owners);
};

// const onCellChange = (coord: LatestValueClientData<CellCoordinate>) => {
// 	// const selectedCell = getCellInputElement(Coordinate.fromCellCoordinate(data.value));
// 	// selectedCell.classList.add("presence");
// 	puzzle.grid[coord.value[0]][coord.value[1]].selectedBysessionClients.add(coord.client);
// };

// const onCellChange = (coord: LatestValueClientData<CellCoordinate>) => {
// 	// const selectedCell = getCellInputElement(Coordinate.fromCellCoordinate(data.value));
// 	// selectedCell.classList.add("presence");
// 	puzzle.grid[coord.value[0]][coord.value[1]].selectedBysessionClients.add(coord.client);
// };

// selectionCoordinate.events.on("updated", onCellChange);
selectionMap.events.on("itemRemoved", (removedItem) => {
	console.debug("itemRemoved:", removedItem.key, removedItem.client);
	const coords = Coordinate.asArrayNumbers(removedItem.key);
	puzzle.grid[coords[0]][coords[1]].owners.clear();
});

selectionMap.events.on("itemUpdated", (updatedItem) => {
	console.debug("itemUpdated:", updatedItem.key, updatedItem.value);
	const coords = Coordinate.asArrayNumbers(updatedItem.key);
	const newOwners = difference(
		puzzle.grid[coords[0]][coords[1]].owners,
		new Set(...updatedItem.value),
	);
	puzzle.grid[coords[0]][coords[1]].owners = new SvelteSet(newOwners);
});
</script>

<div>
	<table>
		<tbody>
			{#each puzzle.grid as row (row.toString())}
				<tr>
					{#each row as cell (cell.toString())}
						<Cell {cell} currentSessionClient={sessionClient} onKeyDown={moveCell}
						></Cell>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	table {
		border: none;
	}
</style>
