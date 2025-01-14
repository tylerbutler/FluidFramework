<script lang="ts">
import { Coordinate, type CoordinateString } from "./helpers/coordinate";
import { SudokuCell } from "./helpers/sudokuCell.svelte";
import { type SudokuAppProps } from "./helpers/props";

// export let cell: SudokuCell;

let { currentCell, coord = $bindable(), clientSessionId = "none" } = $props();

// export let clientSessionId: string;
// export let presence: Map<CoordinateString, boolean>;

const coordinateDataAttributeName = "cellcoordinate";

const getCellInputElement = (coord: CoordinateString): HTMLInputElement =>
	document.getElementById(`${clientSessionId}-${coord}`) as HTMLInputElement;

const handleInputFocus = (e: any) => {
	const coord = e.target.dataset[coordinateDataAttributeName];
	if (presence) {
		if (coord !== undefined) {
			presence.set(coord, false);
		}
	}
};

const handleInputBlur = (e: any) => {
	const coord = e.target.dataset[coordinateDataAttributeName];
	if (presence) {
		if (coord !== undefined) {
			presence.set(coord, true);
		}
	}
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
</script>

<td class="sudoku-cell" style={getCellBorderStyles(coord)}>
	<input
		id={`${clientSessionId}-${coord}`}
		class="sudoku-input {currentCellState}"
		type="text"
		readOnly={true}
		onfocus={handleInputFocus}
		onblur={handleInputBlur}
		onkeydown={handleKeyDown}
			bind:value={currentCell.value}
		max={1}
		data-cellcoordinate={coord}
	/>
</td>
