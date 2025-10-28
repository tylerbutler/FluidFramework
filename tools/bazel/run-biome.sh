#!/usr/bin/env bash
# Wrapper script for running Biome from the workspace root
# This script is invoked by Bazel run targets and uses BUILD_WORKSPACE_DIRECTORY

set -euo pipefail

# When running with 'bazel run', Bazel sets BUILD_WORKSPACE_DIRECTORY
# to the absolute path of the workspace root
if [ -z "${BUILD_WORKSPACE_DIRECTORY:-}" ]; then
    echo "ERROR: BUILD_WORKSPACE_DIRECTORY not set. This script must be run via 'bazel run'."
    exit 1
fi

cd "$BUILD_WORKSPACE_DIRECTORY"

# Execute biome check with arguments
# We hardcode 'biome' here since pnpm/npm will find it in node_modules/.bin
exec pnpm biome "$@"
