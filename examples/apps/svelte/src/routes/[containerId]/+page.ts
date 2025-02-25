import type { PageLoad } from "./$types";
import { getFluidContainer } from "../../fluid/init";
import { acquirePresenceViaDataObject } from "@fluidframework/presence/alpha";

// disable SSR
export const ssr = false;

export const load: PageLoad = async ({ params }) => {
	const container = await getFluidContainer(params.containerId);

	// // Retrieve a reference to the presence APIs via the data object.
	const presence = acquirePresenceViaDataObject(container.initialObjects.presence);

	// if (!containerId) {
	// 	error(404, "Not found");
	// }

	return {
		container,
		containerId: params.containerId,
		presence,
		sessionClientId: presence.getMyself(),
	};
};
