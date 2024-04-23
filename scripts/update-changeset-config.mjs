import fs from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = join(__dirname, "../.changeset/config.json");
const configFile = fs.readFileSync(filePath, "utf8");
const config = JSON.parse(configFile);

// Update the config object with the new data.
const fixed = [
	// Azure-Service
	[
		"@fluidframework/azure-end-to-end-tests",
		"@fluidframework/azure-local-service",
		"@fluidframework/azure-service-utils",
	],

	// Datastore
	["@fluidframework/datastore", "@fluidframework/datastore-definitions"],

	// Devtools
	[
		"@fluid-example/devtools-example",
		"@fluidframework/devtools",
		"@fluidframework/devtools-core",
		"@fluid-internal/devtools-browser-extension",
		"@fluid-internal/devtools-view",
	],

	// Driver
	[
		"@fluidframework/debugger",
		"@fluidframework/driver-base",
		"@fluidframework/driver-web-cache",
		"@fluidframework/file-driver",
		"@fluidframework/odsp-driver",
		"@fluidframework/odsp-urlresolver",
		"@fluidframework/replay-driver",
	],

	// Driver-Definitions
	["@fluidframework/driver-definitions", "@fluidframework/odsp-driver-definitions"],

	// Experimental-DataObjects
	["@fluid-experimental/data-object-base", "@fluid-experimental/data-objects"],

	// Framework
	[
		"@fluidframework/agent-scheduler",
		"@fluidframework/aqueduct",
		"@fluidframework/fluid-static",
		"@fluidframework/request-handler",
	],

	// Loader
	["@fluidframework/container-loader", "@fluid-private/test-loader-utils"],

	// PropertyDDS
	[
		"@fluid-experimental/property-binder",
		"@fluid-experimental/property-changeset",
		"@fluid-experimental/property-common",
		"@fluid-experimental/property-dds",
		"@fluid-experimental/property-inspector-table",
		"@fluid-experimental/property-properties",
		"@fluid-experimental/property-proxy",
		"@fluid-experimental/property-query",
		"@fluid-experimental/property-shared-tree-interop",
		"@fluid-internal/platform-dependent",
	],

	// Routerlicious-Driver
	[
		"@fluidframework/routerlicious-driver",
		"@fluidframework/routerlicious-urlresolver",
		"@fluidframework/tinylicious-driver",
	],

	// Runtime
	[
		"@fluidframework/container-runtime",
		"@fluidframework/container-runtime-definitions",
		"@fluidframework/runtime-definitions",
		"@fluidframework/runtime-utils",
		"@fluidframework/shared-object-base",
		"@fluidframework/shared-summary-block",
	],

	// Sequence
	["@fluidframework/merge-tree", "@fluidframework/sequence"],

	// Telemetry
	["@fluidframework/app-insights-logger", "@fluidframework/fluid-telemetry"],
];

const linked = [
	// Examples
	[
		"@fluid-example/app-insights-logger",
		"@fluid-example/app-integration-container-views",
		"@fluid-example/app-integration-external-controller",
		"@fluid-example/app-integration-external-data",
		"@fluid-example/app-integration-external-views",
		"@fluid-example/app-integration-live-schema-upgrade",
		"@fluid-example/app-integration-schema-upgrade",
		"@fluid-example/attributable-map",
		"@fluid-example/bubblebench-baseline",
		"@fluid-example/bubblebench-common",
		"@fluid-example/bubblebench-experimental-tree",
		"@fluid-example/bubblebench-ot",
		"@fluid-example/bubblebench-shared-tree",
		"@fluid-example/bubblebench-shared-tree-flex-tree",
		"@fluid-example/bundle-size-tests",
		"@fluid-example/canvas",
		"@fluid-example/clicker",
		"@fluid-example/codemirror",
		"@fluid-example/collaborative-textarea",
		"@fluid-example/contact-collection",
		"@fluid-example/data-object-grid",
		"@fluid-example/diceroller",
		"@fluid-example/example-utils",
		"@fluid-example/inventory-app",
		"@fluid-example/monaco",
		"@fluid-example/multiview-constellation-model",
		"@fluid-example/multiview-constellation-view",
		"@fluid-example/multiview-container",
		"@fluid-example/multiview-coordinate-interface",
		"@fluid-example/multiview-coordinate-model",
		"@fluid-example/multiview-plot-coordinate-view",
		"@fluid-example/multiview-slider-coordinate-view",
		"@fluid-example/multiview-triangle-view",
		"@fluid-example/odspsnapshotfetch-perftestapp",
		"@fluid-example/presence-tracker",
		"@fluid-example/property-inspector",
		"@fluid-example/prosemirror",
		"@fluid-example/schemas",
		"@fluid-example/shared-tree-demo",
		"@fluid-example/smde",
		"@fluid-example/table-document",
		"@fluid-example/task-selection",
		"@fluid-example/todo",
		"@fluid-example/tree-comparison",
		"@fluid-example/tree-shim",
		"@fluid-example/version-migration-same-container",
		"@fluid-example/view-framework-sampler",
		"@fluid-example/webflow",
		"@fluid-example/webpack-fluid-loader",
		"@fluid-internal/tablebench",
	],

	//Tests
	[
		"@fluid-experimental/azure-scenario-runner",
		"@fluid-experimental/odsp-end-to-end-tests",
		"@fluidframework/test-utils",
		"@fluid-internal/functional-tests",
		"@fluid-internal/local-server-tests",
		"@fluid-internal/mocha-test-setup",
		"@fluid-internal/test-app-insights-logger",
		"@fluid-internal/test-driver-definitions",
		"@fluid-internal/test-service-load",
		"@fluid-internal/test-snapshots",
		"@fluid-private/stochastic-test-utils",
		"@fluid-private/test-dds-utils",
		"@fluid-private/test-drivers",
		"@fluid-private/test-end-to-end-tests",
		"@fluid-private/test-pairwise-generator",
		"@fluid-private/test-version-utils",
		"@types/jest-environment-puppeteer",
	],
];

config.fixed = fixed;
config.linked = linked;
config.updateInternalDependencies = "minor";
fs.writeFileSync(filePath, JSON.stringify(config, null, "\t"));

/*
// Standalone packages

@fluid-experimental/attributable-map
@fluid-experimental/attributor
@fluid-experimental/dds-interceptions
@fluid-experimental/ink
@fluid-experimental/last-edited
@fluid-experimental/odsp-client
@fluid-experimental/oldest-client-observer
@fluid-experimental/ot
@fluid-experimental/pact-map
@fluid-experimental/sequence-deprecated
@fluid-experimental/sharejs-json1
@fluid-experimental/tree
@fluidframework/azure-client
@fluidframework/cell
@fluidframework/common-utils
@fluidframework/container-definitions
@fluidframework/core-interfaces
@fluidframework/core-utils
@fluidframework/counter
@fluidframework/driver-utils
@fluidframework/fluid-runner
@fluidframework/id-compressor
@fluidframework/local-driver
@fluidframework/map
@fluidframework/matrix
@fluidframework/odsp-doclib-utils
@fluidframework/ordered-collection
@fluidframework/protocol-definitions
@fluidframework/register-collection
@fluidframework/synthesize
@fluidframework/task-manager
@fluidframework/telemetry-utils
@fluidframework/test-runtime-utils
@fluidframework/test-tools
@fluidframework/tinylicious-client
@fluidframework/tool-utils
@fluidframework/tree
@fluidframework/undo-redo
@fluid-internal/client-utils
@fluid-internal/replay-tool
@fluid-tools/fetch-tool
fluid-framework
*/
