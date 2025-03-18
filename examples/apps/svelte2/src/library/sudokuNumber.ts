/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

export type SudokuNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export function isSudokuNumber(input: number): input is SudokuNumber {
	return input >= 0 && input <= 9;
}
