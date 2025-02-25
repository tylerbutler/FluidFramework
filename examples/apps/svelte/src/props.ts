/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { IPresence, ISessionClient } from "@fluidframework/presence/alpha";
import type { SudokuPuzzle } from "./sudokuPuzzle.svelte";

export interface SudokuAppProps {
	puzzle: SudokuPuzzle;
	presence: IPresence;
	sessionClient: ISessionClient;
}
