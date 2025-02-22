/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { CoordinateString } from "./coordinate";
import type { SudokuPuzzle } from "./sudokuPuzzle.svelte";

export interface SudokuAppProps {
	puzzle: SudokuPuzzle;
	clientSessionId: string;
	presence: Map<CoordinateString, boolean>;
}
