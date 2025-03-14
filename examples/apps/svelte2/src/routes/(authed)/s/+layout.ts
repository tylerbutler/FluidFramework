/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { LayoutLoad } from "./$types";
import { initializeClient } from "../../../fluid/init";
import { redirect } from "@sveltejs/kit";

export const ssr = false;

export const load: LayoutLoad = async ({ parent }) => {
	const { clerkUserProperties } = await parent();

	if (!clerkUserProperties) {
		redirect(307, "/login");
	}

	const client = initializeClient({
		id: clerkUserProperties.id,
		userName: clerkUserProperties.fullName ?? clerkUserProperties.id,
	});

	return {
		client,
	};
};
