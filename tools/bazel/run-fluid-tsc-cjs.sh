#!/usr/bin/env bash
# Wrapper for fluid-tsc commonjs compilation in Bazel
# Usage: run-fluid-tsc-cjs.sh <package-path> <tsconfig-file>

set -euo pipefail

PACKAGE_PATH="$1"
TSCONFIG_FILE="$2"

# Change to workspace root (BUILD_WORKSPACE_DIRECTORY is set by Bazel)
cd "${BUILD_WORKSPACE_DIRECTORY}"

# Run fluid-tsc commonjs with the specified tsconfig
cd "${PACKAGE_PATH}"
exec node ../../../node_modules/@fluidframework/build-tools/bin/fluid-tsc commonjs --project "${TSCONFIG_FILE}"
