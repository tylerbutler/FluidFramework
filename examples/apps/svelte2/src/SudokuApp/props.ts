/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { IPresence, ISessionClient } from "@fluidframework/presence/alpha";
import type { UserResource } from "@clerk/types";
import type { SudokuAppData } from "../fluid/dataSchema";

export interface SudokuAppProps {
	readonly data: SudokuAppData;
	readonly presence: IPresence;
	readonly sessionClient: ISessionClient;
	readonly user?: UserResource | undefined | null;
}
