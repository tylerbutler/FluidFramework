/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { IPresence, ISessionClient } from "@fluidframework/presence/alpha";
import type { SudokuAppData } from "$lib/fluid/dataSchema";

export interface SudokuAppProps {
	readonly data: SudokuAppData;
	readonly presence: IPresence;
	readonly sessionClient: ISessionClient;
}
