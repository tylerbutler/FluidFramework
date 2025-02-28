<script lang="ts">
	import type { ISessionClient, LatestValueManager } from "@fluidframework/presence/alpha";
	import { Indicator, Input, TableBodyCell, type ColorType } from "svelte-5-ui-lib";
	import { Coordinate, type CellCoordinate, type CoordinateString } from "./coordinate";
	import { isSudokuNumber, type SudokuNumber } from "./types";
	import { SudokuCell } from "./sudokuCell.svelte";
	import { mapStringToColor } from "./colors";

	let {
		cellData = $bindable(),
		currentSessionClient,
		selectionManager,
		onKeyDown, // classList,
	}: {
		cellData: SudokuCell;
		currentSessionClient: ISessionClient;
		readonly selectionManager: LatestValueManager<CellCoordinate>;
		onKeyDown: (keyString: string, coordIn: string) => void;
		// classList: string[];
	} = $props();

	const coordinateDataAttributeName = "cellcoordinate";
	const cellCoordinateId = (c: CoordinateString) => `${currentSessionClient.sessionId}-${c}`;

	const getCellInputElement = (coord: CoordinateString): HTMLInputElement =>
		document.getElementById(cellCoordinateId(coord)) as HTMLInputElement;

	const handleInputFocus = (e: any) => {
		const coord: CoordinateString = e.target.dataset[coordinateDataAttributeName];
		if (coord !== undefined) {
			selectionManager.local = Coordinate.asArrayNumbers(coord);
		}
	};

	const handleInputBlur = (e: any) => {
		// do nothing
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
			case "correct":
				return ["border", "border-green-800", "bg-green-300"];
			case "wrong":
				return ["border", "border-red-800", "bg-red-300"];
			case "startingClue":
				return [
					// "border-gray-400",
					"bg-gray-100",
					"italic",
					"text-gray-500",
				];
			case "empty":
			// intentional fallthrough
			default:
				return ["border"];
		}
	}

	function getPresenceIndicatorPosition(index: number) {
		switch (index) {
			case 0:
				return "top-right";
			case 1:
				return "top-center";
			case 2:
				return "top-left";
			case 3:
				return "center-right";
			case 4:
				return "center-left";
			case 5:
				return "bottom-right";
			case 6:
				return "bottom-center";
			case 7:
				return "bottom-left";
			default:
				throw new Error("Invalid index");
		}
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
	class="h-[40px] w-[40px] p-0 box-border border-none m-[2px] {getCellBorderClasses(
		cellData.coordinate,
	).join(' ')}"
>
	<div class="relative p-0 h-[38px] w-[38px]">
		<Input
			id={cellCoordinateId(cellData.coordinate)}
			class="p-0 h-[38px] w-[38px] box-border text-center rounded-none {getCellInputClasses().join(
				' ',
			)}"
			type="text"
			readonly={true}
			onfocus={handleInputFocus}
			onblur={handleInputBlur}
			onkeydown={handleKeyDown}
			value={SudokuCell.getDisplayString(cellData)}
			max={1}
			data-cellcoordinate={cellData.coordinate}
		></Input>
		{#each cellData.remoteOwners as owner, index}
			{#if index < 8}
			<Indicator
				color={mapStringToColor(owner)}
				border
				size="xl"
				placement={getPresenceIndicatorPosition(index)}
			>
				<span class="text-xs font-bold text-white">{index}</span>
			</Indicator>
			{/if}
		{/each}
	</div>
</TableBodyCell>

<style>
	:global(.tooltip.remote1) {
		--tooltip-background-color: hotpink;
		--tooltip-box-shadow: 0 1px 8px pink;
		--tooltip-font-size: 10px;
		--tooltip-padding: 1px;
	}
</style>
