/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import {
	type IReleaseGroup,
	type ReleaseGroupName,
	isIReleaseGroup,
} from "@fluid-tools/build-infrastructure";
import { ReleaseVersion, VersionBumpType, detectBumpType } from "@fluid-tools/version-tools";
import { Args } from "@oclif/core";
import semver from "semver";
import { sortPackageJson as sortJson } from "sort-package-json";

import { findPackageOrReleaseGroup } from "../../args.js";
import { sortVersions } from "../../library/index.js";
import { ReleaseReportBaseCommand, ReleaseSelectionMode } from "./report.js";

const tagRefPrefix = "refs/tags/";

/**
 * The `release fromTag` command is used to get release information from a git tag.
 *
 * This command is used in CI to determine release information when a new release tag is pushed.
 */
export default class FromTagCommand extends ReleaseReportBaseCommand<typeof FromTagCommand> {
	static readonly summary = "Determines release information based on a git tag argument.";

	static readonly description =
		"This command is used in CI to determine release information when a new release tag is pushed.";

	static readonly enableJsonFlag = true;

	static readonly args = {
		tag: Args.string({
			required: true,
			description: "A git tag that represents a release. May begin with 'refs/tags/'.",
		}),
	} as const;

	defaultMode: ReleaseSelectionMode = "inRepo";
	// releaseGroupName: ReleaseGroupName | undefined;

	static readonly examples = [
		{
			description: "Get release information based on a git tag.",
			command: "<%= config.bin %> <%= command.id %> build-tools_v0.13.0",
		},
		{
			description: "You can include the refs/tags/ part of a tag ref.",
			command: "<%= config.bin %> <%= command.id %> refs/tags/2.0.0-internal.2.0.2",
		},
	];

	async run(): Promise<{
		packageOrReleaseGroup: ReleaseGroupName;
		title: string;
		tag: string;
		date?: Date;
		releaseType: VersionBumpType;
		version: ReleaseVersion;
		previousVersion?: ReleaseVersion;
		previousTag?: string;
	}> {
		const tagInput = this.args.tag;
		const fluidRepo = await this.getBuildProject();

		const [releaseGroup, version, tag] = await this.parseTag(tagInput);

		this.releaseData = await this.collectReleaseData(
			fluidRepo,
			this.defaultMode,
			releaseGroup,
			false,
		);

		const release = this.releaseData[releaseGroup.name];
		const versions = sortVersions([...release.versions], "version");
		const taggedReleaseIndex = versions.findIndex((v) => v.version === version.version);
		if (taggedReleaseIndex === -1) {
			this.error(`Release matching version '${version.version}' not found`);
		}

		const taggedVersion = versions[taggedReleaseIndex];

		const prevVersionDetails = versions[taggedReleaseIndex + 1];
		if (prevVersionDetails === undefined) {
			this.error(`No previous release found`);
		}

		const previousVersion = prevVersionDetails?.version;
		const releaseType = detectBumpType(previousVersion, version);
		if (releaseType === undefined) {
			this.error(
				`Unable to determine release type for ${previousVersion} -> ${version.version}`,
			);
		}

		this.log(`${releaseGroup.name} v${version.version} (${releaseType})`);

		// When the --json flag is passed, the command will return the raw data as JSON.
		return sortJson({
			packageOrReleaseGroup: releaseGroup.name,
			title: getReleaseTitle(releaseGroup.name, version, releaseType),
			tag,
			date: taggedVersion.date,
			releaseType,
			version: version.version,
			previousVersion,
			previousTag:
				prevVersionDetails === undefined
					? undefined
					: `${releaseGroup.name}_v${previousVersion}`,
		});
	}

	/**
	 * Parses a git tag string into a release group and a semver version.
	 * @param input - A git tag as a string.
	 * @returns A 3-tuple of the release group, the semver version, and the original tag.
	 */
	private async parseTag(input: string): Promise<[IReleaseGroup, semver.SemVer, string]> {
		const tag = input.startsWith(tagRefPrefix) ? input.slice(tagRefPrefix.length) : input;
		const [rg, ver] = tag.split("_v");

		const version = semver.parse(ver);
		if (version === null) {
			throw new Error(`Invalid version parsed from tag: ${ver}`);
		}

		const fluidRepo = await this.getBuildProject();
		const releaseGroup = findPackageOrReleaseGroup(rg, fluidRepo);
		if (releaseGroup === undefined) {
			this.error(`Can't find release group or package with name: ${rg}`, {
				exit: 1,
			});
		}

		if (!isIReleaseGroup(releaseGroup)) {
			this.error(
				`"${rg}" is a package, not a release group. Only release groups are supported.`,
				{
					exit: 2,
				},
			);
		}

		return [releaseGroup, version, tag];
	}
}

const getReleaseTitle = (
	releaseGroupName: ReleaseGroupName,
	version: semver.SemVer,
	releaseType: VersionBumpType,
): string => {
	const name = releaseGroupName === "client" ? "Fluid Framework" : releaseGroupName;
	// e.g. Fluid Framework v2.0.0-internal.4.1.0 (minor)
	return `${name} v${version.version} (${releaseType})`;
};
