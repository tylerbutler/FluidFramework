/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import { ExtractorConfig } from "@microsoft/api-extractor";
import { Flags, Config } from "@oclif/core";
import { Package, updatePackageJsonFile } from "@fluidframework/build-tools";
import path from "node:path";
import { PackageCommand } from "../../BasePackageCommand";
// eslint-disable-next-line node/no-missing-import
import type { PackageJson } from "type-fest";
import { CommandLogger } from "../../logging";

/**
 * Represents a list of package categorized into two arrays
 */
interface PackageTypesList {
	/**
	 * An array of strings containing package names that have been updated.
	 */
	packagesUpdated: string[];
	/**
	 * An array of strings containing package names that have not been updated.
	 */
	packagesNotUpdated: string[];
}

/**
 * Represents a configuration object for updating a package.
 */
interface UpdateConfig {
	/**
	 * The package to be updated.
	 */
	pkg: Package;
	/**
	 * The type of release for the package (e.g., "alpha", "beta", "public").
	 */
	releaseType: ReleaseTag;
	/**
	 * The JSON data for the package.
	 */
	json: PackageJson;
	/**
	 * The first part of the split string, representing the folder name.
	 */
	typesFolder: string;
	/**
	 * A boolean value indicating whether alpha/beta keyword is included.
	 */
	includesAlphaBeta: boolean;
}

const knownReleaseTag = ["alpha", "beta", "public"] as const;

type ReleaseTag = typeof knownReleaseTag[number];

function isReleaseTag(str: string | undefined): str is ReleaseTag {
	return str === undefined ? false : knownReleaseTag.includes(str as any);
}

export default class SetReleaseTagPublishingCommand extends PackageCommand<
	typeof SetReleaseTagPublishingCommand
> {
	static readonly description =
		"Updates the .d.ts types that are included in the `types` field in package.json. This command is intended to be used in CI only.";

	static readonly enableJsonFlag = true;

	static readonly flags = {
		types: Flags.custom<ReleaseTag>({
			description: "Which .d.ts types to include in the published package.",
			required: true,
			parse: async (input: string): Promise<ReleaseTag> => {
				if (isReleaseTag(input)) {
					return input;
				}
				throw new Error(`Invalid release type: ${input}`);
			},
		})(),
		...PackageCommand.flags,
	};

	private packageList: PackageTypesList | undefined;

	public async init() {
		await super.init();
		this.packageList = {
			packagesNotUpdated: [],
			packagesUpdated: [],
		};
	}

	protected async processPackage(pkg: Package): Promise<void> {
		let packageUpdate: boolean = false;

		updatePackageJsonFile(pkg.directory, (json) => {
			const types: string | undefined = json.types ?? json.typings;

			if (types === undefined) {
				return;
			}

			const [typesFolder] = types.split("/");
			const includesAlphaBeta: boolean = types.includes("alpha") || types.includes("beta");

			// if (apiExtractorConfigExists) {
			// Read the content of api-extractor.json
			const configOptions = ExtractorConfig.tryLoadForFolder({
				startingFolder: pkg.directory,
			});
			if (configOptions === undefined) {
				this.verbose(`No api-extractor config found for ${pkg.name}. Skipping.`);
				return;
			}
			const apiExtractorConfig = ExtractorConfig.prepare(configOptions);
			// const apiExtractorConfig: string = fs.readFileSync(
			// 	apiExtractorConfigFilePath,
			// 	"utf-8",
			// );

			// if (apiExtractorConfig.alphaTrimmedFilePath !== "") {
			let typesFilePath: string | undefined;
			switch (this.flags.types) {
				case "alpha": {
					packageUpdate = true;
					typesFilePath = apiExtractorConfig.alphaTrimmedFilePath;
					break;
				}

				case "beta": {
					packageUpdate = true;
					typesFilePath = apiExtractorConfig.betaTrimmedFilePath;
					break;
				}

				case "public": {
					if (includesAlphaBeta) {
						typesFilePath = apiExtractorConfig.publicTrimmedFilePath;
					}
					break;
				}

				default: {
					this.error(`${this.flags.types} is not a valid value.`);
				}
			}

			if (typesFilePath === undefined) {
				this.error(`No .d.ts file found.`);
			}
			packageUpdate = true;
			json.types = typesFilePath;
			// }

			if (packageUpdate) {
				this.packageList?.packagesUpdated.push(pkg.name);
			} else {
				this.packageList?.packagesNotUpdated.push(pkg.name);
			}
			// }
		});
	}

	public async run(): Promise<PackageTypesList> {
		// Calls processPackage on all packages.
		await super.run();

		const flags = this.flags;

		if (this.packageList?.packagesUpdated.length === 0) {
			this.log(`No updates in package.json for ${flags.types} release tag`);
		}

		return this.packageList ?? { packagesUpdated: [], packagesNotUpdated: [] };
	}
}

/**
 * Updates the types/typing field in package.json.
 * @param config - The update configuration specifying the package, release type, JSON data, types folder, and inclusion of alpha/beta releases.
 * @param log - The logger used for logging verbose information.
 * @returns true if the update was successful, false otherwise.
 */
function updatePackageJsonTypes(config: UpdateConfig, log: CommandLogger): boolean {
	const apiExtractorConfigFilePath = path.join(config.pkg.directory, "api-extractor.json");
	let loadFile;
	try {
		loadFile = ExtractorConfig.loadFile(apiExtractorConfigFilePath);

		const dtsRollupEnabled = loadFile.dtsRollup?.enabled;
		if (dtsRollupEnabled === true) {
			log.verbose(`Config exists: ${JSON.stringify(config.pkg.directory)}`);

			const alpha = loadFile.dtsRollup?.alphaTrimmedFilePath;
			const beta = loadFile.dtsRollup?.betaTrimmedFilePath;

			log.log(alpha);
			log.log(beta);

			if (config.releaseType === "alpha" && alpha !== "") {
				config.json.types = `${config.typesFolder}/${config.pkg.nameUnscoped}-alpha.d.ts`;
				return true;
			}

			if (config.releaseType === "beta" && beta !== "") {
				config.json.types = `${config.typesFolder}/${config.pkg.nameUnscoped}-beta.d.ts`;
				return true;
			}

			if (config.releaseType === "public" && config.includesAlphaBeta) {
				config.json.types = `${config.typesFolder}/index.d.ts`;
				return true;
			}
		}
	} catch {
		if (loadFile === undefined) {
			log.verbose(`Config not exists: ${JSON.stringify(config.pkg.directory)}`);
		}
	}
	return false;
}

/**
 * Updates a package types list based on whether a package was updated or not.
 *
 * @param packageList - The package types list to be updated.
 * @param packageUpdate - A boolean indicating whether the package was updated.
 * @param pkg - The package being processed.
 * @returns The updated package types list.
 */
function updatePackageLists(
	packageList: PackageTypesList,
	packageUpdate: boolean,
	pkg: Package,
): PackageTypesList {
	if (packageUpdate) {
		packageList.packagesUpdated.push(pkg.name);
	} else {
		packageList.packagesNotUpdated.push(pkg.name);
	}
	return packageList;
}
