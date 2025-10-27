/**
 * BUILD File Generation Script
 * Generates BUILD.bazel files for FluidFramework packages
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, relative } from 'path';
import { glob } from 'glob';
import { loadPackageMap, type PackageMapping } from './package-mapper.js';

interface PackageInfo {
	name: string;
	path: string;
	dependencies: string[];
	hasTests: boolean;
	testFramework: 'mocha' | 'jest' | 'none';
}

/**
 * Generate BUILD.bazel file for a package
 * @param packagePath - Absolute path to the package directory
 * @param packageMapPath - Path to the package mapping JSON file
 */
async function generateBuildFile(packagePath: string, packageMapPath?: string): Promise<void> {
	const pkgJsonPath = join(packagePath, 'package.json');

	if (!existsSync(pkgJsonPath)) {
		throw new Error(`package.json not found at ${pkgJsonPath}`);
	}

	const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));

	// Load package map for dependency resolution
	const rootDir = findWorkspaceRoot(packagePath);
	const mapPath = packageMapPath || join(rootDir, 'bazel-migration/configs/package-map.json');
	let packageMap: Map<string, PackageMapping> | undefined;

	if (existsSync(mapPath)) {
		packageMap = loadPackageMap(mapPath);
	}

	const packageInfo: PackageInfo = {
		name: pkgJson.name,
		path: packagePath,
		dependencies: extractWorkspaceDeps(pkgJson),
		hasTests: await hasTestDirectory(packagePath),
		testFramework: detectTestFramework(pkgJson),
	};

	const buildContent = generateBuildContent(packageInfo, packageMap);
	const buildPath = join(packagePath, 'BUILD.bazel');
	writeFileSync(buildPath, buildContent);

	console.log(`✅ Generated BUILD.bazel for ${packageInfo.name}`);
	console.log(`   Path: ${buildPath}`);
	console.log(`   Dependencies: ${packageInfo.dependencies.length}`);
	console.log(`   Tests: ${packageInfo.testFramework}`);
}

/**
 * Extract workspace dependencies from package.json
 */
function extractWorkspaceDeps(pkgJson: any): string[] {
	const deps: string[] = [];
	for (const [name, version] of Object.entries(pkgJson.dependencies || {})) {
		if (typeof version === 'string' && version.startsWith('workspace:')) {
			deps.push(name);
		}
	}
	return deps;
}

/**
 * Check if package has test directory
 */
async function hasTestDirectory(packagePath: string): Promise<boolean> {
	const testFiles = await glob(join(packagePath, 'src/test/**/*.ts'));
	return testFiles.length > 0;
}

/**
 * Detect test framework used by the package
 */
function detectTestFramework(pkgJson: any): 'mocha' | 'jest' | 'none' {
	const scripts = pkgJson.scripts || {};
	const deps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };

	if (scripts['test:mocha'] || deps['mocha']) return 'mocha';
	if (scripts['test:jest'] || deps['jest']) return 'jest';
	return 'none';
}

/**
 * Convert package name to Bazel target
 */
