/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExperimentalPresenceManager } from "@fluidframework/presence/alpha";
import { SharedTree, type ContainerSchema } from "fluid-framework";

/**
 * The schema of the Fluid container.
 */
export const containerSchema = {
	initialObjects: {
		appData: SharedTree,
		// A Presence Manager object temporarily needs to be placed within container schema
		// https://github.com/microsoft/FluidFramework/blob/main/packages/framework/presence/README.md#onboarding
		presence: ExperimentalPresenceManager,
	},
} as const satisfies ContainerSchema;

// unused
export type SudokuContainerSchema = typeof containerSchema;
