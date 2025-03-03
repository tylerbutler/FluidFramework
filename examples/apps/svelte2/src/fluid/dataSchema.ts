import { SudokuCellData } from "../SudokuCell/cellData.svelte";
import { schemaFactory as sf } from "./schemaFactory";

// export class SudokuCells extends sf.array("SudokuCells", SudokuCellData){}

export class SudokuRow extends sf.array("SudokuRow", sf.array("SudokuCells", SudokuCellData)){}

export class SudokuGrid extends sf.array(
	"SudokuRow",
	SudokuRow
	// sf.array("SudokuCells", SudokuCellData),
) {}

/**
 * Main app data schema.
 */
export class SudokuAppData extends sf.object("SudokuData", {
	grid: SudokuGrid,
}) {}
