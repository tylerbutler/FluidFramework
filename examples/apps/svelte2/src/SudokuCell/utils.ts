import type { SudokuCellViewData } from "$lib/fluid/cellData.svelte";
import { type CoordinateString, Coordinate } from "../coordinate";

/**
 * Returns CSS border properties to use when rendering a cell. This helps give the grid that authentic Sudoku look.
 */
export function getCellBorderClasses(coord: CoordinateString) {
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
export function getCellInputClasses(cellData: SudokuCellViewData) {
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
