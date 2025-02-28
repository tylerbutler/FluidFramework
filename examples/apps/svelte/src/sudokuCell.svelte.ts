/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import sudoku from "sudokus";
import type { SudokuNumber } from "./types";
import uniqolor from "uniqolor";
import { SvelteSet } from "svelte/reactivity";

export const CellState = {
	empty: "empty",
	startingClue: "startingClue",
	wrong: "wrong",
	correct: "correct",
} as const;

export type CellState = (typeof CellState)[keyof typeof CellState];

// export type HexColor = `#${string & { length: 6 }}`;

// export interface CellSelected {
// 	name: string;
// 	color: HexColor;
// }

/**
 * The SudokuCell class is used to store data about a cell in the Sudoku grid. The class is intended to be
 * JSON-serialized, so static get/set methods are provided for common data manipulation needs rather than functions on a
 * class instance.
 */
export class SudokuCell implements sudoku.Cell {
	/**
	 * True if the cell is one of the starting "clues" in the Sudoku; false otherwise.
	 */
	public readonly startingClue: boolean;

	public value = $state<SudokuNumber>(0);

	public remoteOwners: SvelteSet<string> = $state(new SvelteSet());

	public ownerCount = $derived(this.remoteOwners.size);

	// public color = $derived(uniqolor(this.owner).color);

	// public displayTooltip = $derived(this.owner !== "");

	/**
	 * True if the value in the cell is correct; false otherwise.
	 */
	public isCorrect = $derived.by(() => this.value === this.correctValue);

	/**
	 * Creates a new SudokuCell instance.
	 *
	 * @param value - The value of the cell to initialize. Can be any single digit 0-9. 0 indicates an empty cell.
	 * Invalid values will be treated as 0.
	 * @param correctValue - The correct (solved) value of the cell.
	 * @param coordinate - The coordinate of the cell in the grid.
	 */
	public constructor(
		value: SudokuNumber,
		private readonly correctValue: SudokuNumber,
		public readonly coordinate: string,
	) {
		this.value = Number.isSafeInteger(value) ? value : 0;
		this.startingClue = this.value !== 0;
	}

	public toString(): string {
		return `SudokuCell: ${JSON.stringify(this)}`;
	}

	/**
	 * Returns the appropriate CellState for the cell. This state can be used to render the cell differently.
	 */
	public status: CellState = $derived.by(() => {
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

	/**
	 * Returns a string representation of the cell's value suitable for display.
	 */
	public displayString: string = $derived.by(() => {
		$inspect(this);
		if (this.startingClue || this.value !== 0) {
			return this.value.toString();
		}
		return "";
	});
}
