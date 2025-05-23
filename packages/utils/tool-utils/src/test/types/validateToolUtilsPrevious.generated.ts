/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/*
 * THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
 * Generated by flub generate:typetests in @fluid-tools/build-cli.
 */

import type { TypeOnly, MinimalType, FullType, requireAssignableTo } from "@fluidframework/build-tools";
import type * as old from "@fluidframework/tool-utils-previous/internal";

import type * as current from "../../index.js";

declare type MakeUnusedImportErrorsGoAway<T> = TypeOnly<T> | MinimalType<T> | FullType<T> | typeof old | typeof current | requireAssignableTo<true, true>;

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Class_OdspTokenManager": {"forwardCompat": false}
 */
declare type old_as_current_for_Class_OdspTokenManager = requireAssignableTo<TypeOnly<old.OdspTokenManager>, TypeOnly<current.OdspTokenManager>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Class_OdspTokenManager": {"backCompat": false}
 */
declare type current_as_old_for_Class_OdspTokenManager = requireAssignableTo<TypeOnly<current.OdspTokenManager>, TypeOnly<old.OdspTokenManager>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "ClassStatics_OdspTokenManager": {"backCompat": false}
 */
declare type current_as_old_for_ClassStatics_OdspTokenManager = requireAssignableTo<TypeOnly<typeof current.OdspTokenManager>, TypeOnly<typeof old.OdspTokenManager>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Function_getNormalizedSnapshot": {"backCompat": false}
 */
declare type current_as_old_for_Function_getNormalizedSnapshot = requireAssignableTo<TypeOnly<typeof current.getNormalizedSnapshot>, TypeOnly<typeof old.getNormalizedSnapshot>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Function_loadRC": {"backCompat": false}
 */
declare type current_as_old_for_Function_loadRC = requireAssignableTo<TypeOnly<typeof current.loadRC>, TypeOnly<typeof old.loadRC>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Function_lockRC": {"backCompat": false}
 */
declare type current_as_old_for_Function_lockRC = requireAssignableTo<TypeOnly<typeof current.lockRC>, TypeOnly<typeof old.lockRC>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Function_saveRC": {"backCompat": false}
 */
declare type current_as_old_for_Function_saveRC = requireAssignableTo<TypeOnly<typeof current.saveRC>, TypeOnly<typeof old.saveRC>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IAsyncCache": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_IAsyncCache = requireAssignableTo<TypeOnly<old.IAsyncCache<never,never>>, TypeOnly<current.IAsyncCache<never,never>>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IAsyncCache": {"backCompat": false}
 */
declare type current_as_old_for_Interface_IAsyncCache = requireAssignableTo<TypeOnly<current.IAsyncCache<never,never>>, TypeOnly<old.IAsyncCache<never,never>>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IOdspTokenManagerCacheKey": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_IOdspTokenManagerCacheKey = requireAssignableTo<TypeOnly<old.IOdspTokenManagerCacheKey>, TypeOnly<current.IOdspTokenManagerCacheKey>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IOdspTokenManagerCacheKey": {"backCompat": false}
 */
declare type current_as_old_for_Interface_IOdspTokenManagerCacheKey = requireAssignableTo<TypeOnly<current.IOdspTokenManagerCacheKey>, TypeOnly<old.IOdspTokenManagerCacheKey>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IResources": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_IResources = requireAssignableTo<TypeOnly<old.IResources>, TypeOnly<current.IResources>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_IResources": {"backCompat": false}
 */
declare type current_as_old_for_Interface_IResources = requireAssignableTo<TypeOnly<current.IResources>, TypeOnly<old.IResources>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_ISnapshotNormalizerConfig": {"forwardCompat": false}
 */
declare type old_as_current_for_Interface_ISnapshotNormalizerConfig = requireAssignableTo<TypeOnly<old.ISnapshotNormalizerConfig>, TypeOnly<current.ISnapshotNormalizerConfig>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Interface_ISnapshotNormalizerConfig": {"backCompat": false}
 */
declare type current_as_old_for_Interface_ISnapshotNormalizerConfig = requireAssignableTo<TypeOnly<current.ISnapshotNormalizerConfig>, TypeOnly<old.ISnapshotNormalizerConfig>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "TypeAlias_OdspTokenConfig": {"forwardCompat": false}
 */
declare type old_as_current_for_TypeAlias_OdspTokenConfig = requireAssignableTo<TypeOnly<old.OdspTokenConfig>, TypeOnly<current.OdspTokenConfig>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "TypeAlias_OdspTokenConfig": {"backCompat": false}
 */
declare type current_as_old_for_TypeAlias_OdspTokenConfig = requireAssignableTo<TypeOnly<current.OdspTokenConfig>, TypeOnly<old.OdspTokenConfig>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Variable_gcBlobPrefix": {"backCompat": false}
 */
declare type current_as_old_for_Variable_gcBlobPrefix = requireAssignableTo<TypeOnly<typeof current.gcBlobPrefix>, TypeOnly<typeof old.gcBlobPrefix>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Variable_getMicrosoftConfiguration": {"backCompat": false}
 */
declare type current_as_old_for_Variable_getMicrosoftConfiguration = requireAssignableTo<TypeOnly<typeof current.getMicrosoftConfiguration>, TypeOnly<typeof old.getMicrosoftConfiguration>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Variable_odspTokensCache": {"backCompat": false}
 */
declare type current_as_old_for_Variable_odspTokensCache = requireAssignableTo<TypeOnly<typeof current.odspTokensCache>, TypeOnly<typeof old.odspTokensCache>>
