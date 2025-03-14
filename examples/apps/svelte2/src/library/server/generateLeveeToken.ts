/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { ScopeType, type ITokenClaims } from "@fluidframework/driver-definitions/internal";
import { KJUR as jsrsasign } from "jsrsasign";
import type { IUser } from "@fluidframework/driver-definitions";
import { nanoid } from "nanoid";

export type LeveeUser = IUser & { userName: string, fullName?: string };

/**
 * Generates a {@link https://en.wikipedia.org/wiki/JSON_Web_Token | JSON Web Token} (JWT)
 * to authorize access to a Routerlicious-based Fluid service.
 *
 * @remarks Note: this function uses a browser friendly auth library
 * ({@link https://www.npmjs.com/package/jsrsasign | jsrsasign}) and may only be used in client (browser) context.
 * It is **not** Node.js-compatible.
 *
 * @param tenantId - See {@link @fluidframework/protocol-definitions#ITokenClaims.tenantId}
 * @param key - API key to authenticate user. Must be {@link https://en.wikipedia.org/wiki/UTF-8 | UTF-8}-encoded.
 * @param scopes - See {@link @fluidframework/protocol-definitions#ITokenClaims.scopes}
 * @param documentId - See {@link @fluidframework/protocol-definitions#ITokenClaims.documentId}.
 * If not specified, the token will not be associated with a document, and an empty string will be used.
 * @param user - User with whom generated tokens will be associated.
 * If not specified, the token will not be associated with a user, and a randomly generated mock user will be
 * used instead.
 * See {@link @fluidframework/protocol-definitions#ITokenClaims.user}
 * @param lifetime - Used to generate the {@link @fluidframework/protocol-definitions#ITokenClaims.exp | expiration}.
 * Expiration = now + lifetime.
 * Expressed in seconds.
 * Default: 3600 (1 hour).
 * @param ver - See {@link @fluidframework/protocol-definitions#ITokenClaims.ver}.
 * Default: `1.0`.
 *
 * @legacy
 * @alpha
 */
export function generateLeveeToken(
	tenantId: string,
	key: string,
	scopes: ScopeType[],
	user: LeveeUser,
	documentId?: string,
	lifetime: number = 60 * 60,
	// Naming intended to match `ITokenClaims.ver`
	// eslint-disable-next-line unicorn/prevent-abbreviations
	ver: string = "1.0",
): string {
	// Current time in seconds
	const now = Math.round(Date.now() / 1000);

	const claims: ITokenClaims & { jti: string } = {
		documentId: documentId ?? "",
		scopes,
		tenantId,
		user,
		iat: now,
		exp: now + lifetime,
		ver,
		jti: nanoid(),
	};

	const utf8Key = { utf8: key };

	return jsrsasign.jws.JWS.sign(
		// External API uses null
		// eslint-disable-next-line unicorn/no-null
		null,
		JSON.stringify({ alg: "HS256", typ: "JWT" }),
		claims,
		utf8Key,
	);
}
