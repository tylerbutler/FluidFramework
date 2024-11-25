/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { strict as assert } from "node:assert";
import path from "node:path";

import {
	type IFluidRepo,
	type IReleaseGroup,
	type PackageName,
	type ReleaseGroupName,
	getAllDependenciesInRepo,
} from "@fluid-tools/build-infrastructure";
import {
	ReleaseVersion,
	VersionBumpType,
	detectBumpType,
	detectVersionScheme,
	getPreviousVersions,
	isVersionBumpType,
} from "@fluid-tools/version-tools";
import { rawlist } from "@inquirer/prompts";
import { Command, Flags, ux } from "@oclif/core";
import { differenceInBusinessDays, formatDistanceToNow } from "date-fns";
import { writeJson } from "fs-extra/esm";
import chalk from "picocolors";
import sortJson from "sort-json";
import { table } from "table";

import {
	type IBuildProject,
	type IReleaseGroup,
	type PackageName,
	type ReleaseGroupName,
	getAllDependenciesInRepo,
} from "@fluid-tools/build-infrastructure";
import { releaseGroupFlag } from "../../flags.js";

// eslint-disable-next-line import/no-internal-modules
import { getAllVersions } from "../../library/git.js";
import {
	BaseCommand,
	ReleaseReport,
	ReportKind,
	VersionDetails,
	filterVersionsOlderThan,
	getDisplayDate,
	getDisplayDateRelative,
	getRanges,
	sortVersions,
	toReportKind,
} from "../../library/index.js";
import { CommandLogger } from "../../logging.js";

/**
 * Controls behavior when there is a list of releases and one needs to be selected.
 */
export type ReleaseSelectionMode =
	/**
	 * The release should be selected interactively from a list of possible releases.
	 */
	| "interactive"

	/**
	 * The most recent release by date should be selected.
	 */
	| "date"

	/**
	 * The highest version release should be selected.
	 */
	| "version"

	/**
	 * The version of the package or release group in the repo should be selected.
	 */
	| "inRepo";

const DEFAULT_MIN_VERSION = "0.0.0";

// type Flags<T extends typeof BaseCommand> = Interfaces.InferredFlags<
//   typeof BaseCommand["baseFlags"] & typeof ReleaseReportBaseCommand["baseFlags"] & T["flags"]
// >;

// type Args<T extends typeof BaseCommand> = Interfaces.InferredArgs<T["args"]>;

/**
 * A base class for release reporting commands. It contains some shared properties and methods and are used by
 * subclasses, which implement the individual command logic.
 */
export abstract class ReleaseReportBaseCommand<
	T extends typeof Command,
