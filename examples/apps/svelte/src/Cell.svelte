<script lang="ts">
import type { ISessionClient, LatestValueManager } from "@fluidframework/presence/alpha";
import { Coordinate, type CellCoordinate, type CoordinateString } from "./coordinate";
import { isSudokuNumber, type SudokuNumber } from "./types";
import { SudokuCell } from "./sudokuCell.svelte";
import { Indicator, Input, TableBodyCell } from "flowbite-svelte";

let {
	cellData = $bindable(),
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
function getCellBorderStyles(coord: CoordinateString) {
	const borderStyle = "solid medium";
	const styles = {
		borderTop: "none",
		borderBottom: "none",
		borderLeft: "none",
		borderRight: "none",
		borderColor: "var(--neutralPrimaryAlt)",
		paddingTop: "0",
		paddingBottom: "0",
		paddingLeft: "0",
		paddingRight: "0",
	};
	const [row, col] = Coordinate.asArrayNumbers(coord);

	switch (row) {
		case 0:
		case 3:
		case 6:
			styles.borderTop = borderStyle;
			// styles.paddingTop = "4px";
			break;
		case 2:
		case 5:
		case 8:
			styles.borderBottom = borderStyle;
			// styles.paddingBottom = "4px";
			break;
		default: // Nothing
	}

	switch (col) {
		case 0:
		case 3:
		case 6:
			styles.borderLeft = borderStyle;
			// styles.paddingLeft = "4px";
			break;
		case 2:
		case 5:
		case 8:
			styles.borderRight = borderStyle;
			// styles.paddingRight = "4px";
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

<!-- <style>
	{#each cell.selectedBysessionClients as id}
		.presence-{id} {
			background-color: {uniqolor(id).dark ? "var(--themeDarker)" : "var(--themeLighter)"};
		}
	{/each}
</style> -->

<!-- <Tooltip
action="prop"
content={cellData.color}
position="top"
arrow={false}
show={cellData.displayTooltip}
theme="remote1"
> -->
<TableBodyCell
class="h-[40px] w-[40px] p-0 box-border border-none"
style={getCellBorderStyles(cellData.coordinate)}
>
	<div class="relative p-0 h-[38px] w-[38px]">
	<Input
		id={cellCoordinateId(cellData.coordinate)}
		class="p0 border box-border text-center rounded-none {cellData.status}"
		type="text"
		readonly={true}
		onfocus={handleInputFocus}
		onblur={handleInputBlur}
		onkeydown={handleKeyDown}
		value={SudokuCell.getDisplayString(cellData)}
		max={1}
		data-cellcoordinate={cellData.coordinate}
	>
</Input>
{#if cellData.owner !== ""}
	<Indicator border placement="top-right" color="blue" size="lg">
	</Indicator>
{/if}
</div>
</TableBodyCell>

<style>
	:global(.tooltip.remote1) {
    --tooltip-background-color: hotpink;
    --tooltip-box-shadow: 0 1px 8px pink;
		--tooltip-font-size: 10px;
		--tooltip-padding: 1px;
  }

.correct {
	--sudoku-input-bg: #9bf49b;
	--sudoku-input-fg: #073d07;
	--sudoku-input-border-color: #0b6a0b;
}

.wrong {
	--sudoku-input-bg: #e7999d;
	--sudoku-input-fg: #a4262c;
	--sudoku-input-border-color: #a4262c;
}

.startingClue {
	--sudoku-input-bg: var(--neutralLighter);
	--sudoku-input-fg: var(--neutralPrimary);
	--sudoku-input-border-color: var(--neutralPrimary);
}
</style>
