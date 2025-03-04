/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { PageLoad } from "./$types";
import { createFluidContainer } from "../fluid/init";
import { redirect } from "@sveltejs/kit";

// export const load: PageLoad = async () => {
// 	const { containerId, container } = await createFluidContainer();

// 	// Retrieve a reference to the presence APIs via the data object.
// 	const presence = acquirePresenceViaDataObject(container.initialObjects.presence);

// 	// if (!containerId) {
// 	// 	error(404, "Not found");
// 	// }

// 	return {
// 		container,
// 		containerId,
// 		presence,
// 		sessionClient: presence.getMyself(),
// 	};
// };

export const load: PageLoad = async () => {
	const { containerId } = await createFluidContainer();

	// Retrieve a reference to the presence APIs via the data object.
	// const presence = acquirePresenceViaDataObject(container.initialObjects.presence);

	// return {
	// 	containerId,
	// };
	// return createFluidContainer();
	redirect(301, `/s/${containerId}`);
};
