import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { ScopeType } from "@fluidframework/driver-definitions/internal";
import { LEVEE_TENANT_KEY } from "$env/static/private";
import { generateLeveeToken } from "$lib/server/generateLeveeToken";

export const POST: RequestHandler = async ({ request, url, locals }) => {
	locals.authManager.redirectIfNotAuthenticated();

	// tenantId, documentId, userId and userName are required parameters
	const tenantId = url.searchParams.get("tenantId");
	const documentId = url.searchParams.get("documentId");
	const userId = url.searchParams.get("userId");
	const userName = url.searchParams.get("userName");
	const scopes: ScopeType[] = url.searchParams.getAll("scopes") as ScopeType[];

	if (!tenantId) {
		error(400, "No tenantId provided in params");
	}

	if (!userId) {
		error(400, "No userId provided in params");
	}

	if (!userName) {
		error(400, "No userName provided in params");
	}

	if (!LEVEE_TENANT_KEY) {
		error(404, `No key found for the provided tenantId: ${tenantId}`);
	}

	const token = generateLeveeToken(
		tenantId,
		LEVEE_TENANT_KEY,
		scopes ?? [ScopeType.DocRead, ScopeType.DocWrite, ScopeType.SummaryWrite],
		{ id: userId, userName },
		documentId ?? undefined,
	);

	return json({ token });
};
