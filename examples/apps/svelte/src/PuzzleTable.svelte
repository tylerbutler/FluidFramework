<script lang="ts">
import type {
	LatestValueClientData,
	LatestValueManager,
} from "@fluidframework/presence/alpha";
import { Table, TableBody, TableBodyRow } from "svelte-5-ui-lib";
import { Coordinate, type CellCoordinate, type CoordinateString } from "./coordinate";
import { type SudokuAppProps } from "./props";
import Cell from "./Cell.svelte";
import type { SudokuGrid } from "./types";

const {
	grid = $bindable(),
	sessionClient,
	selectionManager,
	// selectionMap,
}: Omit<SudokuAppProps, "presence" | "puzzle"> & {
	grid: SudokuGrid;
	readonly selectionManager: LatestValueManager<CellCoordinate>;
	// readonly selectionMap: LatestMapValueManager<string[], CoordinateString>;
} = $props();

const getCellInputElement = (coord: CoordinateString): HTMLInputElement =>
	document.getElementById(`${sessionClient.sessionId}-${coord}`) as HTMLInputElement;

const moveCell = (keyString: string, coordIn: CoordinateString): void => {
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
	const [row, column] = coord.value;
	grid[row][column].remoteOwners.add(coord.client.sessionId);
	console.debug("remote selection update:", coord.value);
};

selectionManager.events.on("updated", onRemoteCellChange);
</script>

<Table class="h-full w-min border-collapse">
	<TableBody>
		{#each grid as row, r (row.toString())}
			<TableBodyRow>
				{#each row as cell, c (cell.toString())}
					<Cell
						bind:cellData={grid[r][c]}
						currentSessionClient={sessionClient}
						onKeyDown={moveCell}
						{selectionManager}
					></Cell>
				{/each}
			</TableBodyRow>
		{/each}
	</TableBody>
</Table>
