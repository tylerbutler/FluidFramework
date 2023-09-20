/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

export {
	BaseProxifiedProperty,
	type CollectionTypes,
	type GenericProxify,
	type PrimitiveTypes,
	type PropertyTypes,
	ProxifiedArrayProperty,
	ProxifiedMapProperty,
	ProxifiedPropertyValueArray,
	ProxifiedSetProperty,
	type ProxyType,
	type ReferenceType,
} from "./interfaces";
export type { IParentAndPathOfReferencedProperty } from "./IParentAndPathOfReferencedProperty";
export { PropertyProxy, proxySymbol } from "./propertyProxy";
