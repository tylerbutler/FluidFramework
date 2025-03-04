import type { Cell as CellInterface } from "sudokus";
import { SvelteSet } from "svelte/reactivity";
import { schemaFactory as sf } from "../fluid/schemaFactory";
import type { ISessionClient, LatestValueManager } from "@fluidframework/presence/alpha";
import { Coordinate, type CellCoordinate } from "../coordinate";

export const CellState = {
	empty: "empty",
	startingClue: "startingClue",
	wrong: "wrong",
	correct: "correct",
} as const;

export type CellState = (typeof CellState)[keyof typeof CellState];

/**
 * This class represents a Sudoku Cell's shared, persisted data, which is stored in a Fluid SharedTree.
 */
export class CellPersistedData extends sf.object("CellPersistedData", {
	/**
	 * The value stored in the cell. This should be a value between 0 and 9 inclusive. 0 represents an empty cell.
	 */
	value: sf.number,

	/**
	 * The correct value of the cell.
	 */
	correctValue: sf.number,

	/**
	 * True if the cell's value is provided as part of the starting clues for the puzzle; false otherwise.
	 */
	startingClue: sf.boolean,

	/**
	 * The coordinate of the cell in the Sudoku grid, stored as a 2-item array. The first number is row in which the cell
	 * is positioned, while the second is the column. The coordinate system is 0-based starting at the upper left; that
	 * is, `[0,0]` represents the upper-leftmost cell, `[0,1]` is to its immediate right, etc.
	 */
	coordinate: sf.array(sf.number),
}) {
	/**
	 * True if the value in the cell is correct; false otherwise.
	 */
	public get isCorrect() {
		return this.value === this.correctValue;
	}

	public get coordinateString() {
		return Coordinate.asString(this.coordinate[0], this.coordinate[1]);
	}
}

/**
 * Represents the cell data that is local to each client.
 */
export interface CellLocalData {
	/**
	 * Returns a string representation of the cell's value suitable for display.
	 */
	readonly displayString: string;

	/**
	 * The list of clients that have the current cell selected. Excludes the current client.
	 */
	remoteOwners: Set<ISessionClient>;
}

export class SudokuCellData extends CellPersistedData implements CellLocalData, CellInterface {
	public remoteOwners = $state(new SvelteSet<ISessionClient>());

	// public persistedData = $state(CellPersistedData)

	public displayString = $derived.by(() => {
		if (this.startingClue || this.value !== 0) {
			return this.value.toString();
		}
		return "";
	});

	/**
	 * Returns the appropriate CellState for the cell. This state can be used to render the cell differently.
	 */
	public status = $derived.by(() => {
		if (this.value === 0) {
			return CellState.empty;
		}

		if (this.startingClue) {
			return CellState.startingClue;
		}

		if (this.isCorrect) {
			return CellState.correct;
		}

		return CellState.wrong;
	});

	public get fixed() {
		return this.startingClue;
	}
}

export interface CellComponentProps {
	cellData: SudokuCellData;
	readonly currentSessionClient: ISessionClient;
	readonly selectionManager: LatestValueManager<CellCoordinate>;
	onKeyDown: (keyString: string, coordIn: string) => void;
}
