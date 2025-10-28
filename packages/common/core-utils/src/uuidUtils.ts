/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * UUID utilities for testing npm dependency resolution in Bazel.
 * This file is a temporary test case for Session 2.3.
 * @internal
 */

import { v4 as uuidv4 } from "uuid";

/**
 * Generate a new UUID v4
 * @returns A new UUID string
 * @internal
 */
export function generateId(): string {
	return uuidv4();
}

/**
 * Validate if a string is a valid UUID v4
 * @param id - The string to validate
 * @returns True if valid UUID v4
 * @internal
 */
export function isValidId(id: string): boolean {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(id);
}
