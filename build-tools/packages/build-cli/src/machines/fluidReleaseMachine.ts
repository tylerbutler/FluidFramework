/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import { FileSystem as fs } from "@rushstack/node-core-library";
import { from as createStateMachine } from "jssm";
import path from "path";

const loadMachine = (fslFile: string) => {
	// eslint-disable-next-line unicorn/prefer-module
	const machineDefinitionFile = path.join(__dirname, fslFile);
	const fsl = fs.readFile(machineDefinitionFile).toString();
	return createStateMachine(fsl);
};

/**
 * An FSL state machine that encodes the Fluid release process.
 */
export const FluidReleaseMachine = loadMachine("FluidRelease.fsl");
