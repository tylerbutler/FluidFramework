/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

export type {
	DriverError,
	IAnyDriverError,
	IAuthorizationError,
	IDriverErrorBase,
	IDriverBasicError,
	IGenericNetworkError,
	ILocationRedirectionError,
	IThrottlingWarning,
} from "./driverError";
export {
	DriverErrorType,
	DriverErrorTypes,
} from "./driverError";
export type {
	FiveDaysMs,
	IDeltasFetchResult,
	IDeltaStorageService,
	IDocumentDeltaConnection,
	IDocumentDeltaConnectionEvents,
	IDocumentDeltaStorageService,
	IDocumentService,
	IDocumentServiceFactory,
	IDocumentServicePolicies,
	IDocumentStorageService,
	IDocumentStorageServicePolicies,
	IStream,
	IStreamResult,
	ISummaryContext,
} from "./storage";
export {
	FetchSource,
	LoaderCachingPolicy,
} from "./storage";
export {
	type DriverPreCheckInfo,
	DriverHeader,
	type IContainerPackageInfo,
	type IDriverHeader,
	type IResolvedUrl,
	type IUrlResolver,
} from "./urlResolver";
