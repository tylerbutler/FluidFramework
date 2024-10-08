/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/*
 * THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
 * Generated by flub generate:typetests in @fluid-tools/build-cli.
 */

import type { TypeOnly, MinimalType, FullType, requireAssignableTo } from "@fluidframework/build-tools";
import type * as old from "@fluidframework/tinylicious-driver-previous/internal";

import type * as current from "../../index.js";

declare type MakeUnusedImportErrorsGoAway<T> = TypeOnly<T> | MinimalType<T> | FullType<T> | typeof old | typeof current | requireAssignableTo<true, true>;

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Class_InsecureTinyliciousTokenProvider": {"forwardCompat": false}
 */
declare type old_as_current_for_Class_InsecureTinyliciousTokenProvider = requireAssignableTo<TypeOnly<old.InsecureTinyliciousTokenProvider>, TypeOnly<current.InsecureTinyliciousTokenProvider>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Class_InsecureTinyliciousTokenProvider": {"backCompat": false}
 */
declare type current_as_old_for_Class_InsecureTinyliciousTokenProvider = requireAssignableTo<TypeOnly<current.InsecureTinyliciousTokenProvider>, TypeOnly<old.InsecureTinyliciousTokenProvider>>

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Class_InsecureTinyliciousUrlResolver": {"forwardCompat": false}
 */
declare type old_as_current_for_Class_InsecureTinyliciousUrlResolver = requireAssignableTo<TypeOnly<old.InsecureTinyliciousUrlResolver>, TypeOnly<current.InsecureTinyliciousUrlResolver>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Class_InsecureTinyliciousUrlResolver": {"backCompat": false}
 */
declare type current_as_old_for_Class_InsecureTinyliciousUrlResolver = requireAssignableTo<TypeOnly<current.InsecureTinyliciousUrlResolver>, TypeOnly<old.InsecureTinyliciousUrlResolver>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "ClassStatics_InsecureTinyliciousTokenProvider": {"backCompat": false}
 */
declare type current_as_old_for_ClassStatics_InsecureTinyliciousTokenProvider = requireAssignableTo<TypeOnly<typeof current.InsecureTinyliciousTokenProvider>, TypeOnly<typeof old.InsecureTinyliciousTokenProvider>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "ClassStatics_InsecureTinyliciousUrlResolver": {"backCompat": false}
 */
declare type current_as_old_for_ClassStatics_InsecureTinyliciousUrlResolver = requireAssignableTo<TypeOnly<typeof current.InsecureTinyliciousUrlResolver>, TypeOnly<typeof old.InsecureTinyliciousUrlResolver>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Variable_createTinyliciousCreateNewRequest": {"backCompat": false}
 */
declare type current_as_old_for_Variable_createTinyliciousCreateNewRequest = requireAssignableTo<TypeOnly<typeof current.createTinyliciousCreateNewRequest>, TypeOnly<typeof old.createTinyliciousCreateNewRequest>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Variable_defaultTinyliciousEndpoint": {"backCompat": false}
 */
declare type current_as_old_for_Variable_defaultTinyliciousEndpoint = requireAssignableTo<TypeOnly<typeof current.defaultTinyliciousEndpoint>, TypeOnly<typeof old.defaultTinyliciousEndpoint>>

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "Variable_defaultTinyliciousPort": {"backCompat": false}
 */
declare type current_as_old_for_Variable_defaultTinyliciousPort = requireAssignableTo<TypeOnly<typeof current.defaultTinyliciousPort>, TypeOnly<typeof old.defaultTinyliciousPort>>
