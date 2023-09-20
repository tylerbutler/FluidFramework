/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * This library contains the interfaces and types concerning the `Loader` and loading the `Container`.
 *
 * @packageDocumentation
 */

export type { IAudience, IAudienceOwner } from "./audience";
export {
	type IFluidBrowserPackage,
	type IFluidBrowserPackageEnvironment,
	isFluidBrowserPackage,
} from "./browserPackage";
export type {
	IConnectionDetails,
	IDeltaManager,
	IDeltaManagerEvents,
	IDeltaQueue,
	IDeltaQueueEvents,
	IDeltaSender,
	ReadOnlyInfo,
} from "./deltas";
export {
	ContainerErrorTypes,
	ContainerErrorType,
	type ContainerWarning,
	type ICriticalContainerError,
} from "./error";
export type {
	ConnectionState,
	ICodeDetailsLoader,
	IContainer,
	IContainerEvents,
	IContainerLoadMode,
	IFluidCodeResolver,
	IFluidModuleWithDetails,
	IHostLoader,
	ILoader,
	ILoaderHeader,
	ILoaderOptions,
	IPendingLocalState,
	IProvideLoader,
	IResolvedFluidCodeDetails,
	ISnapshotTreeWithBlobContents,
} from "./loader";
export {
	LoaderHeader,
} from "./loader";
export type { IFluidModule } from "./fluidModule";
export {
	type IFluidPackage,
	type IFluidPackageEnvironment,
	type IFluidCodeDetails,
  IFluidCodeDetailsComparer,
	type IFluidCodeDetailsConfig,
	type IProvideFluidCodeDetailsComparer,
	isFluidPackage,
	isFluidCodeDetails,
} from "./fluidPackage";
export {
	AttachState,
	type IBatchMessage,
	type IContainerContext,
	type IProvideRuntimeFactory,
	type IRuntime,
	IRuntimeFactory,
} from "./runtime";

export type {
	/**
	 * @deprecated IErrorBase is being deprecated as a public export is moving to "core-interfaces".
	 */
	IErrorBase,
	/**
	 * @deprecated IGenericError is being deprecated as a public export is moving to "core-interfaces".
	 */
	IGenericError,
	/**
	 * @deprecated IThrottlingWarning is being deprecated as a public export is moving to "core-interfaces".
	 */
	IThrottlingWarning,
	/**
	 * @deprecated IUsageError is being deprecated as a public export is moving to "core-interfaces".
	 */
	IUsageError,
} from "@fluidframework/core-interfaces";
