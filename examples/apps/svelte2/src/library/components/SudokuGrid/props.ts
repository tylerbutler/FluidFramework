/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { ISessionClient } from "@fluidframework/presence/alpha";
import type { SudokuGrid } from "$lib/fluid/dataSchema";

export interface SudokuGridComponentProps {
	readonly grid: SudokuGrid;
	readonly sessionClient: ISessionClient;
}
