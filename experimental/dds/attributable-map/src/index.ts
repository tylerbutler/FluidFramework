/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * The `map` library provides interfaces and implementing classes for map-like distributed data structures.
 *
 * @remarks The following distributed data structures are defined in this library:
 *
 * - {@link AttributableMap}
 *
 * @packageDocumentation
 */

export type {
	ISerializableValue,
	ISerializedValue,
	ISharedMap,
	ISharedMapEvents,
	IValueChanged,
} from "./interfaces";
export { LocalValueMaker, type ILocalValue } from "./localValues";
export { MapFactory, AttributableMap } from "./map";
