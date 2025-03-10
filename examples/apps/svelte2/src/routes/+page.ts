/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { PageLoad } from "./$types";
import { authState, isLoggedIn } from "../authState.svelte";
import { createClient } from "../authService.svelte";
import { redirect } from "@sveltejs/kit";

export const load: PageLoad = async () => {
	const authClient = await createClient();
	if (
		location.search.includes("state=") &&
		(location.search.includes("code=") || location.search.includes("error="))
	) {
		await authClient.handleRedirectCallback();
		window.history.replaceState({}, document.title, "/");
	}

	if (!isLoggedIn()) {
		redirect(302, "/login");
	}

	authState.user = await authClient.getUser();

	redirect(301, `/create`);
};