> extends BaseCommand<T> {
	protected releaseData: PackageReleaseData | undefined;

	/**
	 * The default {@link ReleaseSelectionMode} that the command uses.
	 */
	protected abstract readonly defaultMode: ReleaseSelectionMode;

	/**
	 * The number of business days for which to consider releases recent. `undefined` means there is no limit.
	 * Subclasses use this value to filter releases, format recent releases differently, etc.
	 */
	protected numberBusinessDaysToConsiderRecent: number | undefined;

	// /**
	//  * The release group that is being reported on.
	//  */
	// protected abstract releaseGroup: IReleaseGroup | undefined;

	/**
	 * Returns true if the `date` is within `days` days of the current date.
	 */
	protected isRecentReleaseByDate(date?: Date): boolean {
		return date === undefined
			? false
			: this.numberBusinessDaysToConsiderRecent === undefined
				? true
				: differenceInBusinessDays(Date.now(), date) < this.numberBusinessDaysToConsiderRecent;
	}

	/**
	 * Collect release data from the repo. Subclasses should call this in their init or run methods.
	 *
	 * @param repo - The {@link Context}.
	 * @param mode - The {@link ReleaseSelectionMode} to use to determine the release to report on.
	 * @param releaseGroup - If provided, the release data collected will be limited to only the pakages in this release
	 * group and its direct Fluid dependencies.
	 * @param includeDependencies - If true, the release data will include the Fluid dependencies of the release group.
	 */
	protected async collectReleaseData(
		repo: IBuildProject,
		mode: ReleaseSelectionMode = this.defaultMode,
		releaseGroup?: IReleaseGroup,
		includeDependencies = true,
	): Promise<PackageReleaseData> {
		const versionData: PackageReleaseData = {};

		if (mode === "inRepo" && releaseGroup === undefined) {
			this.error(
				`Release group must be provided unless --interactive, --highest, or --mostRecent are provided.`,
			);
		}

		const selectedReleaseGroups: IReleaseGroup[] = [];

		if (mode === "inRepo") {
			// Get the release group versions and dependency versions from the repo
			if (releaseGroup !== undefined) {
				if (includeDependencies) {
					const { releaseGroups } = getAllDependenciesInRepo(repo, releaseGroup.packages);
					selectedReleaseGroups.push(...releaseGroups);
				} else {
					selectedReleaseGroups.push(releaseGroup);
				}
			}
		} else if (releaseGroup === undefined) {
			// No filter, so include all release groups and packages
			selectedReleaseGroups.push(...repo.releaseGroups.values());
		}

		// Only start/show the spinner in non-interactive mode.
		if (mode !== "interactive") {
			ux.action.start("Collecting version data from git tags");
		}

		for (const rg of selectedReleaseGroups) {
			ux.action.status = rg.toString();
			// eslint-disable-next-line no-await-in-loop
			const data = await this.collectRawReleaseData(repo, rg, rg.version, mode);
			if (data !== undefined) {
				versionData[rg.name] = data;
			}
		}

		ux.action.stop("Done!");
		return versionData;
	}

	/**
	 * Collects the releases of a given release group or package.
	 *
	 * @param repo - The {@link IBuildProject}.
	 * @param releaseGroup - The release group or package to collect release data for.
	 * @param repoVersion - The version of the release group or package in the repo.
	 * @param latestReleaseChooseMode - Controls which release is considered the latest.
	 * @returns The collected release data.
	 */
	private async collectRawReleaseData(
		repo: IBuildProject,
		releaseGroup: IReleaseGroup,
		repoVersion: string,
		latestReleaseChooseMode?: ReleaseSelectionMode,
	): Promise<RawReleaseData | undefined> {
		const versions = await getAllVersions(repo, releaseGroup.name);

		if (versions === undefined) {
			return undefined;
		}

		const sortedByVersion = sortVersions(versions, "version");
		const sortedByDate = sortVersions(versions, "date");
		const versionCount = sortedByVersion.length;

		if (sortedByDate === undefined) {
			this.error(`sortedByDate is undefined.`);
		}

		let latestReleasedVersion: VersionDetails | undefined;

		switch (latestReleaseChooseMode) {
			case undefined:
			case "interactive": {
				const recentReleases =
					this.numberBusinessDaysToConsiderRecent === undefined
						? sortedByDate
						: filterVersionsOlderThan(sortedByDate, this.numberBusinessDaysToConsiderRecent);

				// No recent releases, so set the latest to the highest semver
				if (recentReleases.length === 0) {
					if (sortedByVersion.length > 0) {
						latestReleasedVersion = sortedByVersion[0];
					} else {
						this.errorLog(`No releases at all! ${releaseGroup}`);
					}
				}

				if (recentReleases.length === 1) {
					latestReleasedVersion = recentReleases[0];
				} else if (recentReleases.length > 1) {
					const answer = await rawlist({
						message: `Multiple versions of ${releaseGroup.name} have been released. Select the one you want to include in the release report.`,
						choices: recentReleases.map((v) => {
							return {
								name: `${v.version} (${formatDistanceToNow(v.date ?? 0)} ago)`,
								value: v.version,
								short: v.version,
							};
						}),
					});
					const selectedVersion = answer ?? recentReleases[0].version;
					latestReleasedVersion = recentReleases.find((v) => v.version === selectedVersion);
				}

				break;
			}

			case "inRepo": {
				latestReleasedVersion = sortedByVersion.find((v) => v.version === repoVersion);
				if (latestReleasedVersion === undefined) {
					const [, previousMinor] = getPreviousVersions(repoVersion);
					this.info(
						`The in-repo version of ${chalk.blue(releaseGroup)} is ${chalk.yellow(
							repoVersion,
						)}, but there's no release for that version. Picked previous minor version instead: ${chalk.green(
							previousMinor ?? "undefined",
						)}. If you want to create a report for a specific version, check out the tag for the release and re-run this command.`,
					);
					latestReleasedVersion = sortedByVersion[0];
				}
				break;
			}

			case "date": {
				latestReleasedVersion = sortedByDate[0];
				break;
			}

			case "version": {
				latestReleasedVersion = sortedByVersion[0];
				break;
			}

			default: {
				throw new Error(`Unhandled mode: ${latestReleaseChooseMode}`);
			}
		}

		assert(latestReleasedVersion !== undefined, "latestReleasedVersion is undefined");

		const vIndex = sortedByVersion.findIndex(
			(v) =>
				v.version === latestReleasedVersion?.version && v.date === latestReleasedVersion?.date,
		);
		const previousReleasedVersion =
			vIndex + 1 <= versionCount
				? sortedByVersion[vIndex + 1]
				: { version: DEFAULT_MIN_VERSION };

		return {
			repoVersion: {
				version: repoVersion,
			},
			latestReleasedVersion,
			previousReleasedVersion,
			versions,
		};
	}
}

