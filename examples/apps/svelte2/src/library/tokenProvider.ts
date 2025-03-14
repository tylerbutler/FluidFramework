import type { ITokenProvider, ITokenResponse } from "@fluidframework/routerlicious-driver";
import type { LeveeUser } from "./server/generateLeveeToken";
import { error } from "@sveltejs/kit";

export class HttpsTokenProvider implements ITokenProvider {
	constructor(
		private readonly endpointUrl: string,
		private readonly user?: LeveeUser,
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
		const responseParams: URLSearchParams = new URLSearchParams([
			["tenantId", tenantId],
			["documentId", documentId ?? ""],
		]);

		if (this.user?.id) {
			responseParams.append("userId", this.user.id);
		}

		if (this.user?.userName) {
			responseParams.append("userName", this.user.userName);
		}

		const response = await fetch(this.endpointUrl, {
			method: "POST",
			body: responseParams,
		});
		const data: { token: string } = await response.json();
		if (!data) {
			error(500, "no token data");
		}
		return data.token;
	}
}
