/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/// <reference types="svelte-clerk/env" />

import type { AuthManager } from "./auth";

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			authManager: AuthManager;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
