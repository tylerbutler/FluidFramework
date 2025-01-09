<style>
	table {
		border: none;
	}
</style>

<script lang="ts">
import { Coordinate, type CoordinateString } from "./helpers/coordinate";
import { PUZZLE_INDEXES, type PuzzleGrid } from "./helpers/puzzles";
import { CellState, SudokuCell } from "./helpers/sudokuCell";
import { type SudokuAppProps } from "./helpers/props";

const { puzzle, clientSessionId }: SudokuAppProps = $props();

const coordinateDataAttributeName = "cellcoordinate";

const getCellInputElement = (coord: CoordinateString): HTMLInputElement =>
	document.getElementById(`${clientSessionId}-${coord}`) as HTMLInputElement;

const handleInputFocus = (e: any) => {
	// const coord = e.target.dataset[coordinateDataAttributeName];
	// if (props.setPresence) {
	// 	if (coord !== undefined) {
	// 		props.setPresence(coord, false);
	// 	}
	// }
};

const handleInputBlur = (e: any) => {
	// const coord = e.target.dataset[coordinateDataAttributeName];
	// if (props.setPresence) {
	// 	if (coord !== undefined) {
	// 		props.setPresence(coord, true);
	// 	}
	// }
};

const handleKeyDown = (e: any) => {
	e.preventDefault();
	let keyString = e.key;
	let coord = e.currentTarget.dataset[coordinateDataAttributeName] as string;
	coord = coord === undefined ? "" : coord;
	const cell = puzzle.get(coord)!;

	switch (keyString) {
		case "Backspace":
		case "Delete":
		case "Del":
		case "0":
			keyString = "0";
		// Intentional fall-through
		case "1":
		case "2":
		case "3":
		case "4":
		case "5":
		case "6":
		case "7":
		case "8":
		case "9":
			if (cell.fixed) {
				return;
			}
			numericInput(keyString, coord);
			return;
		default:
			moveCell(keyString, coord);
			return;
	}
};

const numericInput = (keyString: string, coord: string) => {
	let valueToSet = Number(keyString);
	valueToSet = Number.isNaN(valueToSet) ? 0 : valueToSet;
	if (valueToSet >= 10 || valueToSet < 0) {
		return;
	}

	if (coord !== undefined) {
		const cellInputElement = getCellInputElement(coord);
		cellInputElement.value = keyString;

		const toSet = puzzle.get(coord)!;
		if (toSet.fixed === true) {
			return;
		}
		toSet.value = valueToSet;
		toSet.isCorrect = valueToSet === toSet.correctValue;
		puzzle.set(coord, toSet);
	}
};

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

<table>
	<tbody>
		{#each PUZZLE_INDEXES as row (row.toString())}
		<tr>
			{#each PUZZLE_INDEXES as column (column.toString())}
			{@const currentCell = puzzle.get(Coordinate.asString(row, column))!}
			{@const currentCellState = SudokuCell.getState(currentCell)}

			<td class="sudoku-cell">
				<input
					id={`${clientSessionId}-${Coordinate.asString(row, column)}`}
					class="sudoku-input {currentCellState}"
					type="text"
					readOnly={true}
					onfocus={handleInputFocus}
					onblur={handleInputBlur}
					onkeydown={handleKeyDown}
					value={SudokuCell.getDisplayString(puzzle.get(Coordinate.asString(row, column))!)}
					max={1}
					data-cellcoordinate={Coordinate.asString(row, column)}
				/>
			</td>
			{/each}
		</tr>
		{/each}
	</tbody>
</table>
