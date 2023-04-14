/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

export const workspaceProtocol: string = `workspace:`;

/**
 * Parses a version string that may be using the workspace protocol.
 *
 * @param version - The version or range string to parse.
 * @returns A tuple of [isWorkspaceProtocol, parsedVersionString].
 *
 * @remarks
 *
 * Example supported strings:
 *
 * workspace:\^2.0.0-internal.1.0.0
 *
 * workspace:\~2.0.0-internal.1.0.0
 *
 * workspace:2.0.0-internal.1.0.0
 *
 * workspace:\^2.0.0
 *
 * workspace:\~2.0.0
 *
 * workspace:2.0.0
 */
export const parseWorkspaceProtocol = (version: string): [boolean, string] => {
	if (version.startsWith(workspaceProtocol)) {
		const range = version.slice(workspaceProtocol.length);
		return [true, range];
	}

	return [false, version];
};
