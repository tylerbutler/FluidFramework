import { createAuth0Client, type Auth0Client } from "@auth0/auth0-spa-js";
import config from "./auth";

export async function createClient() {
	let auth0Client = await createAuth0Client({
		domain: config.domain,
		clientId: config.clientId,
		authorizationParams: {
			redirect_uri: `${window.location.origin}/login`,
		},
	});
	return auth0Client;
}

export function logout(client: Auth0Client) {
	return client.logout();
}
