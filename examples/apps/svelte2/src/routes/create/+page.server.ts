/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { PageServerLoad } from "./$types";
import { createFluidContainer } from "../../fluid/init";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals }) => {
	const { userId } = locals.auth;

	if (!userId) {
		redirect(307, "/login");
	}
};
