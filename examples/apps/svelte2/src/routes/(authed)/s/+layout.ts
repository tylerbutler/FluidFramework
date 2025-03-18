/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { LayoutLoad } from "./$types";
import { initializeClient } from "$lib/fluid/init";
import { redirect } from "@sveltejs/kit";
import { HttpsTokenProvider } from "$lib/tokenProvider";

export const ssr = false;

export const load: LayoutLoad = async ({ parent }) => {
	const { clerkUserProperties } = await parent();

	if (!clerkUserProperties) {
		redirect(307, "/login");
	}

	const tokenProvider = new HttpsTokenProvider("/api/tokenMint", clerkUserProperties);

	const client = initializeClient(tokenProvider);

	return {
		client,
	};
};
