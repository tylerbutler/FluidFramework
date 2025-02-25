<script lang="ts">
import type { LatestValueManager } from "@fluidframework/presence/alpha";
import { Coordinate, type CellCoordinate, type CoordinateString } from "./helpers/coordinate";
import { type SudokuAppProps } from "./helpers/props";
import Cell from "./Cell.svelte";

const {
	puzzle,
	sessionClientId,
	presenceValueManager,
}: Omit<SudokuAppProps, "presence"> & {
	readonly presenceValueManager: LatestValueManager<CellCoordinate>;
} = $props();

// const coordinateDataAttributeName = "cellcoordinate";

const getCellInputElement = (coord: CoordinateString): HTMLInputElement =>
	document.getElementById(`${sessionClientId}-${coord}`) as HTMLInputElement;

const moveCell = (keyString: string, coordIn: string) => {
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
	presenceValueManager.local = Coordinate.asArrayNumbers(newCoord);
};
</script>

<div>
	<table>
		<tbody>
			{#each puzzle.grid as row (row.toString())}
				<tr>
					{#each row as cell (cell.toString())}
						<Cell {cell} {sessionClientId} onKeyDown={moveCell}></Cell>
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
