import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { ScopeType } from "@fluidframework/driver-definitions/internal";
import { LEVEE_TENANT_KEY } from "$env/static/private";
import { generateLeveeToken } from "$lib/server/generateLeveeToken";
import type { TokenArgs } from "$lib/tokenProvider";

export const POST: RequestHandler = async ({ request, locals }) => {
	locals.authManager.redirectIfNotAuthenticated();

	const { tenantId, documentId, user }: TokenArgs = await request.json();

	// const {id,
	// 	username,
	// 	fullName} = user;

	if (!tenantId) {
		error(400, "No tenantId provided");
	}

	if (!user) {
		error(400, "No user provided");
	}

	if (!user.id) {
		error(400, "No user.id provided");
	}

	// if (!userName) {
	// 	error(400, "No userName provided in params");
	// }

	// if (!fullName) {
	// 	error(400, "No userName provided in params");
	// }

	if (!LEVEE_TENANT_KEY) {
		error(404, `No key found for the provided tenantId: ${tenantId}`);
	}

	const token = generateLeveeToken(
		tenantId,
		LEVEE_TENANT_KEY,
		[ScopeType.DocRead, ScopeType.DocWrite, ScopeType.SummaryWrite],
		user,
		documentId ?? undefined,
	);

	return json({ token });
};
