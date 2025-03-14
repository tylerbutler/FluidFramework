import type { ITokenProvider, ITokenResponse } from "@fluidframework/routerlicious-driver";
import { error } from "@sveltejs/kit";
import type { LeveeUser } from "../user.svelte";

export interface TokenArgs {
	tenantId: string;
	documentId: string;
	user: LeveeUser;
}

export class HttpsTokenProvider implements ITokenProvider {
	constructor(
		private readonly endpointUrl: string,
		private readonly user: LeveeUser,
	) {}

	public async fetchOrdererToken(
		tenantId: string,
		documentId?: string,
	): Promise<ITokenResponse> {
		return {
			jwt: await this.getToken(tenantId, documentId),
		};
	}

	public async fetchStorageToken(
		tenantId: string,
		documentId: string,
	): Promise<ITokenResponse> {
		return {
			jwt: await this.getToken(tenantId, documentId),
		};
	}

	private async getToken(tenantId: string, documentId: string | undefined): Promise<string> {
		const args: TokenArgs = {
			"tenantId": tenantId,
			"documentId": documentId ?? "",
			"user": this.user,
		};

		const response = await fetch(this.endpointUrl, {
			method: "POST",
			body: JSON.stringify(args),
			headers: {
				"Content-Type": "application/json",
			},
		});
		const data: { token: string } = await response.json();
		if (!data) {
			error(500, "no token data");
		}
		return data.token;
	}
}
