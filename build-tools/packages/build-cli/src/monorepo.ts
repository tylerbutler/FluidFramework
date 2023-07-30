import type { PackageJson as StandardPackageJson, SetRequired } from "type-fest";

/**
 * A type representing fluid-build-specific config that may be in package.json.
 */
type FluidPackageJson = {
	/**
	 * nyc config
	 */
	nyc?: any;

	/**
	 * type compatibility test configuration. This only takes effect when set in the package.json of a package. Setting
	 * it at the root of the repo or release group has no effect.
	 */
	typeValidation?: ITypeValidationConfig;

	/**
	 * fluid-build config. Some properties only apply when set in the root or release group root package.json.
	 */
	fluidBuild?: IFluidBuildConfig;
};

/**
 * A type representing all known fields in package.json, including fluid-build-specific config.
 *
 * By default all fields are optional, but we require that the name, dependencies, devDependencies, scripts, and version
 * all be defined.
 */
export type PackageJson = SetRequired<
	StandardPackageJson & FluidPackageJson,
	"name" | "dependencies" | "devDependencies" | "scripts" | "version"
>;


/**
 * A monorepo is a collection of packages that are versioned and released together.
 *
 * @remarks
 *
 * A monorepo is configured using either package.json or lerna.json. The files are checked in the following way:
 *
 * - If lerna.json exists, it is checked for a `packages` AND a `version` field.
 *
 * - If lerna.json contains BOTH of those fields, then the values in lerna.json will be used. Package.json will not be
 *   read.
 *
 * - If lerna.json contains ONLY the version field, it will be used.
 *
 * - Otherwise, if package.json exists, it is checked for a `workspaces` field and a `version` field.
 *
 * - If package.json contains a workspaces field, then packages will be loaded based on the globs in that field.
 *
 * - If the version was not defined in lerna.json, then the version value in package.json will be used.
 */
export class MonoRepo {
	public readonly packages: Package[] = [];
	public readonly version: string;
	public readonly workspaceGlobs: string[];
	private _packageJson: PackageJson;

	static load(group: string, repoPackage: IFluidRepoPackage, log: Logger) {
		const { directory, ignoredDirs, defaultInterdependencyRange } = repoPackage;
		let packageManager: PackageManager;
		let packageDirs: string[];

		try {
			const { tool, rootDir, packages } = getPackagesSync(directory);
			if (path.resolve(rootDir) !== directory) {
				// This is a sanity check. directory is the path passed in when creating the MonoRepo object, while rootDir is
				// the dir that manypkg found. They should be the same.
				throw new Error(`rootDir ${rootDir} does not match repoPath ${directory}`);
			}
			switch (tool.type) {
				case "lerna":
					// Treat lerna as "npm"
					packageManager = "npm";
					break;
				case "npm":
				case "pnpm":
				case "yarn":
					packageManager = tool.type;
					break;
				default:
					throw new Error(`Unknown package manager ${tool.type}`);
			}
			if (packages.length === 1 && packages[0].dir === directory) {
				// this is a independent package
				return undefined;
			}
			packageDirs = packages.filter((pkg) => pkg.relativeDir !== ".").map((pkg) => pkg.dir);

			if (defaultInterdependencyRange === undefined) {
				log?.warning(
					`No defaultinterdependencyRange specified for ${group} release group. Defaulting to "${DEFAULT_INTERDEPENDENCY_RANGE}".`,
				);
			}
		} catch {
			return undefined;
		}

		return new MonoRepo(
			group,
			directory,
			defaultInterdependencyRange ?? DEFAULT_INTERDEPENDENCY_RANGE,
			packageManager,
			packageDirs,
			ignoredDirs,
			log,
		);
	}

