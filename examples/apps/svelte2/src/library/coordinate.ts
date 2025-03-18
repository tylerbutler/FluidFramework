/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { isSudokuNumber, type SudokuNumber } from "./sudokuNumber";

/**
 * A [row, column] tuple designating the position of a cell within the SudokuGrid.
 */
export type CellCoordinate = readonly [SudokuNumber, SudokuNumber];

/**
 * This type wrapper around string is useful within this codebase to differentiate functions that are expecting strings
 * in a particular format - a CoordinateString - vs those that expect "any old string."
 */
export type CoordinateString = string;

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Coordinate {
	/**
	 * Given two numbers, returns a 2-dimensional coordinate string.
	 */
	public static asString = (row: number, column: number): CoordinateString =>
		`${row},${column}`;

	public static fromCellCoordinate = (
		input: Readonly<CellCoordinate>,
	): Readonly<CoordinateString> => Coordinate.asString(input[0], input[1]);

	/**
	 * Returns a 2-item array of individual coordinates as strings.
	 */
	private static asArray(coord: CoordinateString): [string, string] {
		const arr = coord.split(",", 2);
		return [arr[0], arr[1]];
	}

	/**
	 * Returns a 2-item array of individual coordinates as numbers.
	 */
	public static asArrayNumbers(coord: CoordinateString): CellCoordinate {
		const decomposed = Coordinate.asArray(coord).map(Number);
		if (!isSudokuNumber(decomposed[0]) || !isSudokuNumber(decomposed[1])) {
			throw new Error(
				`One of the numbers is not a valid sudoku number: ${decomposed.slice(0, 2)}`,
			);
		}
		return [decomposed[0], decomposed[1]];
	}

	public static moveUp(coord: CoordinateString): CoordinateString {
		const [row, column] = Coordinate.asArrayNumbers(coord);
		const newRow = Math.max(row - 1, 0);
		return Coordinate.asString(newRow, column);
	}

	public static moveDown(coord: CoordinateString): CoordinateString {
		const [row, column] = Coordinate.asArrayNumbers(coord);
		const newRow = Math.min(row + 1, 8);
		return Coordinate.asString(newRow, column);
	}

	public static moveLeft(coord: CoordinateString): CoordinateString {
		const [row, column] = Coordinate.asArrayNumbers(coord);
		const newColumn = Math.max(column - 1, 0);
		return Coordinate.asString(row, newColumn);
	}

	public static moveRight(coord: CoordinateString): CoordinateString {
		const [row, column] = Coordinate.asArrayNumbers(coord);
		const newColumn = Math.min(column + 1, 8);
		return Coordinate.asString(row, newColumn);
	}
}
