import { buildClerkProps } from "svelte-clerk/server";
import type { ClerkUserProperties } from "../user.svelte.js";

export const load = async ({ locals }) => {
	const rawUser = await locals.currentUser();
	if (rawUser === null) {
		return {
			// To enable Clerk SSR support, add initial state props to the load function
			...buildClerkProps(locals.auth),
		};
	}
	const clerkUserProperties: ClerkUserProperties = {
		id: rawUser.id,
		fullName: rawUser.fullName,
	};

	return {
		// This property can now be extracted from the data passed to each page.
		// We'll populate the presence data for the user during SudokuApp init.
		clerkUserProperties,

		// To enable Clerk SSR support, add initial state props to the load function
		...buildClerkProps(locals.auth),
	};
};
