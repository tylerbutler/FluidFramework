<script lang="ts">
import { Coordinate, type CoordinateString } from "./helpers/coordinate";
import { PUZZLE_INDEXES, type SudokuNumber } from "./helpers/puzzles";
import { SudokuCell } from "./helpers/sudokuCell.svelte";
import { type SudokuAppProps } from "./helpers/props";
import Cell from "./Cell.svelte";

const { puzzle, clientSessionId, presence }: SudokuAppProps = $props();

const coordinateDataAttributeName = "cellcoordinate";

const getCellInputElement = (coord: CoordinateString): HTMLInputElement =>
	document.getElementById(`${clientSessionId}-${coord}`) as HTMLInputElement;

// const handleInputFocus = (e: any) => {
// 	const coord = e.target.dataset[coordinateDataAttributeName];
// 	if (presence) {
// 		if (coord !== undefined) {
// 			presence.set(coord, false);
// 		}
// 	}
// };

// const handleInputBlur = (e: any) => {
// 	const coord = e.target.dataset[coordinateDataAttributeName];
// 	if (presence) {
// 		if (coord !== undefined) {
// 			presence.set(coord, true);
// 		}
// 	}
// };

// const handleKeyDown = (e: any) => {
// 	e.preventDefault();
// 	let keyString = e.key;
// 	const coord = (e.currentTarget.dataset[coordinateDataAttributeName] as string) ?? "";
// 	moveCell(keyString, coord);
// };

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
};
</script>

<div>
	<table>
		<tbody>
			{#each puzzle.grid as row (row.toString())}
				<tr>
					{#each row as cell (cell.toString())}
						<Cell {cell} {clientSessionId} {presence} onUnknownKeyDown={moveCell}></Cell>
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
