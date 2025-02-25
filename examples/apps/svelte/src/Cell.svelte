<script lang="ts">
import type { ISessionClient } from "@fluidframework/presence/alpha";
import uniqolor from "uniqolor";
import { Coordinate, type CoordinateString } from "./coordinate";
import { isSudokuNumber, type SudokuNumber } from "./types";
import { SudokuCell } from "./sudokuCell.svelte";

let {
	cell,
	// coord = $bindable(),
	currentSessionClient,
	// presence,
	onKeyDown,
}: {
	cell: SudokuCell;
	// coord: CoordinateString;
	currentSessionClient: ISessionClient;
	// presence: IPresence;
	onKeyDown: (keyString: string, coordIn: string) => void;
} = $props();

const coordinateDataAttributeName = "cellcoordinate";

const getCellInputElement = (coord: CoordinateString): HTMLInputElement =>
	document.getElementById(`${currentSessionClient}-${coord}`) as HTMLInputElement;

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
			if (cell.fixed) {
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

		if (cell.fixed === true) {
			return;
		}
		cell.value = keyValue;
		cell.isCorrect = keyValue === cell.correctValue;
	}
};

/**
 * Returns CSS border properties to use when rendering a cell. This helps give the grid that authentic Sudoku look.
 */
function getCellBorderStyles(coord: CoordinateString) {
	const borderStyle = "solid medium";
	const styles = {
		borderTop: "none",
		borderBottom: "none",
		borderLeft: "none",
		borderRight: "none",
		borderColor: "var(--neutralPrimaryAlt)",
		paddingTop: 0,
		paddingBottom: 0,
		paddingLeft: 0,
		paddingRight: 0,
	};
	const [row, col] = Coordinate.asArrayNumbers(coord);

	switch (row) {
		case 0:
		case 3:
		case 6:
			styles.borderTop = borderStyle;
			styles.paddingTop = 4;
			break;
		case 2:
		case 5:
		case 8:
			styles.borderBottom = borderStyle;
			styles.paddingBottom = 4;
			break;
		default: // Nothing
	}

	switch (col) {
		case 0:
		case 3:
		case 6:
			styles.borderLeft = borderStyle;
			styles.paddingLeft = 4;
			break;
		case 2:
		case 5:
		case 8:
			styles.borderRight = borderStyle;
			styles.paddingRight = 4;
			break;
		default: // Nothing
	}

	// Converts an object to a CSS style declaration string
	function objectToCssString(obj: Record<string, any>) {
		return Object.entries(obj)
			.map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`)
			.join("; ");
	}

	return objectToCssString(styles);
}

// const additionalClasses = cell.selectedBysessionClients
// 	.map((id) => `presence-${id}`)
// 	.join(" ");
</script>

<!-- <style>
	{#each cell.selectedBysessionClients as id}
		.presence-{id} {
			background-color: {uniqolor(id).dark ? "var(--themeDarker)" : "var(--themeLighter)"};
		}
	{/each}
</style> -->

<td class="sudoku-cell" style={getCellBorderStyles(cell.coordinate)}>
	<input
		id={`${currentSessionClient.sessionId}-${cell.coordinate}`}
		class="sudoku-input {SudokuCell.getState(cell)}"
		type="text"
		readOnly={true}
		onkeydown={handleKeyDown}
		value={SudokuCell.getDisplayString(cell)}
		max={1}
		style={cell.selectedBysessionClients.size > 0
			? uniqolor(currentSessionClient.sessionId).color
			: ""}
		data-cellcoordinate={cell.coordinate}
	/>
</td>
