<script lang="ts">
import type { ISessionClient, LatestValueClientData } from "@fluidframework/presence/alpha";
import { Table, TableBody, TableBodyRow } from "svelte-5-ui-lib";
import { Coordinate, type CellCoordinate, type CoordinateString } from "../coordinate";
import Cell from "../SudokuCell/SudokuCell.svelte";
import type { PuzzleTableComponentProps } from "./props";
import { SvelteMap } from "svelte/reactivity";

const { grid, sessionClient, selectionManager }: PuzzleTableComponentProps = $props();

let selectedCells = $state(new SvelteMap<CellCoordinate, Set<ISessionClient>>());

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
};

const onRemoteCellChange = (coord: LatestValueClientData<CellCoordinate>) => {
	const [row, column] = coord.value;
	const clients = selectedCells.get([row, column]) ?? new Set<ISessionClient>();
	clients.add(coord.client);
	selectedCells.set([row, column], clients);

	// Add the session to the owners here; removal is done elsewhere
	grid[row][column].remoteOwners.add(coord.client);
	console.debug("remote selection update:", coord.value, grid[row][column].remoteOwners);
};

selectionManager.events.on("updated", onRemoteCellChange);
selectionManager.events.on("localUpdated", (coord) => {
	const [row, column] = coord.value;

	for (const owners of selectedCells.values()) {
		owners.delete(sessionClient);
	}

	const clients = selectedCells.get([row, column]) ?? new Set<ISessionClient>();
	clients.add(sessionClient);
	selectedCells.set([row, column], clients);
	console.debug("local selection update:", coord.value, grid[row][column].remoteOwners);
});

// const onLeaveCell = (event: FocusEvent) => {
// 	const cell = event.currentTarget as HTMLInputElement;
// 	const coord = cell.dataset.cellcoordinate as CoordinateString;
// 	selectionManager.local = Coordinate.asArrayNumbers(coord);
// };
</script>

<Table class="h-full w-min border-collapse">
	<TableBody>
		{#each grid as row, rowIndex}
			<TableBodyRow>
				{#each row as cell, colIndex (cell.coordinateString)}
					<Cell
						cellData={grid[rowIndex][colIndex]}
						currentSessionClient={sessionClient}
						onKeyDown={moveCell}
						{selectionManager}
					></Cell>
				{/each}
			</TableBodyRow>
		{/each}
	</TableBody>
</Table>
