/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { ISessionClient } from "@fluidframework/presence/alpha";
import type { SvelteSet } from "svelte/reactivity";

export interface CellPresenceProps {
	owners: SvelteSet<ISessionClient>;
}
