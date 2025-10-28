#!/usr/bin/env bash
# Create a new BUILD.bazel file for a package following best practices
# Including package.json in srcs for proper TypeScript module detection

set -euo pipefail

PACKAGE_DIR="${1:?Usage: $0 <package-dir>}"

if [[ ! -f "$PACKAGE_DIR/package.json" ]]; then
    echo "Error: No package.json found in $PACKAGE_DIR"
    exit 1
fi

# Extract package name from package.json
PACKAGE_NAME=$(jq -r '.name' "$PACKAGE_DIR/package.json")
# Convert to safe Bazel target name
SAFE_NAME=$(echo "$PACKAGE_NAME" | sed 's/@[^/]*\///g' | sed 's/-/_/g')

echo "Creating BUILD.bazel for $PACKAGE_NAME in $PACKAGE_DIR"

# Analyze dependencies
DEPS_ESM=""
DEPS_CJS=""

# Extract dependencies from package.json
DEPENDENCIES=$(jq -r '.dependencies | to_entries[] | .key' "$PACKAGE_DIR/package.json" 2>/dev/null || echo "")

for dep in $DEPENDENCIES; do
    # Check if it's a workspace dependency
    if [[ "$dep" == @fluidframework/* ]] || [[ "$dep" == @fluid-internal/* ]] || [[ "$dep" == @fluid-private/* ]]; then
        DEP_PATH=$(echo "$dep" | sed 's/@[^/]*\///g' | sed 's/-/_/g')

        # Try to find the package location
        FOUND_PATH=""
        for category in common loader drivers utils runtime dds framework; do
            for subdir in $(ls -d "packages/$category/"*/ 2>/dev/null || true); do
                if [[ -f "$subdir/package.json" ]]; then
                    PKG_NAME=$(jq -r '.name' "$subdir/package.json")
                    if [[ "$PKG_NAME" == "$dep" ]]; then
                        FOUND_PATH="//$(dirname "$subdir")/$(basename "$subdir")"
                        break 2
                    fi
                fi
            done
        done

        if [[ -n "$FOUND_PATH" ]]; then
            DEPS_ESM="$DEPS_ESM        \"${FOUND_PATH}:${DEP_PATH}_esm\",\n"
            DEPS_CJS="$DEPS_CJS        \"${FOUND_PATH}:${DEP_PATH}_cjs\",\n"
        else
            DEPS_ESM="$DEPS_ESM        \":node_modules/$dep\",\n"
            DEPS_CJS="$DEPS_CJS        \":node_modules/$dep\",\n"
        fi
    else
        # External npm dependency
        DEPS_ESM="$DEPS_ESM        \":node_modules/$dep\",\n"
        DEPS_CJS="$DEPS_CJS        \":node_modules/$dep\",\n"
    fi
done

# Create BUILD.bazel with best practices including package.json
cat > "$PACKAGE_DIR/BUILD.bazel" << EOF
# BUILD.bazel for $PACKAGE_NAME
# Generated with package.json included in srcs for proper TypeScript module detection

load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
load("@aspect_rules_js//js:defs.bzl", "js_library")
load("@aspect_rules_js//npm:defs.bzl", "npm_package")
load("@npm//:defs.bzl", "npm_link_all_packages")

package(default_visibility = ["//visibility:public"])

# Link npm packages for this workspace package
npm_link_all_packages(name = "node_modules")

# ESM compilation
ts_project(
    name = "${SAFE_NAME}_esm",
    srcs = glob(
        ["src/**/*.ts"],
        exclude = ["src/test/**"],
    ) + ["package.json"],  # Include package.json so TypeScript sees the "type": "module"
    declaration = True,
    declaration_map = True,
    source_map = True,
    composite = True,
    incremental = True,
    out_dir = "lib",
    root_dir = "src",
    tsconfig = ":tsconfig.bazel.json",
    deps = [
$(echo -e "$DEPS_ESM" | sed '$ s/,$//')
    ],
)

# CommonJS compilation
ts_project(
    name = "${SAFE_NAME}_cjs",
    srcs = glob(
        ["src/**/*.ts"],
        exclude = ["src/test/**"],
    ) + ["package.json"],  # Include package.json for consistent behavior
    declaration = True,
    declaration_map = True,
    source_map = True,
    composite = True,
    incremental = True,
    out_dir = "dist",
    root_dir = "src",
    tsconfig = ":tsconfig.cjs.bazel.json",
    deps = [
$(echo -e "$DEPS_CJS" | sed '$ s/,$//')
    ],
)

# js_library wrapping compiled outputs
# Provides JsInfo for npm_package and includes package.json with exports field
js_library(
    name = "lib",
    srcs = [
        ":${SAFE_NAME}_esm",
        ":${SAFE_NAME}_cjs",
        "package.json",
    ],
)

# npm_package makes this linkable via npm_link_all_packages
# This enables TypeScript to resolve subpath exports (/internal, /legacy, etc.)
npm_package(
    name = "pkg",
    srcs = [":lib"],
    package = "$PACKAGE_NAME",
    visibility = ["//visibility:public"],
)

# Legacy filegroup for backward compatibility
filegroup(
    name = "${SAFE_NAME}",
    srcs = [
        ":${SAFE_NAME}_esm",
        ":${SAFE_NAME}_cjs",
    ],
)
EOF

echo "  ✓ Created BUILD.bazel with package.json included in srcs"

# Create tsconfig.bazel.json if it doesn't exist
if [[ ! -f "$PACKAGE_DIR/tsconfig.bazel.json" ]]; then
    echo "  Creating tsconfig.bazel.json..."
    cat > "$PACKAGE_DIR/tsconfig.bazel.json" << 'EOF'
{
	"compilerOptions": {
		"composite": true,
		"declaration": true,
		"declarationMap": true,
		"esModuleInterop": true,
		"incremental": true,
		"inlineSources": true,
		"jsx": "react",
		"lib": ["ES2020", "DOM", "DOM.Iterable"],
		"module": "Node16",
		"moduleResolution": "Node16",
		"noImplicitAny": false,
		"noUnusedLocals": true,
		"pretty": true,
		"sourceMap": true,
		"strict": true,
		"target": "ES2021",
		"types": [],
		"rootDir": "./src",
		"outDir": "./lib"
	},
	"include": ["src/**/*"],
	"exclude": ["src/test/**/*"]
}
EOF
    echo "  ✓ Created tsconfig.bazel.json"
fi

# Create tsconfig.cjs.bazel.json if it doesn't exist
if [[ ! -f "$PACKAGE_DIR/tsconfig.cjs.bazel.json" ]]; then
    echo "  Creating tsconfig.cjs.bazel.json..."
    cat > "$PACKAGE_DIR/tsconfig.cjs.bazel.json" << 'EOF'
{
	"compilerOptions": {
		"composite": true,
		"declaration": true,
		"declarationMap": true,
		"esModuleInterop": true,
		"incremental": true,
		"inlineSources": true,
		"jsx": "react",
		"lib": ["ES2020", "DOM", "DOM.Iterable"],
		"module": "Node16",
		"moduleResolution": "Node16",
		"noImplicitAny": false,
		"noUnusedLocals": true,
		"pretty": true,
		"sourceMap": true,
		"strict": true,
		"target": "ES2021",
		"types": [],
		"rootDir": "./src",
		"outDir": "./dist"
	},
	"include": ["src/**/*"],
	"exclude": ["src/test/**/*"]
}
EOF
    echo "  ✓ Created tsconfig.cjs.bazel.json"
fi

echo "  ✓ Package ready for Bazel build!"
echo ""
echo "Next steps:"
echo "  1. Review and adjust compiler options in tsconfig files if needed"
echo "  2. Test with: bazel build //${PACKAGE_DIR#./}:pkg"