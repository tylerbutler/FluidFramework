import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, parent }) => {
	const parentData = await parent();
	locals.authManager.redirectIfNotAuthenticated();
	return { clerkUserProperties: parentData.clerkUserProperties };
};
