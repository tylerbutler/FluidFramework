/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { error } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";

import { getFluidContainer } from "../../../../fluid/init";
import { sudokuTreeConfiguration } from "../../../../fluid/dataSchema";

// export const ssr = false;

export const load: LayoutLoad = async ({ params, parent }) => {
	if (!params.containerId) {
		error(404, "Fluid container not found");
	}

	const { client } = await parent();

	// Load the container based on the ID in the URL.
	const container = await getFluidContainer(client, params.containerId);

	// Get a view of the tree data from the container.
	const appData = container.initialObjects.appData.viewWith(sudokuTreeConfiguration);
	for (const row of appData.root.grid) {
		console.log(row.map((c) => c._value).join(" "));
	}

	return {
		appData,
		container,
	};
};
