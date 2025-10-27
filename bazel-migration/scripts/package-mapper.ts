/**
 * Package Mapper Utility
 * Maps npm package names to Bazel targets
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';

export interface PackageMapping {
	name: string;
	path: string;
	bazelTarget: string;
}

/**
 * Build a map of all workspace packages
 * @param rootDir - The workspace root directory
 * @returns Map of package name to mapping info
 */
export async function buildPackageMap(rootDir: string): Promise<Map<string, PackageMapping>> {
	const packageJsonPaths = await glob(join(rootDir, 'packages/**/package.json'), {
		ignore: [
			'**/node_modules/**',
			'**/dist/**',
			'**/lib/**',
			'**/src/cjs/**',  // Exclude CJS stub package.json files
		],
	});

	const map = new Map<string, PackageMapping>();

	for (const pkgPath of packageJsonPaths) {
		const pkgJson = JSON.parse(readFileSync(pkgPath, 'utf-8'));
		const packageDir = pkgPath.replace('/package.json', '');
		const relativePath = packageDir.replace(rootDir + '/', '');

		// Convert package name to safe Bazel target name
		// @fluidframework/core-interfaces -> fluidframework_core_interfaces
		const safeName = pkgJson.name.replace(/@/g, '').replace(/\//g, '_').replace(/-/g, '_');

		map.set(pkgJson.name, {
			name: pkgJson.name,
			path: relativePath,
			bazelTarget: `//${relativePath}:${safeName}`,
		});
	}

	return map;
}

/**
 * Save the package map to a JSON file
 * @param map - The package mapping to save
 * @param outputPath - Path to write the JSON file
 */
export function savePackageMap(map: Map<string, PackageMapping>, outputPath: string): void {
	const obj = Object.fromEntries(map);
	writeFileSync(outputPath, JSON.stringify(obj, null, 2));
}

/**
 * Load a package map from a JSON file
 * @param inputPath - Path to the JSON file
 * @returns Map of package name to mapping info
 */
export function loadPackageMap(inputPath: string): Map<string, PackageMapping> {
	const obj = JSON.parse(readFileSync(inputPath, 'utf-8'));
	return new Map(Object.entries(obj));
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
	const rootDir = process.argv[2] || process.cwd();
	const outputPath = process.argv[3] || join(rootDir, 'bazel-migration/configs/package-map.json');

	buildPackageMap(rootDir).then((map) => {
		savePackageMap(map, outputPath);
		console.log(`✅ Generated package map with ${map.size} packages`);
		console.log(`   Output: ${outputPath}`);
	}).catch(console.error);
}
