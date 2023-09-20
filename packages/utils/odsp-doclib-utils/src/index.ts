/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

export {
	authRequestWithRetry,
	fetchTokens,
	getFetchTokenUrl,
	getLoginPageUrl,
	getOdspRefreshTokenFn,
	getOdspScope,
	getPushRefreshTokenFn,
	getRefreshTokenFn,
	type IClientConfig,
	type IOdspAuthRequestInfo,
	type IOdspTokens,
	pushScope,
	refreshTokens,
	type TokenRequestCredentials,
} from "./odspAuth";
export {
	getAadTenant,
	getAadUrl,
	getServer,
	getSiteUrl,
	isOdspHostname,
	isPushChannelHostname,
} from "./odspDocLibUtils";
export {
	getChildrenByDriveItem,
	getDriveId,
	getDriveItemByRootFileName,
	getDriveItemByServerRelativePath,
	getDriveItemFromDriveAndItem,
	type IOdspDriveItem,
} from "./odspDrives";
export {
	createOdspNetworkError,
	enrichOdspError,
	fetchIncorrectResponse,
	getSPOAndGraphRequestIdsFromResponse,
	hasFacetCodes,
	type OdspErrorResponse,
	type OdspErrorResponseInnerError,
	OdspRedirectError,
	OdspServiceReadOnlyErrorCode,
	parseFacetCodes,
	throwOdspNetworkError,
	tryParseErrorResponse,
} from "./odspErrorUtils";
export { getAsync, postAsync, putAsync, unauthPostAsync } from "./odspRequest";
