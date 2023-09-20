/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
export {
	createChildMonitoringContext,
	type MonitoringContext,
	type IConfigProviderBase,
	sessionStorageConfigProvider,
	mixinMonitoringContext,
	type IConfigProvider,
	type ConfigTypes,
	loggerToMonitoringContext,
} from "./config";
export {
	DataCorruptionError,
	DataProcessingError,
	extractSafePropertiesFromMessage,
	GenericError,
	UsageError,
} from "./error";
export {
	extractLogSafeErrorProperties,
	generateErrorWithStack,
	generateStack,
	getCircularReplacer,
	type IFluidErrorAnnotations,
	isExternalError,
	isILoggingError,
	isTaggedTelemetryPropertyValue,
	LoggingError,
	NORMALIZED_ERROR_TYPE,
	normalizeError,
	overwriteStack,
	wrapError,
	wrapErrorAndLog,
} from "./errorLogging";
export { EventEmitterWithErrorHandling } from "./eventEmitterWithErrorHandling";
export {
	connectedEventName,
	disconnectedEventName,
	raiseConnectedEvent,
	safeRaiseEvent,
} from "./events";
export {
	hasErrorInstanceId,
	type IFluidErrorBase,
	isFluidError,
	isValidLegacyError,
} from "./fluidErrorBase";
export {
	eventNamespaceSeparator,
	createChildLogger,
	createMultiSinkLogger,
	formatTick,
	type IPerformanceEventMarkers,
	type ITelemetryLoggerPropertyBag,
	type ITelemetryLoggerPropertyBags,
	numberFromString,
	PerformanceEvent,
	TaggedLoggerAdapter,
	tagData,
	tagCodeArtifacts,
	TelemetryDataTag,
	type TelemetryEventPropertyTypes,
	TelemetryNullLogger,
} from "./logger";
export { MockLogger } from "./mockLogger";
export { ThresholdCounter } from "./thresholdCounter";
export { SampledTelemetryHelper } from "./sampledTelemetryHelper";
export { logIfFalse } from "./utils";
export type {
	TelemetryEventPropertyTypeExt,
	ITelemetryEventExt,
	ITelemetryGenericEventExt,
	ITelemetryErrorEventExt,
	ITelemetryPerformanceEventExt,
	ITelemetryLoggerExt,
	ITaggedTelemetryPropertyTypeExt,
	ITelemetryPropertiesExt,
	TelemetryEventCategory,
} from "./telemetryTypes";
