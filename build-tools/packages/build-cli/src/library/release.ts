/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import assert from "node:assert";
import {
	ReleaseVersion,
	VersionBumpType,
	VersionScheme,
	bumpVersionScheme,
	detectVersionScheme,
	fromInternalScheme,
	fromVirtualPatchScheme,
	getVersionRange,
} from "@fluid-tools/version-tools";
import { Separator, rawlist } from "@inquirer/prompts";
import { formatDistanceToNow } from "date-fns";
import chalk from "picocolors";
import * as semver from "semver";

import type { ReleaseReportConfig } from "../config.js";
// eslint-disable-next-line import/no-internal-modules
import type { FluidReleaseStateHandlerData } from "../handlers/fluidReleaseStateHandler.js";
import { type VersionDetails, sortVersions } from "../library/index.js";
import type { CommandLogger } from "../logging.js";
import { ReleaseGroup } from "../releaseGroups.js";

/**
 * A map of package names to full release reports. This is the format of the "full" release report.
 */
export interface ReleaseReport {
	[packageName: string]: ReleaseDetails;
}

/**
 * Full details about a release.
 */
export interface ReleaseDetails {
	version: ReleaseVersion;
	previousVersion?: ReleaseVersion;
	versionScheme: VersionScheme;
	date?: Date;
	releaseType: VersionBumpType;
	isNewRelease: boolean;
	releaseGroup?: ReleaseGroup;
	ranges: ReleaseRanges;
}

/**
 * Version range strings. These strings are included in release reports so that partners can use the strings as-is in
 * package.json dependencies.
 *
 * @remarks
 *
 * "minor" and "caret" are equivalent, as are "patch" and "tilde." All five are included because both terms are commonly
 * used by partners, and having both eases confusion.
 */
export interface ReleaseRanges {
	/**
	 * A minor version range. Equivalent to caret.
	 */
	minor: string;

	/**
	 * A patch version range. Equivalent to tilde.
	 */
	patch: string;

	/**
	 * A caret version range. Equivalent to minor.
	 */
	caret: string;

	/**
	 * A tilde version range. Equivalent to patch.
	 */
	tilde: string;

	/**
	 * A legacy compatibility range that is configurable per release group.
	 * This range extends beyond standard version ranges and lies between major and minor versions.
	 * Exceeding this range indicates compatibility differences.
	 */
	legacyCompat: string;
}

/**
 * Get the release ranges for a version string.
 *
 * @param version - The version.
 * @param legacyCompatInterval - The multiple of minor versions to use for calculating the next version in the range.
 * @param releaseGroupOrPackage - Release group or package name
 * @param scheme - If provided, this version scheme will be used. Otherwise the scheme will be detected from the
 * version.
 * @returns The {@link ReleaseRanges} for a version string
 */
export const getRanges = (
	version: ReleaseVersion,
	legacyCompatInterval: ReleaseReportConfig,
	releaseGroupOrPackage: ReleaseGroup | string,
	scheme?: VersionScheme,
): ReleaseRanges => {
	const schemeToUse = scheme ?? detectVersionScheme(version);

	return schemeToUse === "internal"
		? {
				patch: getVersionRange(version, "patch"),
				minor: getVersionRange(version, "minor"),
				tilde: getVersionRange(version, "~"),
				caret: getVersionRange(version, "^"),
				// legacyCompat is not currently supported for internal schema. Fallback to major compatibility range.
				legacyCompat: getVersionRange(version, "^"),
			}
		: {
				patch: `~${version}`,
				minor: `^${version}`,
				tilde: `~${version}`,
				caret: `^${version}`,
				legacyCompat: getLegacyCompatVersionRange(
					version,
					legacyCompatInterval,
					releaseGroupOrPackage,
				),
			};
};

/**
 * An interface representing a mapping of package names to their corresponding version strings or ranges.
 */
interface PackageVersion {
	[packageName: string]: string;
}

/**
 * A type representing the different kinds of report formats we output.
 *
 * "full" corresponds to the {@link ReleaseReport} interface. It contains a lot of package metadata indexed by package
 * name.
 *
 * The "caret", "tilde", and "legacy-compat" correspond to the {@link PackageVersion} interface.
 * Each of these compatibility classes contains a map of package names to their respective
 * equivalent version range strings:
 * "caret": caret-equivalent version ranges.
 * "tilde": tilde-equivalent version ranges.
 * "legacy-compat": legacy compat equivalent version ranges.
 */