export default class ReleaseReportCommand extends ReleaseReportBaseCommand<
	typeof ReleaseReportCommand
> {
	static readonly description = `Generates a report of Fluid Framework releases.

    The release report command is used to produce a report of all the packages that were released and their version. After a release, it is useful to generate this report to provide to customers, so they can update their dependencies to the most recent version.

    The command operates in two modes: "whole repo" or "release group." The default mode is "whole repo." In this mode, the command will look at the git tags in the repo to determine the versions, and will include all release groups and packages in the repo. You can control which version of each package and release group is included in the report using the --interactive, --mostRecent, and --highest flags.

    The "release group" mode can be activated by passing a --releaseGroup flag. In this mode, the specified release group's version will be loaded from the repo, and its immediate Fluid dependencies will be included in the report. This is useful when we want to include only the dependency versions that the release group depends on in the report.`;

	static readonly examples = [
		{
			description:
				"Generate a release report of the highest semver release for each package and release group and display it in the terminal only.",
			command: "<%= config.bin %> <%= command.id %>",
		},
		{
			description: "Output all release report files to the current directory.",
			command: "<%= config.bin %> <%= command.id %> -o .",
		},
		{
			description:
				"Generate a release report for each package and release group in the repo interactively.",
			command: "<%= config.bin %> <%= command.id %> -i",
		},
	];

	static readonly enableJsonFlag = true;
	static readonly flags = {
		interactive: Flags.boolean({
			char: "i",
			description:
				"Choose the version of each release group and package to contain in the release report.",
			exclusive: ["mostRecent", "highest"],
		}),
		highest: Flags.boolean({
			char: "s",
			description: "Always pick the greatest semver version as the latest (ignore dates).",
			exclusive: ["mostRecent", "interactive"],
		}),
		mostRecent: Flags.boolean({
			char: "r",
			description:
				"Always pick the most recent version as the latest (ignore semver version sorting).",
			exclusive: ["highest", "interactive"],
		}),
		releaseGroup: releaseGroupFlag({
			description: `Report only on this release group. If also pass --interactive, --highest, or --mostRecent, then the report will only include this release group at the selected version.

            If you pass this flag by itself, the command will use the version of the release group at the current commit in the repo, but will also include its direct Fluid dependencies.

            If you want to report on a particular release, check out the git tag for the release version you want to report on before running this command.`,
			required: false,
		}),
		output: Flags.directory({
			char: "o",
			description: "Output JSON report files to this directory.",
		}),
		baseFileName: Flags.string({
			description:
				"If provided, the output files will be named using this base name followed by the report kind (caret, simple, full, tilde, legacy-compat) and the .json extension. For example, if baseFileName is 'foo', the output files will be named 'foo.caret.json', 'foo.simple.json', etc.",
			required: false,
		}),
		...ReleaseReportBaseCommand.flags,
	};

	readonly defaultMode: ReleaseSelectionMode = "inRepo";
	releaseGroup: IReleaseGroup | undefined;

	public async run(): Promise<void> {
		const { flags } = this;

		const shouldOutputFiles = flags.output !== undefined;
		const outputPath = flags.output ?? process.cwd();

		const mode =
			flags.highest === true
				? "version"
				: flags.mostRecent === true
					? "date"
					: flags.interactive
						? "interactive"
						: this.defaultMode;
		assert(mode !== undefined, `mode is undefined`);

		const repo = await this.getBuildProject();
		this.releaseGroup = repo.releaseGroups.get(flags.releaseGroup as ReleaseGroupName);

		if (this.releaseGroup === undefined) {
			this.error(`Cannot find release group "${flags.releaseGroup}".`, { exit: 1 });
		}

		// Collect the release version data from the history
		this.releaseData = await this.collectReleaseData(
			repo,
			mode,
			this.releaseGroup,
			/* includeDeps */ mode === "inRepo",
		);

		if (this.releaseData === undefined) {
			this.error(`No releases found for ${flags.releaseGroup}`);
		}
		const report = await this.generateReleaseReport(this.releaseData);

		const tableData = this.generateReleaseTable(report, this.releaseGroup);

		const output = table(tableData, {
			singleLine: true,
		});

		this.logHr();
		this.log();
		this.log(chalk.underline(chalk.bold(`Release Report`)));
		if (mode === "inRepo" && flags.releaseGroup !== undefined) {
			this.log(
				`${chalk.yellow(chalk.bold("\nIMPORTANT"))}: This report only includes the ${chalk.blue(
					flags.releaseGroup,
				)} release group (version ${chalk.blue(
					this.releaseGroup.version,
				)}) and its ${chalk.bold("direct Fluid dependencies")}.`,
			);
			this.log(
				`${chalk.yellow(
					chalk.bold("IMPORTANT"),
				)}: The release version was determined by the in-repo version of the release group.`,
			);
		} else if (flags.releaseGroup === undefined) {
			this.log(
				`${chalk.yellow(chalk.bold("\nIMPORTANT"))}: This report includes ${chalk.blue(
					"all packages and release groups",
				)} in the repo.`,
			);
		} else if (flags.releaseGroup !== undefined) {
			this.log(
				`${chalk.yellow(chalk.bold("\nIMPORTANT"))}: This report only includes the ${chalk.blue(
					flags.releaseGroup,
				)} release group! ${chalk.bold("None of its dependencies are included.")}`,
			);
		}

		switch (mode) {
			case "interactive": {
				this.log(
					`${chalk.yellow(chalk.bold("IMPORTANT"))}: Release versions were selected ${chalk.bold(
						"interactively",
					)}.`,
				);

				break;
			}
			case "date": {
				this.log(
					`${chalk.yellow(chalk.bold("IMPORTANT"))}: The latest release version ${chalk.bold(
						"by date",
					)} was selected.`,
				);

				break;
			}
			case "version": {
				this.log(
					`${chalk.yellow(chalk.bold("IMPORTANT"))}: The ${chalk.bold(
						"highest semver",
					)} version was selected.`,
				);

				break;
			}
			// No default
		}

		this.log(`\n${output}`);
		this.logHr();

		if (shouldOutputFiles) {
			this.info(`Writing files to path: ${path.resolve(outputPath)}`);
			const promises = [
				writeReport(
					report,
					"simple",
					outputPath,
					this.releaseGroup,
					flags.baseFileName,
					this.logger,
				),
				writeReport(
					report,
					"full",
					outputPath,
					this.releaseGroup,
					flags.baseFileName,
					this.logger,
				),
				writeReport(
					report,
					"caret",
					outputPath,
					this.releaseGroup,
					flags.baseFileName,
					this.logger,
				),
				writeReport(
					report,
					"tilde",
					outputPath,
					this.releaseGroup,
					flags.baseFileName,
					this.logger,
				),
				writeReport(
					report,
					"legacy-compat",
					outputPath,
					this.releaseGroup,
					flags.baseFileName,
					this.logger,
				),
			];

			await Promise.all(promises);
		}
	}

	private async generateReleaseReport(reportData: PackageReleaseData): Promise<ReleaseReport> {
		const fluidRepo = await this.getBuildProject();
		const report: ReleaseReport = {};

		for (const [pkgName, verDetails] of Object.entries(reportData)) {
			if (verDetails.previousReleasedVersion === undefined) {
				this.warning(`No previous version for ${pkgName}.`);
			}

			const { version: latestVer, date: latestDate } = verDetails.latestReleasedVersion;
			const { version: prevVer } = verDetails.previousReleasedVersion ?? {
				version: DEFAULT_MIN_VERSION,
			};

			const bumpType = detectBumpType(prevVer, latestVer);
			if (!isVersionBumpType(bumpType)) {
				this.error(
					`Invalid bump type (${bumpType}) detected in package ${pkgName}. ${prevVer} => ${latestVer}`,
				);
			}

			const isNewRelease = this.isRecentReleaseByDate(latestDate);
			const scheme = detectVersionScheme(latestVer);
			const flubConfig = this.getFlubConfig();

			if (flubConfig.releaseReport === undefined) {
				throw new Error(`releaseReport not found in config.`);
			}

			const ranges = getRanges(latestVer, flubConfig.releaseReport, pkgName);
			const thePackage = fluidRepo.packages.get(pkgName as PackageName);
			if (thePackage === undefined) {
				this.error(`Package not found: ${pkgName}`);
			}
			const releaseGroup = fluidRepo.getPackageReleaseGroup(thePackage);
			for (const pkg of releaseGroup.packages) {
				report[pkg.name] = {
					version: latestVer,
					versionScheme: scheme,
					previousVersion: prevVer === DEFAULT_MIN_VERSION ? undefined : prevVer,
					date: latestDate,
					releaseType: bumpType,
					releaseGroup,
					isNewRelease,
					ranges,
				};
			}
		}

		return report;
	}

	private generateReleaseTable(
		reportData: ReleaseReport,
		initialReleaseGroup?: IReleaseGroup,
	): string[][] {
		const tableData: string[][] = [];
		const releaseGroups: IReleaseGroup[] = [];

		for (const [pkgName, verDetails] of Object.entries(reportData)) {
			const {
				date: latestDate,
				version: latestVer,
				previousVersion: prevVer,
				releaseGroup,
			} = verDetails;

			let displayName: string | undefined;
			if (releaseGroup !== undefined) {
				displayName =
					releaseGroup.name === initialReleaseGroup?.name
						? chalk.blue(chalk.bold(releaseGroup))
						: chalk.bold(releaseGroup);
			}

			const displayDate = getDisplayDate(latestDate);
			const highlight = this.isRecentReleaseByDate(latestDate) ? chalk.green : chalk.white;
			const displayRelDate = highlight(getDisplayDateRelative(latestDate));

			const displayPreviousVersion = prevVer ?? DEFAULT_MIN_VERSION;

			const bumpType = detectBumpType(prevVer ?? DEFAULT_MIN_VERSION, latestVer);
			const displayBumpType = highlight(`${bumpType}`);

			const displayVersionSection = chalk.gray(
				`${highlight(latestVer)} <-- ${displayPreviousVersion}`,
			);

			if (releaseGroup === undefined || !releaseGroups.includes(releaseGroup)) {
				tableData.push([
					displayName ?? pkgName,
					displayBumpType,
					displayRelDate,
					displayDate,
					displayVersionSection,
				]);
				if (releaseGroup !== undefined) {
					releaseGroups.push(releaseGroup);
				}
			}
		}

		tableData.sort((a, b) => {
			if (a[0] > b[0]) {
				return 1;
			}

			if (a[0] < b[0]) {
				return -1;
			}

			return 0;
		});

		return tableData;
	}
}