	/**
	 * Creates a new monorepo.
	 *
	 * @param kind The 'kind' of monorepo this object represents.
	 * @param repoPath The path on the filesystem to the monorepo. This location is expected to have either a
	 * package.json file with a workspaces field, or a lerna.json file with a packages field.
	 * @param ignoredDirs Paths to ignore when loading the monorepo.
	 */
	constructor(
		public readonly kind: string,
		public readonly repoPath: string,
		public readonly interdependencyRange: InterdependencyRange,
		private readonly packageManager: PackageManager,
		packageDirs: string[],
		ignoredDirs?: string[],
		private readonly logger: Logger = defaultLogger,
	) {
		this.version = "";
		this.workspaceGlobs = [];
		const pnpmWorkspace = path.join(repoPath, "pnpm-workspace.yaml");
		const lernaPath = path.join(repoPath, "lerna.json");
		const yarnLockPath = path.join(repoPath, "yarn.lock");
		const packagePath = path.join(repoPath, "package.json");
		let versionFromLerna = false;

		if (!existsSync(packagePath)) {
			throw new Error(`ERROR: package.json not found in ${repoPath}`);
		}

		this._packageJson = readJsonSync(packagePath);

		const validatePackageManager = existsSync(pnpmWorkspace)
			? "pnpm"
			: existsSync(yarnLockPath)
			? "yarn"
			: "npm";

		if (this.packageManager !== validatePackageManager) {
			throw new Error(
				`Package manager mismatch between ${packageManager} and ${validatePackageManager}`,
			);
		}

		if (existsSync(lernaPath)) {
			const lerna = readJsonSync(lernaPath);
			if (packageManager === "pnpm") {
				const workspaceString = readFileSync(pnpmWorkspace, "utf-8");
				this.workspaceGlobs = YAML.parse(workspaceString).packages;
			} else if (lerna.packages !== undefined) {
				this.workspaceGlobs = lerna.packages;
			}

			if (lerna.version !== undefined) {
				logger.verbose(`${kind}: Loading version (${lerna.version}) from ${lernaPath}`);
				this.version = lerna.version;
				versionFromLerna = true;
			}
		} else {
			// Load globs from package.json directly
			if (this._packageJson.workspaces instanceof Array) {
				this.workspaceGlobs = this._packageJson.workspaces;
			} else {
				this.workspaceGlobs = (this._packageJson.workspaces as any).packages;
			}
		}

		if (!versionFromLerna) {
			this.version = this._packageJson.version;
			logger.verbose(
				`${kind}: Loading version (${this._packageJson.version}) from ${packagePath}`,
			);
		}

		logger.verbose(`${kind}: Loading packages from ${packageManager}`);
		for (const pkgDir of packageDirs) {
			this.packages.push(Package.load(path.join(pkgDir, "package.json"), kind, this));
		}
		return;
	}

	public static isSame(a: MonoRepo | undefined, b: MonoRepo | undefined) {
		return a !== undefined && a === b;
	}

	public get installCommand(): string {
		return this.packageManager === "pnpm"
			? "pnpm i"
			: this.packageManager === "yarn"
			? "npm run install-strict"
			: "npm i --no-package-lock --no-shrinkwrap";
	}

	public get fluidBuildConfig(): IFluidBuildConfig | undefined {
		return this._packageJson.fluidBuild;
	}

	public getNodeModulePath() {
		return path.join(this.repoPath, "node_modules");
	}

	public async install() {
		this.logger.info(`${this.kind}: Installing - ${this.installCommand}`);
		return execWithErrorAsync(this.installCommand, { cwd: this.repoPath }, this.repoPath);
	}
	public async uninstall() {
		return rimrafWithErrorAsync(this.getNodeModulePath(), this.repoPath);
	}
}


export class Package {
	private static packageCount: number = 0;
	private static readonly chalkColor = [
		chalk.default.red,
		chalk.default.green,
		chalk.default.yellow,
		chalk.default.blue,
		chalk.default.magenta,
		chalk.default.cyan,
		chalk.default.white,
		chalk.default.grey,
		chalk.default.redBright,
		chalk.default.greenBright,
		chalk.default.yellowBright,
		chalk.default.blueBright,
		chalk.default.magentaBright,
		chalk.default.cyanBright,
		chalk.default.whiteBright,
	];

