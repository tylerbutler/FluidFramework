/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { IPresence, ISessionClient } from "@fluidframework/presence/alpha";
import type { SudokuAppData } from "../fluid/dataSchema";

export interface SudokuAppProps {
	data: SudokuAppData;
	presence: IPresence;
	sessionClient: ISessionClient;
}
