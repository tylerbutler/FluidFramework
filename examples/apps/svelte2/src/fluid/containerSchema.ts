/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExperimentalPresenceManager } from "@fluidframework/presence/alpha";
import {
	SchemaFactory,
	SharedTree,
	TreeViewConfiguration,
	type ContainerSchema,
} from "fluid-framework";
import { SudokuGrid } from "./dataSchema";
import { PUZZLE_INDEXES } from "../constants";
import { Coordinate } from "../coordinate";

// Define the schema of the Fluid container.
// This example uses the presence features only, so only that data object is added.
export const containerSchema = {
	initialObjects: {
		appData: SharedTree,
		// A Presence Manager object temporarily needs to be placed within container schema
		// https://github.com/microsoft/FluidFramework/blob/main/packages/framework/presence/README.md#onboarding
		presence: ExperimentalPresenceManager,
	},
} as const satisfies ContainerSchema;

export type SudokuContainerSchema = typeof containerSchema;
