/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { ISessionClient } from "@fluidframework/presence/alpha";
import type { CellCoordinate } from "../coordinate";

export interface CellPresenceProps {
	readonly coordinate: CellCoordinate;
	// readonly owners: ISessionClient[];
	// readonly selectionMap: Map<ISessionClient, CellCoordinate>;
}
