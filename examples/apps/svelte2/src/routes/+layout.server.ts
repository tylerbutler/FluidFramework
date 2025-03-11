import { buildClerkProps } from "svelte-clerk/server";
import { SudokuAppUser, type ClerkUserProperties } from "../user.svelte.js";

// To enable Clerk SSR support, add initial state props to the load function
export const load = async ({ locals }) => {
	const rawUser = await locals.currentUser();
	const clerkUser: ClerkUserProperties | undefined =
		rawUser === null
			? undefined
			: {
					id: rawUser.id,
					fullName: rawUser.fullName,
				};
	return {
		// This property can now be extracted from the data passed to each page.
		// We'll populate the presence data for the user during SudokuApp init.
		clerkUser,
		...buildClerkProps(locals.auth),
	};
};
