import type { User } from "@auth0/auth0-spa-js";
import { SvelteDate } from "svelte/reactivity";

export let authState: { loggedInTime?: SvelteDate; user?: User } = $state({});

export const expiryTime = () => {
	if (authState.loggedInTime === undefined) {
		return 0;
	}

	const thirtyMinutesInMs = 30 * 60 * 1000;
	return new SvelteDate(authState.loggedInTime.getTime() + thirtyMinutesInMs);
};

export const isLoggedIn = () => {
	if (authState.loggedInTime === undefined) {
		return false;
	}
	const thirtyMinutesInMs = 30 * 60 * 1000;
	const expirationTime = new Date(authState.loggedInTime.getTime() + thirtyMinutesInMs);
	return Date.now() < expirationTime.getTime();
};
