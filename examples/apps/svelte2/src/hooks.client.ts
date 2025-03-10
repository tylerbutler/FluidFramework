import type { HandleClientError } from "@sveltejs/kit";
import { initializeClerkClient } from "clerk-sveltekit/client";
import { clerkPubKey } from "./auth";

initializeClerkClient(clerkPubKey, {
	afterSignInUrl: "/",
	afterSignUpUrl: "/",
	signInUrl: "/login",
	signUpUrl: "/login",
});

export const handleError: HandleClientError = async ({ error, event }) => {
	console.error(error, event);
};
