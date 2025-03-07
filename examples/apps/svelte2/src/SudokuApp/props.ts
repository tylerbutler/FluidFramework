/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { IPresence, ISessionClient } from "@fluidframework/presence/alpha";
import type { SvelteMap } from "svelte/reactivity";
import type { SudokuAppData } from "../fluid/dataSchema";
import type { CellCoordinate } from "../coordinate";

export interface SudokuAppProps {
	readonly data: SudokuAppData;
	readonly presence: IPresence;
	readonly sessionClient: ISessionClient;
}
