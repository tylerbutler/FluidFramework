/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
export { mochaGlobalSetup } from "./compatConfig.js";
export {
	getDataStoreFactory,
	getVersionedTestObjectProvider,
	getVersionedTestObjectProviderFromApis,
	type ITestDataObject,
	TestDataObjectType,
} from "./compatUtils.js";
export { describeInstallVersions } from "./describeWithVersions.js";
export {
	type DescribeCompat,
	type DescribeCompatSuite,
	describeFullCompat,
	describeLoaderCompat,
	describeNoCompat,
	type ITestObjectProviderOptions,
} from "./describeCompat.js";
export {
	describeE2EDocs,
	type DocumentType,
	type DocumentTypeInfo,
	type DescribeE2EDocInfo,
	type BenchmarkType,
	describeE2EDocsMemory,
	describeE2EDocsRuntime,
	describeE2EDocRun,
	getCurrentBenchmarkType,
	isMemoryTest,
	type DocumentMapInfo,
	type DocumentMultipleDataStoresInfo,
	type DocumentMatrixInfo,
	type DocumentMatrixPlainInfo,
	assertDocumentTypeInfo,
	isDocumentMapInfo,
	isDocumentMultipleDataStoresInfo,
	isDocumentMatrixInfo,
	isDocumentMatrixPlainInfo,
} from "./describeE2eDocs.js";
export { type ExpectedEvents, type ExpectsTest, itExpects } from "./itExpects.js";
export {
	type CompatApis,
	ensurePackageInstalled,
	getContainerRuntimeApi,
	getDataRuntimeApi,
	getDriverApi,
	getLoaderApi,
} from "./testApi.js";
export {
	itExpectsSkipsFailureOnSpecificDrivers,
	itSkipsFailureOnSpecificDrivers,
} from "./itSkipsOnFailure.js";