export type ReportKind = "full" | "caret" | "tilde" | "simple" | "legacy-compat";

/**
 * Converts a {@link ReleaseReport} into different formats based on the kind.
 */
export function toReportKind(
	report: ReleaseReport,
	kind: ReportKind,
): ReleaseReport | PackageVersion {
	const toReturn: PackageVersion = {};

	switch (kind) {
		case "full": {
			return report;
		}

		case "simple": {
			for (const [pkg, details] of Object.entries(report)) {
				toReturn[pkg] = details.version;
			}

			break;
		}

		case "caret": {
			for (const [pkg, details] of Object.entries(report)) {
				toReturn[pkg] = details.ranges.caret;
			}

			break;
		}

		case "tilde": {
			for (const [pkg, details] of Object.entries(report)) {
				toReturn[pkg] = details.ranges.tilde;
			}

			break;
		}

		case "legacy-compat": {
			for (const [pkg, details] of Object.entries(report)) {
				toReturn[pkg] = details.ranges.legacyCompat;
			}
			break;
		}

		default: {
			throw new Error(`Unexpected ReportKind: ${kind}`);
		}
	}

	return toReturn;
}

/**
 * Generates a new version representing the next version in a legacy compatibility range based on a specified multiple of minor versions.
 *
 * @param version - A string representing the current version.
 * @param interval - The multiple of minor versions to use for calculating the next version in the range.
 * @param releaseGroupOrPackage - Release group or package name
 *
 * @returns A string representing the next version in the legacy compatibility range.
 */
function getLegacyCompatVersionRange(
	version: string,
	interval: ReleaseReportConfig,
	releaseGroupOrPackage: ReleaseGroup | string,
): string {
	const intervalValue = interval.legacyCompatInterval[releaseGroupOrPackage];
	if (intervalValue > 0) {
		return getLegacyCompatRange(version, intervalValue);
	}

	// If legacy compat range is equal to 0, return caret version.
	return `^${version}`;
}

/**
 * Generates a new version representing the next version in a legacy compatibility range for any release group.
 * Does not support Fluid internal schema or prerelease versions.
 *
 * @param version - A string representing the current version.
 * @param interval - The multiple of minor versions to use for calculating the next version.
 *
 * @returns A string representing the next version in the legacy compatibility range.
 */
export function getLegacyCompatRange(version: string, interval: number): string {
	const semVersion = semver.parse(version);
	if (!semVersion) {
		throw new Error("Invalid version string");
	}

	if (detectVersionScheme(version) === "internal") {
		throw new Error(`Internal version schema is not supported`);
	}

	if (semVersion.prerelease.length > 0) {
		throw new Error(`Prerelease section is not expected`);
	}
	// Calculate the next compatible minor version using the compatVersionInterval
	const baseMinor = Math.floor(semVersion.minor / interval) * interval;
	const newSemVerString = `${semVersion.major}.${baseMinor + interval}.0`;

	const higherVersion = semver.parse(newSemVerString);
	if (higherVersion === null) {
		throw new Error(
			`Couldn't convert ${version} to the legacy version scheme. Tried parsing: '${newSemVerString}'`,
		);
	}

	const rangeString = `>=${version} <${higherVersion}`;
	const range = semver.validRange(rangeString);
	if (range === null) {
		throw new Error(`The generated range string was invalid: "${rangeString}"`);
	}

	return range;
}

/**
 * Ask the user which version they are releasing, and return the bump type based on the version specified.
 */
