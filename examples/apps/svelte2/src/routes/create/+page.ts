/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { PageLoad } from "./$types";
import { createFluidContainer } from "../../fluid/init";
import { redirect } from "@sveltejs/kit";

export const load: PageLoad = async () => {
	const { containerId } = await createFluidContainer();

	// Redirect to the session page with the newly created container's ID. Note that
	// this is inefficient because it connects to a container then immediately disconnects
	// and reconnects on the new page load. This could possibly be avoided using the History
	// API to add a "fake" navigation.
	redirect(301, `/s/${containerId}`);
};
