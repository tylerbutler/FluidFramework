/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/*
 * THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
 * Generated by flub generate:typetests in @fluid-tools/build-cli.
 */

import type { TypeOnly, MinimalType, FullType, requireAssignableTo } from "@fluidframework/build-tools";
import type * as old from "@fluidframework/odsp-driver-definitions-previous/internal";

import type * as current from "../../index.js";

declare type MakeUnusedImportErrorsGoAway<T> = TypeOnly<T> | MinimalType<T> | FullType<T> | typeof old | typeof current | requireAssignableTo<true, true>;

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Enum_SharingLinkRole": {"forwardCompat": false}
 */
declare type old_as_current_for_Enum_SharingLinkRole = requireAssignableTo<TypeOnly<old.SharingLinkRole>, TypeOnly<current.SharingLinkRole>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Enum_SharingLinkRole": {"backCompat": false}
 */
declare type current_as_old_for_Enum_SharingLinkRole = requireAssignableTo<TypeOnly<current.SharingLinkRole>, TypeOnly<old.SharingLinkRole>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Enum_SharingLinkScope": {"forwardCompat": false}
 */
declare type old_as_current_for_Enum_SharingLinkScope = requireAssignableTo<TypeOnly<old.SharingLinkScope>, TypeOnly<current.SharingLinkScope>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Enum_SharingLinkScope": {"backCompat": false}
 */
declare type current_as_old_for_Enum_SharingLinkScope = requireAssignableTo<TypeOnly<current.SharingLinkScope>, TypeOnly<old.SharingLinkScope>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_HostStoragePolicy": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_HostStoragePolicy = requireAssignableTo<TypeOnly<old.HostStoragePolicy>, TypeOnly<current.HostStoragePolicy>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_HostStoragePolicy": {"backCompat": false}
 */
declare type current_as_old_for_Interface_HostStoragePolicy = requireAssignableTo<TypeOnly<current.HostStoragePolicy>, TypeOnly<old.HostStoragePolicy>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_ICacheEntry": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_ICacheEntry = requireAssignableTo<TypeOnly<old.ICacheEntry>, TypeOnly<current.ICacheEntry>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_ICacheEntry": {"backCompat": false}
 */
declare type current_as_old_for_Interface_ICacheEntry = requireAssignableTo<TypeOnly<current.ICacheEntry>, TypeOnly<old.ICacheEntry>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_ICollabSessionOptions": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_ICollabSessionOptions = requireAssignableTo<TypeOnly<old.ICollabSessionOptions>, TypeOnly<current.ICollabSessionOptions>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_ICollabSessionOptions": {"backCompat": false}
 */
declare type current_as_old_for_Interface_ICollabSessionOptions = requireAssignableTo<TypeOnly<current.ICollabSessionOptions>, TypeOnly<old.ICollabSessionOptions>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IEntry": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_IEntry = requireAssignableTo<TypeOnly<old.IEntry>, TypeOnly<current.IEntry>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IEntry": {"backCompat": false}
 */
declare type current_as_old_for_Interface_IEntry = requireAssignableTo<TypeOnly<current.IEntry>, TypeOnly<old.IEntry>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IFileEntry": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_IFileEntry = requireAssignableTo<TypeOnly<old.IFileEntry>, TypeOnly<current.IFileEntry>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IFileEntry": {"backCompat": false}
 */
declare type current_as_old_for_Interface_IFileEntry = requireAssignableTo<TypeOnly<current.IFileEntry>, TypeOnly<old.IFileEntry>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IOdspError": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_IOdspError = requireAssignableTo<TypeOnly<old.IOdspError>, TypeOnly<current.IOdspError>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IOdspError": {"backCompat": false}
 */
declare type current_as_old_for_Interface_IOdspError = requireAssignableTo<TypeOnly<current.IOdspError>, TypeOnly<old.IOdspError>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IOdspErrorAugmentations": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_IOdspErrorAugmentations = requireAssignableTo<TypeOnly<old.IOdspErrorAugmentations>, TypeOnly<current.IOdspErrorAugmentations>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IOdspErrorAugmentations": {"backCompat": false}
 */
declare type current_as_old_for_Interface_IOdspErrorAugmentations = requireAssignableTo<TypeOnly<current.IOdspErrorAugmentations>, TypeOnly<old.IOdspErrorAugmentations>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IOdspResolvedUrl": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_IOdspResolvedUrl = requireAssignableTo<TypeOnly<old.IOdspResolvedUrl>, TypeOnly<current.IOdspResolvedUrl>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IOdspResolvedUrl": {"backCompat": false}
 */