function depNameToTarget(
	depName: string,
	moduleFormat: 'esm' | 'cjs',
	packageMap?: Map<string, PackageMapping>
): string {
	if (packageMap) {
		const mapping = packageMap.get(depName);
		if (mapping) {
			const safeName = depName.replace(/@/g, '').replace(/\//g, '_').replace(/-/g, '_');
			return `"${mapping.bazelTarget}_${moduleFormat}"`;
		}
	}

	// Fallback: external npm dependency
	const safeName = depName.replace(/@/g, '').replace(/\//g, '_').replace(/-/g, '_');
	return `"@npm//${depName}"`;
}

/**
 * Generate BUILD.bazel file content
 */
function generateBuildContent(info: PackageInfo, packageMap?: Map<string, PackageMapping>): string {
	const safeName = info.name.replace(/@/g, '').replace(/\//g, '_').replace(/-/g, '_');

	const esmDeps = info.dependencies
		.map((dep) => depNameToTarget(dep, 'esm', packageMap))
		.join(',\n        ');

	const cjsDeps = info.dependencies
		.map((dep) => depNameToTarget(dep, 'cjs', packageMap))
		.join(',\n        ');

	let content = `# BUILD.bazel for ${info.name}
# Auto-generated - see bazel-migration/scripts/generate-build-file.ts

load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
`;

	// Add test framework imports
	if (info.testFramework === 'mocha') {
		content += `load("@npm//:mocha/package_json.bzl", mocha_bin = "bin")\n`;
	}

	content += `
package(default_visibility = ["//visibility:public"])

# ESM compilation
ts_project(
    name = "${safeName}_esm",
    srcs = glob(
        ["src/**/*.ts"],
        exclude = ["src/test/**"],
    ),
    declaration = True,
    out_dir = "lib",
    root_dir = "src",
    tsconfig = ":tsconfig.json",
    deps = [
${esmDeps ? '        ' + esmDeps : ''}
    ],
)

# CommonJS compilation
ts_project(
    name = "${safeName}_cjs",
    srcs = glob(
        ["src/**/*.ts"],
        exclude = ["src/test/**"],
    ),
    declaration = True,
    out_dir = "dist",
    root_dir = "src",
    tsconfig = ":tsconfig.cjs.json",
    transpiler = "tsc",
    deps = [
${cjsDeps ? '        ' + cjsDeps : ''}
    ],
)
`;

	// Add test targets if tests exist
	if (info.hasTests) {
		content += generateTestTargets(info, safeName);
	}

	// Add default target (filegroup)
	content += `
# Default target builds both ESM and CJS
filegroup(
    name = "${safeName}",
    srcs = [
        ":${safeName}_esm",
        ":${safeName}_cjs",
    ],
)
`;

	return content;
}

/**
 * Generate test targets
 */
function generateTestTargets(info: PackageInfo, safeName: string): string {
	if (info.testFramework === 'mocha') {
		return `
# Test compilation
ts_project(
    name = "${safeName}_test",
    srcs = glob(["src/test/**/*.ts"]),
    declaration = False,
    out_dir = "lib/test",
    root_dir = "src",
    tsconfig = ":src/test/tsconfig.json",
    deps = [
        ":${safeName}_esm",
        "@npm//mocha",
        "@npm//@types/mocha",
    ],
)

# Mocha test runner
mocha_bin.mocha_test(
    name = "test",
    args = [
        "lib/test/**/*.spec.js",
        "--exit",
    ],
    data = [
        ":${safeName}_test",
    ],
)
`;
	}

	if (info.testFramework === 'jest') {
		return `
# Jest test compilation
ts_project(
    name = "${safeName}_test",
    srcs = glob(["src/test/**/*.ts"]),
    declaration = False,
    out_dir = "lib/test",
    root_dir = "src",
    tsconfig = ":src/test/tsconfig.json",
    deps = [
        ":${safeName}_esm",
        "@npm//jest",
        "@npm//@types/jest",
    ],
)

# Note: Jest test runner integration to be added
`;
	}

	return '';
}

/**
 * Find the workspace root by looking for WORKSPACE.bazel
 */
function findWorkspaceRoot(startPath: string): string {
	let currentPath = startPath;
	while (currentPath !== '/') {
		if (existsSync(join(currentPath, 'WORKSPACE.bazel'))) {
			return currentPath;
		}
		currentPath = join(currentPath, '..');
	}
	throw new Error('WORKSPACE.bazel not found - are you in a Bazel workspace?');
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
	const packagePath = process.argv[2];
	const packageMapPath = process.argv[3];

	if (!packagePath) {
		console.error('Usage: tsx generate-build-file.ts <package-path> [package-map-path]');
		console.error('');
		console.error('Example:');
		console.error('  tsx generate-build-file.ts packages/common/core-interfaces');
		process.exit(1);
	}

	generateBuildFile(packagePath, packageMapPath).catch((error) => {
		console.error('❌ Error generating BUILD file:', error.message);
		process.exit(1);
	});
}

export { generateBuildFile, type PackageInfo };
