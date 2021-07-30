export const uberPackageToPackages: Map<string, string[]> = new Map([
    ["@fluid-experimental/fluid-framework", [
        "@fluid-experimental/fluid-static",
        "@fluidframework/cell",
        "@fluidframework/map",
        "@fluidframework/sequence",
    ]],
]);

export const packagesToUberPackage = new Map<string, string>();
uberPackageToPackages.forEach((innerPackages, uberPackage) => {
    for (const innerPackage of innerPackages) {
        packagesToUberPackage.set(innerPackage, uberPackage);
    }
})

export const packagesToSpecifiers: Map<string, string[]> = new Map([
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

export const specifiersToPackages = new Map<string, string>();
packagesToSpecifiers.forEach((specifiers, pkg) => {
    for (const specifier of specifiers) {
        specifiersToPackages.set(specifier, pkg);
    }
});

export const specifiersToUberPackage = new Map<string, string>();
packagesToSpecifiers.forEach((specifiers, pkg) => {
    for (const specifier of specifiers) {
        specifiersToUberPackage.set(specifier, packagesToUberPackage.get(pkg));
    }
});