	private _packageJson: PackageJson;
	private readonly packageId = Package.packageCount++;
	private _matched: boolean = false;

	private _indent: string;
	public readonly packageManager: PackageManager;
	public get packageJson(): PackageJson {
		return this._packageJson;
	}

	/**
	 * Create a new package from a package.json file. Prefer the .load method to calling the contructor directly.
	 *
	 * @param packageJsonFileName - The path to a package.json file.
	 * @param group - A group that this package is a part of.
	 * @param monoRepo - Set this if the package is part of a release group (monorepo).
	 * @param additionalProperties - An object with additional properties that should be added to the class. This is
	 * useful to augment the package class with additional properties.
	 */
	constructor(
		public readonly packageJsonFileName: string,
		public readonly group: string,
		public readonly monoRepo?: MonoRepo,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		additionalProperties: any = {},
	) {
		[this._packageJson, this._indent] = readPackageJsonAndIndent(packageJsonFileName);
		const pnpmWorkspacePath = path.join(this.directory, "pnpm-workspace.yaml");
		const yarnLockPath = path.join(this.directory, "yarn.lock");
		this.packageManager = existsSync(pnpmWorkspacePath)
			? "pnpm"
			: existsSync(yarnLockPath)
			? "yarn"
			: "npm";
		verbose(`Package loaded: ${this.nameColored}`);
		Object.assign(this, additionalProperties);
	}

	/**
	 * The name of the package including the scope.
	 */
	public get name(): string {
		return this.packageJson.name;
	}

	/**
	 * The name of the package with a color for terminal output.
	 */
	public get nameColored(): string {
		return this.color(this.name);
	}

	/**
	 * The name of the package excluding the scope.
	 */
	public get nameUnscoped(): string {
		return PackageName.getUnscopedName(this.name);
	}

	/**
	 * The parsed package scope, including the \@-sign, or an empty string if there is no scope.
	 */
	public get scope(): string {
		return PackageName.getScope(this.name);
	}

	public get private(): boolean {
		return this.packageJson.private ?? false;
	}

	public get version(): string {
		return this.packageJson.version;
	}

	public get isPublished(): boolean {
		return !this.private;
	}

	public get isTestPackage(): boolean {
		return this.name.split("/")[1]?.startsWith("test-") === true;
	}

	public get matched() {
		return this._matched;
	}

	public setMatched() {
		this._matched = true;
	}

	public get dependencies() {
		return Object.keys(this.packageJson.dependencies ?? {});
	}

