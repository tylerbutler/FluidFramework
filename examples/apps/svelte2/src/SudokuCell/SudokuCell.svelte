<script lang="ts">
import { Input, TableBodyCell } from "svelte-5-ui-lib";
import { Coordinate, type CoordinateString } from "../coordinate";
import { type SudokuNumber, isSudokuNumber } from "../sudokuNumber";
import type { CellComponentProps } from "./props";
import CellPresence from "../SudokuCellPresence/SudokuCellPresence.svelte";
import { coordinateDataAttributeName } from "../constants";
import { Tree } from "fluid-framework";

let { cellData, currentSessionClient, onKeyDown, onFocus }: CellComponentProps = $props();

Tree.on(cellData, "nodeChanged", () => {
	cellData.refreshReactiveProperties();
});
cellData.refreshReactiveProperties();

const cellCoordinateId = (c: CoordinateString) => `${currentSessionClient.sessionId}-${c}`;

const getCellInputElement = (coord: CoordinateString): HTMLInputElement =>
	document.getElementById(cellCoordinateId(coord)) as HTMLInputElement;

// const handleInputFocus = (e: any) => {
// 	const coord: CoordinateString = e.target.dataset[coordinateDataAttributeName];
// 	if (coord !== undefined) {
// 		selectionManager.local = Coordinate.asArrayNumbers(coord);
// 	}
// };

// const handleInputBlur = (e: FocusEvent) => {
// 	// Remove the owner from the old cell
// 	const entryIndex = cellData.remoteOwners.findIndex(
// 			(owner) => owner === currentSessionClient,
// 		);
// 		if(entryIndex !== -1) {
// 			cellData.remoteOwners.splice(entryIndex, 1);
// 		}

// 	// 	const [oldRow, oldColumn] = Coordinate.asArrayNumbers(coord);
// 	// console.log("removing owner from cell", oldRow, oldColumn);
// 	// grid[oldRow][oldColumn].remoteOwners.delete(sessionClient);
// 	console.log($state.snapshot(cellData.remoteOwners));
// };

const handleKeyDown = (e: any) => {
	e.preventDefault();
	let keyString = e.key;
	let coord = e.currentTarget.dataset[coordinateDataAttributeName] as string;
	coord = coord === undefined ? "" : coord;

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
			if (cellData.startingClue) {
				return;
			}
			numericInput(keyString, coord);
			return;
		default:
			onKeyDown(keyString, coord);
			return;
	}
};

const numericInput = (keyString: string, coord: string) => {
	const checkValue = Number(keyString);
	const keyValue: SudokuNumber = isSudokuNumber(checkValue) ? checkValue : 0;

	if (coord !== undefined) {
		const cellInputElement = getCellInputElement(coord);
		cellInputElement.value = keyString;

		if (cellData.startingClue === true) {
			return;
		}
		cellData.value = keyValue;
	}
};

/**
 * Returns CSS border properties to use when rendering a cell. This helps give the grid that authentic Sudoku look.
 */
function getCellBorderClasses(coord: CoordinateString) {
	const [row, col] = Coordinate.asArrayNumbers(coord);
	const classes: string[] = ["border-solid"];
	switch (row) {
		case 0:
		case 3:
		case 6:
			classes.push("border-t-2 pt-[4px]");
			break;
		case 2:
		case 5:
		case 8:
			classes.push("border-b-2 pb-[4px]");
			break;
		default: // Nothing
	}

	switch (col) {
		case 0:
		case 3:
		case 6:
			classes.push("border-l-2 pl-[4px]");
			break;
		case 2:
		case 5:
		case 8:
			classes.push("border-r-2 pr-[4px]");
			break;
		default: // Nothing
	}

	return classes;
}

// const borderClasses = getCellBorderClasses(cellData.coordinate);
function getCellInputClasses() {
	switch (cellData.status) {
		case "startingClue":
			return [
				// "border-gray-400",
				"bg-gray-100",
				"italic",
				"text-gray-500",
			];
		case "correct":
			return ["border", "border-green-800", "bg-green-300"];
		case "wrong":
			return ["border", "border-red-800", "bg-red-300"];
		case "empty":
		// intentional fallthrough
		default:
			return ["border"];
	}
}
</script>

<TableBodyCell
	class="h-[40px] w-[40px] p-0 box-border border-none m-[2px] {getCellBorderClasses(
		cellData.coordinateString,
	).join(' ')}"
>
	<div class="relative p-0 h-[38px] w-[38px]">
		<Input
			id={cellCoordinateId(cellData.coordinateString)}
			class="p-0 h-[38px] w-[38px] box-border text-center rounded-none {getCellInputClasses().join(
				' ',
			)}"
			readonly={true}
			onfocus={onFocus}
			onkeydown={handleKeyDown}
			value={cellData.displayString}
			max={1}
			data-cellcoordinate={cellData.coordinateString}
		></Input>
		<CellPresence />
	</div>
</TableBodyCell>
