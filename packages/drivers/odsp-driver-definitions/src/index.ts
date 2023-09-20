/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

export {
	type IOdspError,
	type IOdspErrorAugmentations,
	type OdspError,
	OdspErrorType,
	OdspErrorTypes,
} from "./errors";
export type {
	HostStoragePolicy,
	ICollabSessionOptions,
	IOpsCachingPolicy,
	ISnapshotOptions,
} from "./factory";
export {
	type CacheContentType,
	getKeyForCacheEntry,
	type ICacheEntry,
	type IEntry,
	type IFileEntry,
	type IPersistedCache,
	snapshotKey,
} from "./odspCache";
export {
	type IOdspResolvedUrl,
	type IOdspUrlParts,
	type ISharingLink,
	type ISharingLinkKind,
	type ShareLinkInfoType,
	ShareLinkTypes,
	SharingLinkRole,
	SharingLinkScope,
} from "./resolvedUrl";
export {
	type IdentityType,
	type InstrumentedStorageTokenFetcher,
	isTokenFromCache,
	type OdspResourceTokenFetchOptions,
	type TokenFetcher,
	type TokenFetchOptions,
	tokenFromResponse,
	type TokenResponse,
} from "./tokenFetch";
export type {
	IProvideSessionAwareDriverFactory,
	IRelaySessionAwareDriverFactory,
	ISocketStorageDiscovery,
} from "./sessionProvider";
