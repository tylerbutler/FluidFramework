#!/usr/bin/env bash
# Wrapper script for running flub generate entrypoints from the workspace root
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

# Get output directory from second argument (lib or dist)
OUT_DIR="${2:-lib}"

echo "Generating entrypoints for $PACKAGE_PATH (output: $OUT_DIR)"

# Change to package directory
cd "$PACKAGE_PATH"

# Run flub generate entrypoints
exec pnpm flub generate entrypoints \
    --outFileLegacyBeta legacy \
    --outDir "./$OUT_DIR" \
    --node10TypeCompat
