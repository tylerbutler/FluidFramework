import { TreeViewConfiguration } from "fluid-framework";
import { SudokuCellData } from "../SudokuCell/cellData.svelte";
import { schemaFactory as sf } from "./schemaFactory";

export class SudokuRow extends sf.array("SudokuRow", SudokuCellData) {}

export class SudokuGrid extends sf.array("SudokuRow", SudokuRow) {}

/**
 * Main app data schema.
 */
export class SudokuAppData extends sf.object("SudokuData", {
	grid: SudokuGrid,
}) {}

export const sudokuTreeConfiguration = new TreeViewConfiguration({ schema: SudokuAppData });
