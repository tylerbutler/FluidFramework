/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { AzureMember } from "@fluidframework/azure-client";
import type { ITokenProvider, ITokenResponse } from "@fluidframework/routerlicious-driver";

/**
 * Token Provider implementation for connecting to an Azure Function endpoint for
 * Azure Fluid Relay token resolution. Note: this is a simplified implementation of
 * TokenProvider. For production-ready applications, you should consider implementing
 * the TokenProvider with retry logic, token caching, error handling, etc.
 */
export class AzureFunctionTokenProvider implements ITokenProvider {
	/**
	 * Creates a new instance using configuration parameters.
	 * @param azFunctionUrl - URL to Azure Function endpoint
	 * @param user - User object
	 */
	public constructor(
		private readonly azFunctionUrl: string,
		private readonly user?: Pick<AzureMember, "id" | "name" | "additionalDetails">,
	) {}

	public async fetchOrdererToken(
		tenantId: string,
		documentId?: string,
		refresh?: boolean,
	): Promise<ITokenResponse> {
		return {
			jwt: await this.getToken(tenantId, documentId),
			fromCache: false,
		};
	}

	public async fetchStorageToken(
		tenantId: string,
		documentId: string,
		refresh?: boolean,
	): Promise<ITokenResponse> {
		return {
			jwt: await this.getToken(tenantId, documentId),
			fromCache: false,
		};
	}

	private async getToken(tenantId: string, documentId?: string): Promise<string> {
		const params = new URLSearchParams({
			tenantId,
		});
		if (documentId !== undefined) {
			params.append("documentId", documentId);
		}
		if (this.user?.id !== undefined) {
			params.append("id", this.user.id);
		}
		if (this.user?.name !== undefined) {
			params.append("name", this.user.name);
		}
		if (this.user?.additionalDetails !== undefined) {
			params.append("additionalDetails", JSON.stringify(this.user.additionalDetails));
		}

		const url = `${this.azFunctionUrl}?${params.toString()}`;
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return response.text();
	}
}
