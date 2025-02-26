<script lang="ts">
import "svooltip/styles.css"; // Include default styling
import type {
	LatestMapValueManager,
	LatestValueClientData,
	LatestValueManager,
} from "@fluidframework/presence/alpha";
import { Tooltip } from "@svelte-plugins/tooltips";
import { Coordinate, type CellCoordinate, type CoordinateString } from "./coordinate";
import { type SudokuAppProps } from "./props";
import Cell from "./Cell.svelte";
import type { SudokuGrid } from "./types";
import type { SudokuCell } from "./sudokuCell.svelte";

const {
	grid = $bindable(),
	sessionClient,
	selectionManager,
	selectionMap,
}: Omit<SudokuAppProps, "presence" | "puzzle"> & {
	grid: SudokuGrid;
	readonly selectionManager: LatestValueManager<CellCoordinate>;
	readonly selectionMap: LatestMapValueManager<string[], CoordinateString>;
} = $props();

// const coordinateDataAttributeName = "cellcoordinate";
// const grid = getContext<SudokuGrid>("grid");

const getCellInputElement = (coord: CoordinateString): HTMLInputElement =>
	document.getElementById(`${sessionClient.sessionId}-${coord}`) as HTMLInputElement;

const moveCell = (keyString: string, coordIn: CoordinateString):void => {
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
	const oldCell = getCellInputElement(coord);

	// 	const oldOwners = selectionMap.local.get(coord);
	// 	if (oldOwners !== undefined) {
	// 		const newArray = oldOwners.filter((owner) => owner !== sessionClient.sessionId);
	// 		selectionMap.local.set(coord, newArray);
	// 	}

	// 	selectionCoordinate.local = Coordinate.asArrayNumbers(newCoord);
	// 	const owners = [...(selectionMap.local.get(newCoord) ?? [])];

	// 	owners.push(sessionClient.sessionId);
	// 	selectionMap.local.set(newCoord, owners);
};

const onRemoteCellChange = (coord: LatestValueClientData<CellCoordinate>) => {
	console.debug("remote selection update:", coord.value);
	const [r, c] =
		typeof coord.value === "string" ? Coordinate.asArrayNumbers(coord.value) : coord.value;
	const row = grid[r];
	const cell = row[c];

	// const selectedCell = getCellInputElement(Coordinate.fromCellCoordinate(data.value));
	// selectedCell.classList.add("presence");
	if (cell !== undefined) {
		console.debug("before:", grid[r][c].owner);
		grid[r][c].owner = coord.client.sessionId;
		console.debug("after:", grid[r][c].owner);
	}
};

selectionManager.events.on("updated", onRemoteCellChange);
// selectionManager.events.on("localUpdated", (updated) =>
// 	console.debug("localUpdated:", updated),
// );

// selectionMap.events.on("itemRemoved", (removedItem) => {
// 	console.debug("itemRemoved:", removedItem.key, removedItem.client);
// 	const coords = Coordinate.asArrayNumbers(removedItem.key);
// 	grid[coords[0]][coords[1]].owners.clear();
// });

// selectionMap.events.on("itemUpdated", (updatedItem) => {
// 	console.debug("itemUpdated:", updatedItem.key, updatedItem.value);
// 	const coords = Coordinate.asArrayNumbers(updatedItem.key);
// 	const newOwners = difference(
// 		grid[coords[0]][coords[1]].owners,
// 		new Set(...updatedItem.value),
// 	);
// 	grid[coords[0]][coords[1]].owners = new SvelteSet(newOwners);
// });
</script>

<div>
	<table>
		<tbody>
			{#each grid as row, r (row.toString())}
				<tr>
					{#each row as cell, c (cell.toString())}
						<Tooltip
							action="prop"
							content={cell.color}
							position="top"
							arrow={false}
							bind:show={cell.displayTooltip}
							theme="remote1"
						>
							<Cell
								bind:cellData={grid[r][c]}
								currentSessionClient={sessionClient}
								onKeyDown={moveCell}
								{selectionManager}
							></Cell>
				</Tooltip>
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

  :global(.tooltip.remote1) {
    --tooltip-background-color: hotpink;
    --tooltip-box-shadow: 0 1px 8px pink;
		--tooltip-font-size: 10px;
		--tooltip-padding: 1px;
  }
</style>
