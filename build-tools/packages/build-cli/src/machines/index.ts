/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { PrepReleaseMachine } from "./prepReleaseMachine";
import { ReleaseMachine } from "./releaseMachine";

export { PrepReleaseMachine } from "./prepReleaseMachine";
export { ReleaseMachine } from "./releaseMachine";

export { StateMachine, StateHandler } from "./machines";

/**
 * An array of all known machines. Intended for testing.
 *
 * @internal
 * */
export const allMachines = [ReleaseMachine, PrepReleaseMachine];