declare type current_as_old_for_Interface_IOdspResolvedUrl = requireAssignableTo<TypeOnly<current.IOdspResolvedUrl>, TypeOnly<old.IOdspResolvedUrl>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IOdspUrlParts": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_IOdspUrlParts = requireAssignableTo<TypeOnly<old.IOdspUrlParts>, TypeOnly<current.IOdspUrlParts>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IOdspUrlParts": {"backCompat": false}
 */
declare type current_as_old_for_Interface_IOdspUrlParts = requireAssignableTo<TypeOnly<current.IOdspUrlParts>, TypeOnly<old.IOdspUrlParts>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IOpsCachingPolicy": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_IOpsCachingPolicy = requireAssignableTo<TypeOnly<old.IOpsCachingPolicy>, TypeOnly<current.IOpsCachingPolicy>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IOpsCachingPolicy": {"backCompat": false}
 */
declare type current_as_old_for_Interface_IOpsCachingPolicy = requireAssignableTo<TypeOnly<current.IOpsCachingPolicy>, TypeOnly<old.IOpsCachingPolicy>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IPersistedCache": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_IPersistedCache = requireAssignableTo<TypeOnly<old.IPersistedCache>, TypeOnly<current.IPersistedCache>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IPersistedCache": {"backCompat": false}
 */
declare type current_as_old_for_Interface_IPersistedCache = requireAssignableTo<TypeOnly<current.IPersistedCache>, TypeOnly<old.IPersistedCache>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IProvideSessionAwareDriverFactory": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_IProvideSessionAwareDriverFactory = requireAssignableTo<TypeOnly<old.IProvideSessionAwareDriverFactory>, TypeOnly<current.IProvideSessionAwareDriverFactory>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IProvideSessionAwareDriverFactory": {"backCompat": false}
 */
declare type current_as_old_for_Interface_IProvideSessionAwareDriverFactory = requireAssignableTo<TypeOnly<current.IProvideSessionAwareDriverFactory>, TypeOnly<old.IProvideSessionAwareDriverFactory>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IRelaySessionAwareDriverFactory": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_IRelaySessionAwareDriverFactory = requireAssignableTo<TypeOnly<old.IRelaySessionAwareDriverFactory>, TypeOnly<current.IRelaySessionAwareDriverFactory>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IRelaySessionAwareDriverFactory": {"backCompat": false}
 */
declare type current_as_old_for_Interface_IRelaySessionAwareDriverFactory = requireAssignableTo<TypeOnly<current.IRelaySessionAwareDriverFactory>, TypeOnly<old.IRelaySessionAwareDriverFactory>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_ISharingLink": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_ISharingLink = requireAssignableTo<TypeOnly<old.ISharingLink>, TypeOnly<current.ISharingLink>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_ISharingLink": {"backCompat": false}
 */
declare type current_as_old_for_Interface_ISharingLink = requireAssignableTo<TypeOnly<current.ISharingLink>, TypeOnly<old.ISharingLink>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_ISharingLinkKind": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_ISharingLinkKind = requireAssignableTo<TypeOnly<old.ISharingLinkKind>, TypeOnly<current.ISharingLinkKind>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_ISharingLinkKind": {"backCompat": false}
 */
declare type current_as_old_for_Interface_ISharingLinkKind = requireAssignableTo<TypeOnly<current.ISharingLinkKind>, TypeOnly<old.ISharingLinkKind>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_ISnapshotOptions": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_ISnapshotOptions = requireAssignableTo<TypeOnly<old.ISnapshotOptions>, TypeOnly<current.ISnapshotOptions>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_ISnapshotOptions": {"backCompat": false}
 */
declare type current_as_old_for_Interface_ISnapshotOptions = requireAssignableTo<TypeOnly<current.ISnapshotOptions>, TypeOnly<old.ISnapshotOptions>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_ISocketStorageDiscovery": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_ISocketStorageDiscovery = requireAssignableTo<TypeOnly<old.ISocketStorageDiscovery>, TypeOnly<current.ISocketStorageDiscovery>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_ISocketStorageDiscovery": {"backCompat": false}
 */
declare type current_as_old_for_Interface_ISocketStorageDiscovery = requireAssignableTo<TypeOnly<current.ISocketStorageDiscovery>, TypeOnly<old.ISocketStorageDiscovery>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_OdspResourceTokenFetchOptions": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_OdspResourceTokenFetchOptions = requireAssignableTo<TypeOnly<old.OdspResourceTokenFetchOptions>, TypeOnly<current.OdspResourceTokenFetchOptions>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_OdspResourceTokenFetchOptions": {"backCompat": false}
 */
