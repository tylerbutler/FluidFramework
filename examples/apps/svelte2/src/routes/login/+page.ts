/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { PageLoad } from "./$types";
import { authState, isLoggedIn } from "../../authState.svelte";
import { createClient } from "../../authService.svelte";
import { redirect } from "@sveltejs/kit";
import { SvelteDate } from "svelte/reactivity";
import { createAuth0Client } from "@auth0/auth0-spa-js";

export const load: PageLoad = async () => {
	//const authClient =
	const authClient = await createClient();

	createAuth0Client({
		domain: "dev-iti7vk80e1l611fm.us.auth0.com",
		clientId: "613u2DzPBrOmXh3PNtA0efFLM4gOlHAc",
		authorizationParams: {
			redirect_uri: window.location.origin,
		},
	}).then(async (auth0Client) => {
		// Assumes a button with id "login" in the DOM
		// const loginButton = document.getElementById("login");

		// loginButton.addEventListener("click", (e) => {
		// 	e.preventDefault();
		// 	auth0Client.loginWithRedirect();
		// });

		if (
			location.search.includes("state=") &&
			(location.search.includes("code=") || location.search.includes("error="))
		) {
			await auth0Client.handleRedirectCallback();
			authState.loggedInTime = new SvelteDate(Date.now());
			authState.user = await auth0Client.getUser();
			window.history.replaceState({}, document.title, "/create");
		}
	});

	// authState.loggedInTime = (await authClient.isAuthenticated())
	// 	? new SvelteDate(Date.now())
	// 	: undefined;
	// if (!isLoggedIn()) {
	// 	authClient.loginWithRedirect();
	// }

	// if (
	// 	location.search.includes("state=") &&
	// 	(location.search.includes("code=") || location.search.includes("error="))
	// ) {
	// 	await authClient.handleRedirectCallback();
	// 	window.history.replaceState({}, document.title, "/");
	// }

	redirect(302, `/create`);
};