	public get combinedDependencies(): Generator<
		{
			name: string;
			version: string;
			dev: boolean;
		},
		void
	> {
		const it = function* (packageJson: PackageJson) {
			for (const item in packageJson.dependencies) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				yield { name: item, version: packageJson.dependencies[item]!, dev: false };
			}
			for (const item in packageJson.devDependencies) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				yield { name: item, version: packageJson.devDependencies[item]!, dev: true };
			}
		};
		return it(this.packageJson);
	}

	public get directory(): string {
		return path.dirname(this.packageJsonFileName);
	}

	/**
	 * Get the full path for the lock file.
	 * @returns full path for the lock file, or undefined if one doesn't exist
	 */
	public getLockFilePath() {
		const directory = this.monoRepo ? this.monoRepo.repoPath : this.directory;
		const lockFileNames = ["pnpm-lock.yaml", "yarn.lock", "package-lock.json"];
		for (const lockFileName of lockFileNames) {
			const full = path.join(directory, lockFileName);
			if (fs.existsSync(full)) {
				return full;
			}
		}
		return undefined;
	}

	public get installCommand(): string {
		return this.packageManager === "pnpm"
			? "pnpm i"
			: this.packageManager === "yarn"
			? "npm run install-strict"
			: "npm i";
	}

	private get color() {
		return Package.chalkColor[this.packageId % Package.chalkColor.length];
	}

	public getScript(name: string): string | undefined {
		return this.packageJson.scripts ? this.packageJson.scripts[name] : undefined;
	}

	public async cleanNodeModules() {
		return rimrafWithErrorAsync(path.join(this.directory, "node_modules"), this.nameColored);
	}

	public async savePackageJson() {
		writePackageJson(this.packageJsonFileName, this.packageJson, this._indent);
	}

	public reload() {
		this._packageJson = readJsonSync(this.packageJsonFileName);
	}

	public async noHoistInstall(repoRoot: string) {
		// Fluid specific
		const rootNpmRC = path.join(repoRoot, ".npmrc");
		const npmRC = path.join(this.directory, ".npmrc");

		await copyFileAsync(rootNpmRC, npmRC);
		const result = await execWithErrorAsync(
			`${this.installCommand} --no-package-lock --no-shrinkwrap`,
			{ cwd: this.directory },
			this.nameColored,
		);
		await unlinkAsync(npmRC);

		return result;
	}

	public async checkInstall(print: boolean = true) {
		if (this.combinedDependencies.next().done) {
			// No dependencies
			return true;
		}

		if (!existsSync(path.join(this.directory, "node_modules"))) {
			if (print) {
				error(`${this.nameColored}: node_modules not installed`);
			}
			return false;
		}
		let succeeded = true;
		for (const dep of this.combinedDependencies) {
			if (
				!lookUpDirSync(this.directory, (currentDir) => {
					// TODO: check semver as well
					return existsSync(path.join(currentDir, "node_modules", dep.name));
				})
			) {
				succeeded = false;
				if (print) {
					error(`${this.nameColored}: dependency ${dep.name} not found`);
				}
			}
		}
		return succeeded;
	}

	public async install() {
		if (this.monoRepo) {
			throw new Error("Package in a monorepo shouldn't be installed");
		}

		log(`${this.nameColored}: Installing - ${this.installCommand}`);
		return execWithErrorAsync(this.installCommand, { cwd: this.directory }, this.directory);
	}

	/**
	 * Load a package from a package.json file. Prefer this to calling the contructor directly.
	 *
	 * @param packageJsonFileName - The path to a package.json file.
	 * @param group - A group that this package is a part of.
	 * @param monoRepo - Set this if the package is part of a release group (monorepo).
	 * @param additionalProperties - An object with additional properties that should be added to the class. This is
	 * useful to augment the package class with additional properties.
	 */
	public static load<T extends typeof Package, TAddProps>(
		this: T,
		packageJsonFileName: string,
		group: string,
		monoRepo?: MonoRepo,
		additionalProperties?: TAddProps,
	) {
		return new this(
			packageJsonFileName,
			group,
			monoRepo,
			additionalProperties,
		) as InstanceType<T> & TAddProps;
	}

	/**
	 * Load a package from directory containing a package.json.
	 *
	 * @param packageDir - The path to a package.json file.
	 * @param group - A group that this package is a part of.
	 * @param monoRepo - Set this if the package is part of a release group (monorepo).
	 * @param additionalProperties - An object with additional properties that should be added to the class. This is
	 * useful to augment the package class with additional properties.
	 * @typeParam TAddProps - The type of the additional properties object.
	 * @returns a loaded Package. If additional properties are specifed, the returned type will be Package & TAddProps.
	 */
	public static loadDir<T extends typeof Package, TAddProps>(
		this: T,
		packageDir: string,
		group: string,
		monoRepo?: MonoRepo,
		additionalProperties?: TAddProps,
	) {
		return Package.load(
			path.join(packageDir, "package.json"),
			group,
			monoRepo,
			additionalProperties,
		) as InstanceType<T> & TAddProps;
	}
}
