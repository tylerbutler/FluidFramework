<script lang="ts">
import type {
	LatestValueClientData,
	LatestValueManager,
} from "@fluidframework/presence/alpha";
import { Table, TableBody, TableBodyRow } from "svelte-5-ui-lib";
import { Coordinate, type CellCoordinate, type CoordinateString } from "../coordinate";
import { type SudokuAppProps } from "../props";
import type { SudokuGrid } from "../fluid/dataSchema";
import Cell from "../SudokuCell/Cell.svelte";
import type { PuzzleTableComponentProps } from "./props";

const {
	grid = $bindable(),
	sessionClient,
	selectionManager,
	// selectionMap,
}: PuzzleTableComponentProps = $props();

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
	const [oldRow, oldColumn] = Coordinate.asArrayNumbers(coord);
	grid[oldRow][oldColumn].remoteOwners.delete(sessionClient);
};

const onRemoteCellChange = (coord: LatestValueClientData<CellCoordinate>) => {
	const [row, column] = coord.value;
	// Add the session to the owners here; removal is done
	grid[row][column].remoteOwners.add(coord.client);
	console.debug("remote selection update:", coord.value);
};

selectionManager.events.on("updated", onRemoteCellChange);

const onLeaveCell = (event: FocusEvent) => {
	const cell = event.currentTarget as HTMLInputElement;
	const coord = cell.dataset.cellcoordinate as CoordinateString;
	selectionManager.local = Coordinate.asArrayNumbers(coord);
};
</script>

<Table class="h-full w-min border-collapse">
	<TableBody>
		{#each grid as row, r (row.join(","))}
			<TableBodyRow>
				{#each row as cell, c (cell.coordinateString)}
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
