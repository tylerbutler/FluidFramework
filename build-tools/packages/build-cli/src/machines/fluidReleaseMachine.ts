/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { FileSystem as fs } from "@rushstack/node-core-library";
import { type Machine, from as createStateMachine } from "jssm";

const loadMachine = (fslFile: string): Machine<unknown> => {
	// eslint-disable-next-line unicorn/prefer-module
	const machineDefinitionFile = path.join(__dirname, fslFile);
	const fsl = fs.readFile(machineDefinitionFile).toString();
	return createStateMachine(fsl);
};

/**
 * An FSL state machine that encodes the Fluid release process.
 */
export const FluidReleaseMachine = loadMachine("FluidRelease.fsl");
