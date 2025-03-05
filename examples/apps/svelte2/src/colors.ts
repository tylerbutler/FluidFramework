/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

export const colors = [
	// "gray",
	"red",
	"orange",
	// "amber",
	"yellow",
	// "lime",
	"green",
	// "emerald",
	"teal",
	// "cyan",
	// "sky",
	"blue",
	"indigo",
	// "violet",
	"purple",
	// "fuchsia",
	"pink",
	// "rose",
] as const;

export type ColorType = (typeof colors)[number];

/**
 * Hashes a string to a numeric value.
 * @param str - The input string to hash.
 * @returns A numeric hash value.
 */
function hashString(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
}

/**
 * Maps a string to a color from the colors array.
 * @param str - The input string to map.
 * @returns A color from the colors array.
 */
export function mapStringToColor(str: string): ColorType {
	const hash = hashString(str);
	const index = Math.abs(hash) % colors.length;
	return colors[index];
}
