import { acquirePresenceViaDataObject } from "@fluidframework/presence/alpha";
import type { PageLoad } from "./$types";
import { createFluidContainer } from "../fluid/init";

// disable SSR
export const ssr = false;

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
// 		sessionClientId: presence.getMyself(),
// 	};
// };

export const load: PageLoad = async () => {
	const { containerId } = await createFluidContainer();

	// Retrieve a reference to the presence APIs via the data object.
	// const presence = acquirePresenceViaDataObject(container.initialObjects.presence);

	return {
		containerId,
	};
};
