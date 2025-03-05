import type { ISessionClient } from "@fluidframework/presence/alpha";
import { SvelteSet } from "svelte/reactivity";
import { Coordinate } from "../coordinate";
import { schemaFactory as sf } from "./schemaFactory";
import { isSudokuNumber, type SudokuNumber } from "../sudokuNumber";
import { Tree } from "fluid-framework";

/**
 * This class represents a Sudoku Cell's shared, persisted data, which is stored in a Fluid SharedTree.
 */
export class CellPersistedData extends sf.object("CellPersistedData", {
	/**
	 * The value stored in the cell. This should be a value between 0 and 9 inclusive. 0 represents an empty cell.
	 */
	_value: sf.number,

	/**
	 * The correct value of the cell.
	 */
	_correctValue: sf.number,

	/**
	 * True if the cell's value is provided as part of the starting clues for the puzzle; false otherwise.
	 */
	_startingClue: sf.boolean,

	/**
	 * The coordinate of the cell in the Sudoku grid, stored as a 2-item array. The first number is row in which the cell
	 * is positioned, while the second is the column. The coordinate system is 0-based starting at the upper left; that
	 * is, `[0,0]` represents the upper-leftmost cell, `[0,1]` is to its immediate right, etc.
	 */
	_coordinate: sf.array(sf.number),
}) {
	/**
	 * True if the value in the cell is correct; false otherwise.
	 */
	public get isCorrect() {
		return !this._startingClue && this._value === this._correctValue;
	}

	public get coordinateString() {
		return Coordinate.asString(this._coordinate[0], this._coordinate[1]);
	}
}

export const CellState = {
	empty: "empty",
	startingClue: "startingClue",
	wrong: "wrong",
	correct: "correct",
} as const;

export type CellState = (typeof CellState)[keyof typeof CellState];

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
	remoteOwners: SvelteSet<ISessionClient>;
}

export class SudokuCellData extends CellPersistedData implements CellLocalData {
	public remoteOwners = $state(new SvelteSet<ISessionClient>());
	// public get remoteOwners() {
	// 	return this.#remoteOwners;
	// }
	// public set remoteOwners(s) {
	// 	this.#remoteOwners = s;
	// }

	#value: SudokuNumber = $state(0);
	public set value(v) {
		// set the persisted data, which will trigger an event that will update the local data.
		this._value = v;
	}
	public get value() {
		return this.#value;
	}

	#correctValue: SudokuNumber = $state(0);
	public get correctValue() {
		return this.#correctValue;
	}
	public set correctValue(v) {
		// set the persisted data, which will trigger an event that will update the local data.
		this._correctValue = v;
	}

	#startingClue: boolean = $state(false);
	public get startingClue() {
		return this.#startingClue;
	}
	public set startingClue(clue) {
		this._startingClue = clue;
	}

	public refreshReactiveProperties(): void {
		if (!isSudokuNumber(this._value) || !isSudokuNumber(this._correctValue)) {
			throw new Error(
				`Value is not a valid sudoku number: ${this._value} or ${this._correctValue}`,
			);
		}
		console.log(`Refreshing reactive properties for cell: ${this.coordinateString}`);
		console.log(
			`value: ${this._value} | correctValue: ${this._correctValue} | isCorrect: ${this.isCorrect} | startingClue: ${this._startingClue}`,
		);
		// console.log(`startingClue: ${this._startingClue}`);
		this.#startingClue = this._startingClue;

		this.#value = this._value as SudokuNumber;
		// console.log(`correctValue: ${this._correctValue}`);
		this.#correctValue = this._correctValue as SudokuNumber;
	}

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
		// console.log(
		// 	`status for cell ${this.coordinateString}: value: ${this.value} | startingClue: ${this.startingClue} |`,
		// );
		if (this.value === 0) {
			return CellState.empty;
		}

		if (this.startingClue) {
			return CellState.startingClue;
		}

		if (this.isCorrect && !this.startingClue) {
			return CellState.correct;
		}

		return CellState.wrong;
	});
}
