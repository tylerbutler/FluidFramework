/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { ISessionClient } from "@fluidframework/presence/alpha";
import type { SudokuCellViewData } from "$lib/fluid/cellData.svelte";

export interface CellComponentProps {
	readonly cellData: SudokuCellViewData;
	readonly currentSessionClient: ISessionClient;
	readonly onKeyDown: (keyString: string, coordIn: string) => void;
	readonly onFocus: (e: FocusEvent) => void;
}
