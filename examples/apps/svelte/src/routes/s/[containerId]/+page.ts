/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { acquirePresenceViaDataObject } from "@fluidframework/presence/alpha";
import type { PageLoad } from "./$types";
import { getFluidContainer } from "../../../fluid/init";

export const load: PageLoad = async ({ params }) => {
	const container = await getFluidContainer(params.containerId);

	// // Retrieve a reference to the presence APIs via the data object.
	const presence = acquirePresenceViaDataObject(container.initialObjects.presence);

	// if (!containerId) {
	// 	error(404, "Not found");
	// }

	return {
		// container,
		// containerId: params.containerId,
		presence,
		sessionClient: presence.getMyself(),
	};
};
