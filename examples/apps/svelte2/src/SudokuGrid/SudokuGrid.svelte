<script lang="ts">
import { Table, TableBody, TableBodyRow } from "svelte-5-ui-lib";
import { Coordinate, type CoordinateString } from "../coordinate";
import Cell from "../SudokuCell/SudokuCell.svelte";
import type { SudokuGridComponentProps } from "./props";
import { coordinateDataAttributeName, SelectionManagerContextKey } from "../constants";
import { getContext } from "svelte";
import type { SelectionManager } from "../selectionManager.svelte";

const { grid, sessionClient }: SudokuGridComponentProps = $props();

// This could come from props as well.
const selectionManager = getContext<SelectionManager>(SelectionManagerContextKey);

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

const onCellFocus = (e: any) => {
	const coord: CoordinateString = e.target.dataset[coordinateDataAttributeName];
	if (coord !== undefined) {
		// Sets the locally selected cell for the current client.
		// On remote clients this will trigger an update event.
		selectionManager.valueManager.local = Coordinate.asArrayNumbers(coord);
	}
};
</script>

<div>
<Table class="h-full w-min border-collapse">
	<TableBody>
		{#each grid as row, rowIndex}
			<TableBodyRow>
				{#each row as cell, colIndex (cell.coordinateString)}
					<Cell
						cellData={grid[rowIndex][colIndex]}
						currentSessionClient={sessionClient}
						onKeyDown={moveCell}
						onFocus={onCellFocus}
					></Cell>
				{/each}
			</TableBodyRow>
		{/each}
	</TableBody>
</Table>
</div>
