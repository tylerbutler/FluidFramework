import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { withClerkHandler } from "svelte-clerk/server";
import { AuthManager } from "./auth";

export const handle: Handle = sequence(withClerkHandler(), ({ event, resolve }) => {
	event.locals.authManager = new AuthManager(event);

	return resolve(event);
});
