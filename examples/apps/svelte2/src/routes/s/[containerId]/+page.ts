/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { acquirePresenceViaDataObject } from "@fluidframework/presence/alpha";
import type { PageLoad } from "./$types";
import { getFluidContainer } from "../../../fluid/init";
import { sudokuTreeConfiguration } from "../../../fluid/dataSchema";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({ params }) => {
	if (!params.containerId) {
		error(404, "Fluid container not found");
	}

	// Load the container based on the ID in the URL.
	const container = await getFluidContainer(params.containerId);

	// Get a view of the tree data from the container.
	const appData = container.initialObjects.appData.viewWith(sudokuTreeConfiguration);
	for (const row of appData.root.grid) {
		console.log(row.map((c) => c._value).join(" "));
	}

	// Retrieve a reference to the presence APIs via the data object.
	const presence = acquirePresenceViaDataObject(container.initialObjects.presence);

	return {
		appData,
		presence,
	};
};