export async function askForReleaseVersion(
	log: CommandLogger,
	data: Pick<FluidReleaseStateHandlerData, "context" | "releaseVersion" | "releaseGroup">,
): Promise<VersionBumpType> {
	const { context, releaseVersion: branchVersion, releaseGroup } = data;

	const gitRepo = await context.getGitRepository();
	const currentBranch = await gitRepo.getCurrentBranchName();

	const recentVersions = await gitRepo.getAllVersions(releaseGroup);
	assert(recentVersions !== undefined, "versions is undefined");
	const sortedVersions = sortVersions(recentVersions, "version");
	const mostRecentRelease = sortedVersions?.[0];

	// Split the versions by version scheme because we need to treat them differently
	const regularSemVer: VersionDetails[] = [];
	const internalVersions: VersionDetails[] = [];
	const virtualPatchVersions: VersionDetails[] = [];
	for (const verDetails of recentVersions) {
		const scheme = detectVersionScheme(verDetails.version);
		if (scheme === "internal" || scheme === "internalPrerelease") {
			internalVersions.push(verDetails);
		} else if (scheme === "virtualPatch") {
			virtualPatchVersions.push(verDetails);
		} else {
			regularSemVer.push(verDetails);
		}
	}

	// take the highest releases from each minor series as the input for choices
	const choices = [
		...choicesFromVersions(takeHighestOfMinorSeries(regularSemVer)),
		...choicesFromVersions(takeHighestOfMinorSeries(internalVersions)),
		...choicesFromVersions(takeHighestOfMinorSeries(virtualPatchVersions)),
	];

	log.log(`Branch: ${chalk.blue(currentBranch)}`);
	log.log(`${chalk.blue(releaseGroup)} version on this branch: ${chalk.bold(branchVersion)}`);
	log.log(
		`Most recent release: ${mostRecentRelease.version} (${
			mostRecentRelease.date === undefined
				? `no date`
				: formatDistanceToNow(mostRecentRelease.date)
		})`,
	);
	log.log("");

	// If a bumpType was set in the handler data, use it. Otherwise set it as the default for the branch. If there's
	// no default for the branch, ask the user.
	const versionToRelease = await rawlist({
		choices,
		message: `What version do you wish to release?`,
	});

	const { bumpType } = versionToRelease;

	if (bumpType === undefined) {
		throw new Error(`bumpType is undefined.`);
	}

	return bumpType;
}

/**
 * Iterates through the versions and takes the first (highest) version of every minor version series. That is, the input
 * [2.2.3, 2.2.2, 1.2.3, 1.2.2] will return [2.2.3, 1.2.3].
 *
 * All versions in the input must be of the same scheme or this function will throw.
 */
export function takeHighestOfMinorSeries(versions: VersionDetails[]): VersionDetails[] {
	const minorSeries = new Set<string>();
	const minors: VersionDetails[] = [];

	if (versions.length === 0) {
		return minors;
	}

	// Detect version scheme based on first element
	const expectedScheme = detectVersionScheme(versions[0].version);
	const sortedVersions = sortVersions(versions, "version");
	for (const details of sortedVersions) {
		const { version } = details;
		const detectedScheme = detectVersionScheme(version);
		if (expectedScheme !== detectedScheme) {
			throw new Error(
				`All versions should use the ${expectedScheme} version scheme, but found one using ${detectedScheme} (${version}).`,
			);
		}

		const scheme = detectVersionScheme(version);
		const versionNormalized =
			scheme === "internal" || scheme === "internalPrerelease"
				? // Second item in the returned 3-tuple is the internal version
					fromInternalScheme(version)[1]
				: scheme === "virtualPatch"
					? fromVirtualPatchScheme(version).version
					: version;

		const minorZero = `${semver.major(versionNormalized)}.${semver.minor(versionNormalized)}.0`;
		if (!minorSeries.has(minorZero)) {
			minors.push(details);
			minorSeries.add(minorZero);
		}
	}

	return sortVersions(minors, "version");
}

function choicesFromVersions(
	versions: VersionDetails[],
): (Separator | { value: { bumpType: VersionBumpType; version: string }; name: string })[] {
	const choices: (
		| Separator
		| { value: { bumpType: VersionBumpType; version: string }; name: string }
	)[] = [];
	for (const [index, relVersion] of versions.entries()) {
		// The first item is the most recent release, so offer all three bumped versions as release options
		if (index === 0) {
			const majorVer = bumpVersionScheme(relVersion.version, "major").version;
			choices.push({
				value: { bumpType: "major", version: majorVer },
				name: `${majorVer} (major)`,
			});

			const minorVer = bumpVersionScheme(relVersion.version, "minor").version;
			choices.push({
				value: { bumpType: "minor", version: minorVer },
				name: `${minorVer} (minor)`,
			});

			const patchVer = bumpVersionScheme(relVersion.version, "patch").version;
			choices.push({
				value: { bumpType: "patch", version: patchVer },
				name: `${patchVer} (patch)`,
			});
		} else {
			const patchVer = bumpVersionScheme(relVersion.version, "patch").version;
			choices.push({
				value: { bumpType: "patch", version: patchVer },
				name: `${patchVer} (patch)`,
			});
		}

		choices.push(new Separator());
	}

	return choices;
}
