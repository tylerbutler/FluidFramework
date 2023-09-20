/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
export { Attributor, OpStreamAttributor, type IAttributor } from "./attributor";
export {
	createRuntimeAttributor,
	enableOnNewFileKey,
	type IProvideRuntimeAttributor,
	type IRuntimeAttributor,
	mixinAttributor,
} from "./mixinAttributor";
