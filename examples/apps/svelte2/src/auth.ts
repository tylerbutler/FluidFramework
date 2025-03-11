import { error, redirect, type RequestEvent } from "@sveltejs/kit";
import type { AuthObject } from "@clerk/backend";

export class AuthManager {
	private readonly auth?: AuthObject;

	constructor(private readonly event: RequestEvent) {
		this.auth = event.locals.auth;
	}

	// isPublic() {
	// 	if (this.auth?.userId) {
	// 		redirect(307, '/profile');
	// 	}
	// 	return this;
	// }

	redirectIfNotAuthenticated() {
		if (!this.auth?.userId) {
			redirect(307, "/login");
		}
		return this;
	}

	hasPermission(permission: string) {
		const permitted = this.auth?.has({ permission });
		if (!permitted) {
			error(403, "missing permission: " + permission);
		}
		return this;
	}
}
