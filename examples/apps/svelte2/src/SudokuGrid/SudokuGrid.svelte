<script lang="ts">
import type { ISessionClient, LatestValueClientData } from "@fluidframework/presence/alpha";
import { Table, TableBody, TableBodyRow } from "svelte-5-ui-lib";
import { Coordinate, type CellCoordinate, type CoordinateString } from "../coordinate";
import Cell from "../SudokuCell/SudokuCell.svelte";
import type { SudokuGridComponentProps } from "./props";
import { SvelteMap } from "svelte/reactivity";

const { grid, sessionClient, selectionManager }: SudokuGridComponentProps = $props();

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
						{selectionManager}
					></Cell>
				{/each}
			</TableBodyRow>
		{/each}
	</TableBody>
</Table>
</div>
