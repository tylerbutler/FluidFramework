<script lang="ts">
import { Input, TableBodyCell } from "svelte-5-ui-lib";
import { type CoordinateString } from "$lib/coordinate";
import { type SudokuNumber, isSudokuNumber } from "$lib/sudokuNumber";
import type { SudokuCellProps } from "./props";
import CellPresence from "$lib/components/SudokuCellPresence.svelte";
import { coordinateDataAttributeName } from "$lib/constants";
import { getCellBorderClasses, getCellInputClasses } from "./SudokuCell";

const {
	cellData,
	currentSessionClient,
	onKeyDown: keyDownToParent,
	onFocus,
}: SudokuCellProps = $props();

const cellCoordinateId = (c: CoordinateString) => `${currentSessionClient.attendeeId}-${c}`;

const getCellInputElement = (coord: CoordinateString): HTMLInputElement =>
	document.getElementById(cellCoordinateId(coord)) as HTMLInputElement;

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
			keyDownToParent(keyString, coord);
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
</script>

<TableBodyCell
	class="h-[40px] w-[40px] p-0 box-border border-none m-[2px] {getCellBorderClasses(
		cellData.coordinateString,
	).join(' ')}"
>
	<div class="relative p-0 h-[38px] w-[38px]">
		<Input
			id={cellCoordinateId(cellData.coordinateString)}
			class="p-0 h-[38px] w-[38px] box-border text-center rounded-none {getCellInputClasses(
				cellData,
			).join(' ')}"
			readonly={true}
			onfocus={onFocus}
			onkeydown={handleKeyDown}
			value={cellData.displayString}
			max={1}
			data-cellcoordinate={cellData.coordinateString}
		></Input>
		<CellPresence coordinate={cellData.coordinate} />
	</div>
</TableBodyCell>
