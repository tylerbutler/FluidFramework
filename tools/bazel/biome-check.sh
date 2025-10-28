#!/usr/bin/env bash
# Wrapper script for Biome check command with workspace-relative execution
# This script is called by Bazel and uses BUILD_WORKSPACE_DIRECTORY

set -euo pipefail

# Bazel provides BUILD_WORKSPACE_DIRECTORY when running with 'bazel run'
WORKSPACE_DIR="${BUILD_WORKSPACE_DIRECTORY:-$(pwd)}"

cd "$WORKSPACE_DIR"

# Forward all arguments to biome
exec "$@"
