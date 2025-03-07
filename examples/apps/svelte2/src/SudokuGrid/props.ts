/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { ISessionClient, LatestValueManager } from "@fluidframework/presence/alpha";
import type { CellCoordinate } from "../coordinate";
import type { SudokuGrid } from "../fluid/dataSchema";

export interface SudokuGridComponentProps {
	readonly grid: SudokuGrid;
	readonly sessionClient: ISessionClient;
}