declare type current_as_old_for_Interface_OdspResourceTokenFetchOptions = requireAssignableTo<TypeOnly<current.OdspResourceTokenFetchOptions>, TypeOnly<old.OdspResourceTokenFetchOptions>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_ShareLinkInfoType": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_ShareLinkInfoType = requireAssignableTo<TypeOnly<old.ShareLinkInfoType>, TypeOnly<current.ShareLinkInfoType>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_ShareLinkInfoType": {"backCompat": false}
 */
declare type current_as_old_for_Interface_ShareLinkInfoType = requireAssignableTo<TypeOnly<current.ShareLinkInfoType>, TypeOnly<old.ShareLinkInfoType>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_TokenFetchOptions": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_TokenFetchOptions = requireAssignableTo<TypeOnly<old.TokenFetchOptions>, TypeOnly<current.TokenFetchOptions>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_TokenFetchOptions": {"backCompat": false}
 */
declare type current_as_old_for_Interface_TokenFetchOptions = requireAssignableTo<TypeOnly<current.TokenFetchOptions>, TypeOnly<old.TokenFetchOptions>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_TokenResponse": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_TokenResponse = requireAssignableTo<TypeOnly<old.TokenResponse>, TypeOnly<current.TokenResponse>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_TokenResponse": {"backCompat": false}
 */
declare type current_as_old_for_Interface_TokenResponse = requireAssignableTo<TypeOnly<current.TokenResponse>, TypeOnly<old.TokenResponse>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "TypeAlias_CacheContentType": {"forwardCompat": false}
 */
declare type old_as_current_for_TypeAlias_CacheContentType = requireAssignableTo<TypeOnly<old.CacheContentType>, TypeOnly<current.CacheContentType>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "TypeAlias_CacheContentType": {"backCompat": false}
 */
declare type current_as_old_for_TypeAlias_CacheContentType = requireAssignableTo<TypeOnly<current.CacheContentType>, TypeOnly<old.CacheContentType>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "TypeAlias_IdentityType": {"forwardCompat": false}
 */
declare type old_as_current_for_TypeAlias_IdentityType = requireAssignableTo<TypeOnly<old.IdentityType>, TypeOnly<current.IdentityType>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "TypeAlias_IdentityType": {"backCompat": false}
 */
declare type current_as_old_for_TypeAlias_IdentityType = requireAssignableTo<TypeOnly<current.IdentityType>, TypeOnly<old.IdentityType>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "TypeAlias_OdspError": {"forwardCompat": false}
 */
declare type old_as_current_for_TypeAlias_OdspError = requireAssignableTo<TypeOnly<old.OdspError>, TypeOnly<current.OdspError>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "TypeAlias_OdspError": {"backCompat": false}
 */
declare type current_as_old_for_TypeAlias_OdspError = requireAssignableTo<TypeOnly<current.OdspError>, TypeOnly<old.OdspError>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "TypeAlias_OdspErrorTypes": {"forwardCompat": false}
 */
declare type old_as_current_for_TypeAlias_OdspErrorTypes = requireAssignableTo<TypeOnly<old.OdspErrorTypes>, TypeOnly<current.OdspErrorTypes>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "TypeAlias_OdspErrorTypes": {"backCompat": false}
 */
declare type current_as_old_for_TypeAlias_OdspErrorTypes = requireAssignableTo<TypeOnly<current.OdspErrorTypes>, TypeOnly<old.OdspErrorTypes>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "TypeAlias_TokenFetcher": {"forwardCompat": false}
 */
declare type old_as_current_for_TypeAlias_TokenFetcher = requireAssignableTo<TypeOnly<old.TokenFetcher<never>>, TypeOnly<current.TokenFetcher<never>>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "TypeAlias_TokenFetcher": {"backCompat": false}
 */
declare type current_as_old_for_TypeAlias_TokenFetcher = requireAssignableTo<TypeOnly<current.TokenFetcher<never>>, TypeOnly<old.TokenFetcher<never>>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Variable_OdspErrorTypes": {"backCompat": false}
 */
declare type current_as_old_for_Variable_OdspErrorTypes = requireAssignableTo<TypeOnly<typeof current.OdspErrorTypes>, TypeOnly<typeof old.OdspErrorTypes>>
