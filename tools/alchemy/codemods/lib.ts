import type { ImportSpecifier, Transform } from "jscodeshift";

export const uberMap: Map<string, string[]> = new Map([
    ["@fluid-experimental/fluid-framework", [
        "@fluid-experimental/fluid-static",
        "@fluidframework/cell",
        "@fluidframework/map",
        "@fluidframework/sequence",
    ]],
]);
export const uberPackages = [...uberMap.keys()];

export const pkgMap: Map<string, string[]> = new Map([
    ["@fluidframework/cell", [
        "ISharedCell",
        "ISharedCellEvents",
        "SharedCell",
    ]],
    ["@fluidframework/map", [
        "DirectoryFactory",
        "IDirectory",
        "IDirectoryDataObject",
        "IDirectoryEvents",
        "IDirectoryNewStorageFormat",
        "IDirectoryValueChanged",
        "ISerializableValue",
        "ISerializedValue",
        "ISharedDirectory",
        "ISharedDirectoryEvents",
        "ISharedMap",
        "ISharedMapEvents",
        "IValueChanged",
        "MapFactory",
        "SharedDirectory",
        "SharedMap",
    ]],
    ["@fluidframework/common-definitions", [
        "ExtendEventProvider",
        "IDisposable",
        "IErrorEvent",
        "IEventProvider",
        "IEvent",
        "IEventTransformer",
        "IEventThisPlaceHolder",
        "ILoggingError",
        "ITaggedTelemetryPropertyType",
        "ITelemetryBaseEvent",
        "ITelemetryBaseLogger",
        "ITelemetryErrorEvent",
        "ITelemetryGenericEvent",
        "ITelemetryLogger",
        "ITelemetryPerformanceEvent",
        "ITelemetryProperties",
        "ReplaceIEventThisPlaceHolder",
        "TelemetryEventCategory",
        "TelemetryEventPropertyType",
        "TransformedEvent",
    ]]
]);

export const pkgMapReverse = new Map<string, string>();
export const allExports: string[] = [];

pkgMap.forEach((value, key) => {
    allExports.push(...value);
    for (const xport of value) {
        pkgMapReverse.set(xport, key);
    }
});
