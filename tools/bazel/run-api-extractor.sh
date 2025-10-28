#!/usr/bin/env bash
# Wrapper script for running API Extractor from the workspace root
# This script is invoked by Bazel and uses BUILD_WORKSPACE_DIRECTORY

set -euo pipefail

# When running with Bazel, BUILD_WORKSPACE_DIRECTORY is set to workspace root
if [ -z "${BUILD_WORKSPACE_DIRECTORY:-}" ]; then
    echo "ERROR: BUILD_WORKSPACE_DIRECTORY not set. This script must be run via Bazel."
    exit 1
fi

cd "$BUILD_WORKSPACE_DIRECTORY"

# Get package path from first argument
PACKAGE_PATH="${1:-}"
if [ -z "$PACKAGE_PATH" ]; then
    echo "ERROR: Package path not provided"
    exit 1
fi

# Get config file from second argument
CONFIG_FILE="${2:-api-extractor.json}"

echo "Running API Extractor for $PACKAGE_PATH (config: $CONFIG_FILE)"

# Change to package directory
cd "$PACKAGE_PATH"

# Run API Extractor directly (not through npm script to avoid double "run")
exec ../../../node_modules/.bin/api-extractor run --local --config "$CONFIG_FILE"
