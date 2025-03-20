import type { CoordinateString } from "$lib/coordinate";
import type { SudokuNumber } from "$lib/sudokuNumber";

/**
 * This abstract class is used to generate a reactive class whose properties are reactive with a backing SharedTree for
 * data storage and synchronization.
 */
export abstract class CellData {
	public abstract get value(): SudokuNumber;
	public abstract set value(v: SudokuNumber);

	public abstract get correctValue(): SudokuNumber;
	public abstract set correctValue(v: SudokuNumber);

	public abstract get startingClue(): boolean;
	public abstract set startingClue(v: boolean);

	public abstract get coordinate(): CoordinateString;
}
