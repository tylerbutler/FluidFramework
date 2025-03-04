import { TreeViewConfiguration } from "fluid-framework";
import { SudokuCellData } from "../SudokuCell/cellData.svelte";
import { schemaFactory as sf } from "./schemaFactory";

export class SudokuRow extends sf.array("SudokuRow", SudokuCellData) {
	// public newSudokuRow(data: SudokuCellData[]): SudokuRow {
	// 	return new SudokuRow(data);
	// }
}

export class SudokuGrid extends sf.array("SudokuGrid", SudokuRow) {
	// public newSudokuGrid(data: SudokuRow[]): SudokuGrid {
	// 	return new SudokuGrid(data);
	// }
}

/**
 * Main app data schema.
 */
export class SudokuAppData extends sf.object("SudokuAppData", {
	grid: SudokuGrid,
}) {}

export const sudokuTreeConfiguration = new TreeViewConfiguration({ schema: SudokuAppData });

export interface SudokuAppDataInterface extends SudokuAppData {}
