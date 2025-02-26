<script lang="ts">
import type { ISessionClient, LatestValueManager } from "@fluidframework/presence/alpha";
import { Coordinate, type CellCoordinate, type CoordinateString } from "./coordinate";
import { isSudokuNumber, type SudokuNumber } from "./types";
import { SudokuCell } from "./sudokuCell.svelte";

let {
	cellData = $bindable(),
	// coord = $bindable(),
	currentSessionClient,
	selectionManager,
	onKeyDown,
}: {
	cellData: SudokuCell;
	// coord: CoordinateString;
	currentSessionClient: ISessionClient;
	readonly selectionManager: LatestValueManager<CellCoordinate>;
	onKeyDown: (keyString: string, coordIn: string) => void;
} = $props();

const coordinateDataAttributeName = "cellcoordinate";
const cellCoordinateId = (c: CoordinateString) => `${currentSessionClient.sessionId}-${c}`;

const getCellInputElement = (coord: CoordinateString): HTMLInputElement =>
	document.getElementById(cellCoordinateId(coord)) as HTMLInputElement;

const handleInputFocus = (e: any) => {
	const coord: CoordinateString = e.target.dataset[coordinateDataAttributeName];
	if (coord !== undefined) {
		selectionManager.local = Coordinate.asArrayNumbers(coord);
		cellData.owner = currentSessionClient.sessionId;
	}
};

const handleInputBlur = (e: any) => {
	const coord: CoordinateString = e.target.dataset[coordinateDataAttributeName];
	if (coord !== undefined) {
		cellData.owner = "";
		console.log(`cell ${coord} set to empty owner`);
	}
};

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
			if (cellData.fixed) {
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

		if (cellData.fixed === true) {
			return;
		}
		cellData.value = keyValue;
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

<td class="sudoku-cell" style={getCellBorderStyles(cellData.coordinate)}>
	<!-- {#each cell.selectedBysessionClients as session} -->
	<!-- {#if cell.owners.size > 0}
		<Tooltip
			position="top"
			arrow={false}
			content={"user"}
			show={true}
			style={{ style: { backgroundColor: `"${uniqolor([...cell.owners][0])}"` } }}
		></Tooltip>
		{/if} -->
	<!-- "color: {uniqolor(session.sessionId).color ? "var(--themeDarker)" : "var(--themeLighter)"}" -->
	<!-- {/each} -->
	<!-- <Tooltip content="Hello world!">
		Check out my tooltip
	</Tooltip> -->
	<input
		id={cellCoordinateId(cellData.coordinate)}
		class="sudoku-input {cellData.status}"
		type="text"
		readOnly={true}
		onfocus={handleInputFocus}
		onblur={handleInputBlur}
		onkeydown={handleKeyDown}
		value={SudokuCell.getDisplayString(cellData)}
		max={1}
		data-cellcoordinate={cellData.coordinate}
	/>
</td>
