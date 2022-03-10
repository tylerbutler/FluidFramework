/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { IChannelFactory } from "@fluidframework/datastore-definitions";
import { NamedFluidDataStoreRegistryEntry } from "@fluidframework/runtime-definitions";
import {
    ContainerSchema,
    DataObjectClass,
    LoadableObjectClass,
    SharedObjectClass,
} from "./types";

/**
 * Runtime check to determine if a class is a DataObject type
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const isDataObjectClass = (obj: any): obj is DataObjectClass<any> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return obj?.factory !== undefined;
};

/**
 * Runtime check to determine if a class is a SharedObject type
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const isSharedObjectClass = (obj: any): obj is SharedObjectClass<any> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return obj?.getFactory !== undefined;
};

/**
 * The ContainerSchema consists of initialObjects and dynamicObjectTypes. These types can be
 * of both SharedObject or DataObject. This function seperates the two and returns a registery
 * of DataObject types and an array of SharedObjects.
 */
export const parseDataObjectsFromSharedObjects = (schema: ContainerSchema):
    [NamedFluidDataStoreRegistryEntry[], IChannelFactory[]] => {
    const registryEntries: Set<NamedFluidDataStoreRegistryEntry> = new Set();
    const sharedObjects: Set<IChannelFactory> = new Set();

    const tryAddObject = (obj: LoadableObjectClass<any>): void => {
        if (isSharedObjectClass(obj)) {
            sharedObjects.add(obj.getFactory());
        } else if (isDataObjectClass(obj)) {
            registryEntries.add([obj.factory.type, Promise.resolve(obj.factory)]);
        } else {
            throw new Error(`Entry is neither a DataObject or a SharedObject`);
        }
    };

    // Add the object types that will be initialized
    for (const obj of Object.values(schema.initialObjects)) {
        tryAddObject(obj);
    }

    // If there are dynamic object types we will add them now
    if (schema.dynamicObjectTypes) {
        for (const obj of schema.dynamicObjectTypes) {
            tryAddObject(obj);
        }
    }

    if (registryEntries.size === 0 && sharedObjects.size === 0) {
        throw new Error("Container cannot be initialized without any DataTypes");
    }

    return [[...registryEntries], [...sharedObjects]];
};
