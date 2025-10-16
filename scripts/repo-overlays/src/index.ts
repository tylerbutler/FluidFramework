/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

#!/usr/bin/env node
/**
 * Nx Overlay Script
 *
 * This script applies the nx build system configuration to the FluidFramework repository.
 * It can be run multiple times as the repository evolves - it will only apply changes that
 * haven't been applied yet.
 *
 * Usage:
 *   pnpm tsx scripts/repo-overlays/src/index.ts [options]
 *
 * Options:
 *   --dry-run    Show what would be changed without making changes
 *   --help       Show this help message
 */

import { Command } from "commander";
import * as path from "node:path";
import { copyNxConfigFiles, isNxConfigured } from "./config-files.js";
import {
	updateRootPackageJson,
	updatePackageJsonFiles,
	needsPackageJsonUpdates,
} from "./package-json.js";
import { updateGitignore, needsGitignoreUpdate } from "./gitignore.js";

interface OverlayOptions {
	dryRun: boolean;
}

async function main(): Promise<void> {
	const program = new Command();

	program
		.name("apply-nx-overlay")
		.description("Apply nx build system configuration to the repository")
		.version("1.0.0")
		.option("--dry-run", "Show what would be changed without making changes", false)
		.option("-h, --help", "Display help information");

	program.parse(process.argv);

	const options = program.opts<OverlayOptions>();

	// Repo root is two levels up from this script
	const repoRoot = path.resolve(__dirname, "../../..");

	console.log("🚀 Nx Overlay Script");
	console.log(`📁 Repository root: ${repoRoot}`);
	console.log("");

	if (options.dryRun) {
		console.log("🔍 DRY RUN MODE - No changes will be made\n");
		await performDryRun(repoRoot);
	} else {
		await applyOverlay(repoRoot);
	}

	console.log("\n✨ Done!");
}

/**
 * Perform a dry run to show what would be changed
 */
async function performDryRun(repoRoot: string): Promise<void> {
	console.log("Checking what changes would be made...\n");

	const checks = [
		{
			name: "nx.json configuration",
			check: async () => !(await isNxConfigured(repoRoot)),
		},
		{
			name: "Root package.json updates",
			check: async () => await needsPackageJsonUpdates(repoRoot),
		},
		{
			name: ".gitignore updates",
			check: async () => await needsGitignoreUpdate(repoRoot),
		},
	];

	let changesNeeded = false;

	for (const { name, check } of checks) {
		const needsChange = await check();
		if (needsChange) {
			console.log(`  ⚠️  ${name} - NEEDS UPDATE`);
			changesNeeded = true;
		} else {
			console.log(`  ✅ ${name} - Already applied`);
		}
	}

	console.log(
		"\n📦 Package.json files - Would scan and update files with fluidBuild sections",
	);

	if (changesNeeded) {
		console.log("\n💡 Run without --dry-run to apply these changes");
		console.log("💡 After applying, run: pnpm install");
	} else {
		console.log("\n✨ All nx configuration is already applied!");
	}
}

/**
 * Apply the overlay changes to the repository
 */
async function applyOverlay(repoRoot: string): Promise<void> {
	console.log("Applying nx overlay...\n");

	try {
		// Step 1: Copy nx configuration files
		await copyNxConfigFiles(repoRoot);
		console.log("");

		// Step 2: Update root package.json
		await updateRootPackageJson(repoRoot);
		console.log("");

		// Step 3: Update .gitignore
		await updateGitignore(repoRoot);
		console.log("");

		// Step 4: Update package.json files
		await updatePackageJsonFiles(repoRoot);
		console.log("");

		console.log("✅ Nx overlay applied successfully!");
		console.log("");
		console.log("Next steps:");
		console.log("  1. Run: pnpm install");
		console.log("  2. Test the build: nx run-many -t build");
		console.log("  3. Commit the changes");
	} catch (error) {
		console.error("\n❌ Error applying overlay:", error);
		process.exit(1);
	}
}

// Run the main function
main().catch((error) => {
	console.error("Fatal error:", error);
	process.exit(1);
});
