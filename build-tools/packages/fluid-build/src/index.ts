/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

export { GitRepo } from "./common/gitRepo";
export { FluidRepo } from "./fluidBuild/fluidRepo";
export { type IFluidBuildConfig } from "./fluidBuild/fluidBuildConfig";
export { getResolvedFluidRoot, getFluidBuildConfig } from "./fluidBuild/fluidUtils";
export { MonoRepo } from "./common/monoRepo";
export {
	Package,
	type PackageJson,
	updatePackageJsonFile,
	updatePackageJsonFileAsync,
} from "./common/npmPackage";

// For repo policy check
export {
	normalizeGlobalTaskDefinitions,
	getTaskDefinitions,
} from "./fluidBuild/fluidTaskDefinitions";
export {
	getApiExtractorConfigFilePath,
	getEsLintConfigFilePath,
} from "./fluidBuild/tasks/taskUtils";
export * as TscUtils from "./fluidBuild/tscUtils";
