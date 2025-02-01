/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import path from "node:path";
import url from "node:url";
import { FileSystem as fs } from "@rushstack/node-core-library";
import { type Machine, from as createStateMachine } from "jssm";

const loadMachine = (fslFile: string): Machine<unknown> => {
	const machineDefinitionFile = path.join(
		path.dirname(url.fileURLToPath(import.meta.url)),
		fslFile,
	);
	const fsl = fs.readFile(machineDefinitionFile).toString();
	return createStateMachine(fsl);
};

/**
 * An FSL state machine that encodes the Fluid release process.
 */
export const FluidReleaseMachine = loadMachine("FluidRelease.fsl");
