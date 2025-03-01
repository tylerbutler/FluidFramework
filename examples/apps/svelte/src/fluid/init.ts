/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { TinyliciousClient } from "@fluidframework/tinylicious-client";
import { containerSchema, type SudokuAppSchema } from "./schema";
import { TreeViewConfiguration, type IFluidContainer } from "fluid-framework";
import { SudokuCellData, SudokuGrid } from "./appData";
import { PUZZLE_INDEXES } from "../constants";

const client = new TinyliciousClient();

export async function createFluidContainer() {
	// The client will create a new detached container using the schema
	// A detached container will enable the app to modify the container before attaching it to the client
	const { container } = await client.createContainer(containerSchema, "2");

	// Populate the default data before we attach

	// If the app is in a `createNew` state, and the container is detached, we attach the container.
	// This uploads the container to the service and connects to the collaboration session.
	// The newly attached container is given a unique ID that can be used to access the container in another session
	const containerId = await container.attach();
	return { containerId, container };

	// // Retrieve a reference to the presence APIs via the data object.
	// const presence = acquirePresenceViaDataObject(container.initialObjects.presence);
	// return { containerId: containerIdToReturn, container, presence };
}

export async function getFluidContainer(containerId: string) {
	// Use the unique container ID to fetch the container created earlier.  It will already be connected to the
	// collaboration session.
	const { container } = await client.getContainer(containerId, containerSchema, "2");
	return container;
}

const treeConfiguration = new TreeViewConfiguration({ schema: SudokuGrid });

function initializeContainerData(container: IFluidContainer<SudokuAppSchema>) {
	const appData = container.initialObjects.appData.viewWith(treeConfiguration);

	const newGrid: SudokuCellData[][] = [];
const newRow: SudokuCellData[] = [];
for (const row of PUZZLE_INDEXES) {
	for (const col of PUZZLE_INDEXES) {
		const cell = new SudokuCellData({
			coordinate: [row, col],
			startingClue: false,
			value: 0,
		});
		newRow.push(cell);
	}
	newGrid.push(newRow);
}

appData.initialize(
	new SudokuGrid(newGrid),
);
}
