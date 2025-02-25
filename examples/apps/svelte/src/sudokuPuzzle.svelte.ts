/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import sudoku from "sudokus";
import { Coordinate } from "./coordinate";
import { PUZZLE_INDEXES, PUZZLES } from "./constants";
import { SudokuCell } from "./sudokuCell.svelte";
import type { SudokuGrid, SudokuInput } from "../types";

export class SudokuPuzzle {
	public grid: SudokuGrid = $state([]);

	constructor(readonly puzzleInput: SudokuInput) {
		this.loadPuzzle(puzzleInput);
	}

	public loadPuzzle(puzzleInput: SudokuInput): SudokuInput {
		this.grid.length = 0; // Clean the grid; we're rebuilding it.
		const solution = sudoku.solve(puzzleInput) as unknown as SudokuInput;
		for (const row of PUZZLE_INDEXES) {
			const newRow: SudokuCell[] = [];
			for (const col of PUZZLE_INDEXES) {
				const coordinate = Coordinate.asString(row, col);
				const cell = new SudokuCell(puzzleInput[row][col], solution[row][col], coordinate);
				newRow.push(cell);
			}
			this.grid.push(newRow);
		}
		return solution;
	}
}

/**
 * Loads a puzzle into an ISharedMap.
 *
 * @param index - The index of the puzzle to load.
 * @param grid - The shared map that stores puzzle data.
 * @returns An initialized puzzle.
 */
export function loadIncludedPuzzle(index: number): SudokuPuzzle {
	const puzzleInput = PUZZLES[index];
	const puzzle = new SudokuPuzzle(puzzleInput);
	return puzzle;
}
