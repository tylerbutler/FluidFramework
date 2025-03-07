/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { TinyliciousClient } from "@fluidframework/tinylicious-client";
import { containerSchema } from "./containerSchema";
import type { TreeView } from "fluid-framework";
import {
	SudokuGrid,
	SudokuRow,
	sudokuTreeConfiguration,
	type SudokuAppData,
} from "./dataSchema";
import { PUZZLE_INDEXES } from "../constants";
import { SudokuCellDataInternal } from "./cellData.svelte";

const client = new TinyliciousClient();

export async function createFluidContainer() {
	// The client will create a new detached container using the schema
	// A detached container will enable the app to modify the container before attaching it to the client
	const { container } = await client.createContainer(containerSchema, "2");

	// Populate the default data before we attach
	const appData = container.initialObjects.appData.viewWith(sudokuTreeConfiguration);
	initializeContainerData(appData);

	// Attach the container and return it along with its ID.
	const containerId = await container.attach();
	return { containerId, container };
}

export async function getFluidContainer(containerId: string) {
	// Use the unique container ID to fetch the container created earlier.
	const { container } = await client.getContainer(containerId, containerSchema, "2");
	return container;
}

function initializeContainerData(appData: TreeView<typeof SudokuAppData>): void {
	const newGridData: SudokuRow[] = [];
	for (const row of PUZZLE_INDEXES) {
		const newRowData: SudokuCellDataInternal[] = [];
		for (const col of PUZZLE_INDEXES) {
			const cell = new SudokuCellDataInternal({
				_coordinate: [row, col],
				_startingClue: false,
				_correctValue: 0,
				_value: 0,
			});
			newRowData.push(cell);
		}
		newGridData.push(new SudokuRow(newRowData));
	}

	const grid = new SudokuGrid(newGridData);
	appData.initialize({ grid, solutions: {} });
}
