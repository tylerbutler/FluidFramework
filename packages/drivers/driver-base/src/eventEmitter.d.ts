/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Type augmentation to expose EventEmitter methods that TypeScript doesn't see
 * through the TypedEventEmitter inheritance chain in the Bazel build.
 *
 * This is a workaround for Bazel-specific type resolution issues.
 */

import { TypedEventEmitter } from "@fluid-internal/client-utils";

declare module "@fluid-internal/client-utils" {
	interface TypedEventEmitter<TEvent> {
		/**
		 * Returns a copy of the array of listeners for the event named eventName.
		 */
		listeners(eventName: string | symbol): Function[];
	}
}
