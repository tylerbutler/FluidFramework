/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * This library defines the interfaces required to implement and/or communicate
 * with a data store.
 *
 * @packageDocumentation
 */

export type {
	IChannel,
	IChannelFactory,
	IChannelServices,
	IChannelStorageService,
	IDeltaConnection,
	IDeltaHandler,
} from "./channel";
export type { IFluidDataStoreRuntime, IFluidDataStoreRuntimeEvents } from "./dataStoreRuntime";
export type { Jsonable } from "./jsonable";
export type { Serializable } from "./serializable";
export type { IChannelAttributes } from "./storage";
