/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Minimal Mocha type declarations for Bazel builds.
 * This file provides the global mocha types that would normally come from @types/mocha.
 *
 * This is a workaround for npm_translate_lock not exposing @types packages in Bazel.
 * Once @types packages are properly supported, this file can be removed.
 */

declare function describe(description: string, spec: () => void): void;
declare function it(expectation: string, assertion?: (this: import("mocha").Context) => void): void;
declare function before(action: (this: import("mocha").Context) => void): void;
declare function after(action: (this: import("mocha").Context) => void): void;
declare function beforeEach(action: (this: import("mocha").Context) => void): void;
declare function afterEach(action: (this: import("mocha").Context) => void): void;
