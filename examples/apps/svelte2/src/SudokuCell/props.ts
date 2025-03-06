/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { ISessionClient } from "@fluidframework/presence/alpha";
import type { SudokuCellData } from "../fluid/cellData.svelte";

export interface CellComponentProps {
	readonly cellData: SudokuCellData;
	readonly currentSessionClient: ISessionClient;
	onKeyDown: (keyString: string, coordIn: string) => void;
	onFocus: (e: FocusEvent) => void;
}