interface PackageReleaseData {
	[packageName: string]: RawReleaseData;
}

export interface RawReleaseData {
	repoVersion: VersionDetails;
	latestReleasedVersion: VersionDetails;
	latestReleaseType?: VersionBumpType;
	previousReleasedVersion?: VersionDetails;
	versions: readonly VersionDetails[];
}

/**
 * Generates a report filename.
 */
function generateReportFileName(
	kind: ReportKind,
	releaseVersion?: ReleaseVersion,
	releaseGroup?: IReleaseGroup,
	baseFileName?: string,
): string {
	if (releaseGroup === undefined && releaseVersion === undefined) {
		throw new Error(`Both releaseGroup and releaseVersion were undefined.`);
	}

	if (baseFileName !== undefined) {
		return `${baseFileName}.${kind}.json`;
	}

	return `fluid-framework-release-manifest.${releaseGroup ?? "all"}.${
		releaseVersion ?? DEFAULT_MIN_VERSION
	}.${kind}.json`;
}

/**
 * Writes a report to a file.
 */
// eslint-disable-next-line max-params
async function writeReport(
	report: ReleaseReport,
	kind: ReportKind,
	dir: string,
	releaseGroup: IReleaseGroup,
	baseFileName?: string,
	log?: CommandLogger,
): Promise<void> {
	const { version } = releaseGroup;
	const reportName = generateReportFileName(kind, version, releaseGroup, baseFileName);
	const reportPath = path.join(dir, reportName);
	log?.info(`${kind} report written to ${reportPath}`);
	const reportOutput = toReportKind(report, kind);

	await writeJson(reportPath, reportOutput, { spaces: 2 });
	sortJson.overwrite(reportPath);
}
