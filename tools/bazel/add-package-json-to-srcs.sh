#!/usr/bin/env bash

# Script to add package.json to all ts_project srcs in BUILD.bazel files
# This ensures TypeScript can correctly detect module format in Bazel sandbox

set -euo pipefail

echo "Adding package.json to all ts_project srcs..."

# Find all BUILD.bazel files in packages/
find packages/ -name "BUILD.bazel" -type f | while read -r build_file; do
    # Check if this BUILD.bazel has ts_project rules
    if grep -q "ts_project(" "$build_file"; then
        echo "Processing: $build_file"

        # Check if package.json is already included
        if grep -q '+ \["package.json"\]' "$build_file"; then
            echo "  ✓ Already has package.json in srcs"
        else
            # Add package.json to srcs for both ESM and CJS builds
            # This regex handles both single-line and multi-line glob expressions

            # For ESM builds (typically _esm suffix)
            sed -i '/name = "[^"]*_esm"/,/^\s*deps = \[/ {
                /srcs = glob(/,/),$/ {
                    s/),$/) + ["package.json"],  # Include package.json so TypeScript sees the "type": "module"/
                }
                /srcs = glob(/,/),\s*$/ {
                    s/),\s*$/) + ["package.json"],  # Include package.json so TypeScript sees the "type": "module"/
                }
            }' "$build_file"

            # For CJS builds (typically _cjs suffix)
            sed -i '/name = "[^"]*_cjs"/,/^\s*deps = \[/ {
                /srcs = glob(/,/),$/ {
                    s/),$/) + ["package.json"],  # Include package.json for consistent behavior/
                }
                /srcs = glob(/,/),\s*$/ {
                    s/),\s*$/) + ["package.json"],  # Include package.json for consistent behavior/
                }
            }' "$build_file"

            echo "  ✅ Added package.json to srcs"
        fi
    fi
done

echo "Done! All ts_project rules now include package.json in their srcs."
echo ""
echo "Summary of changes:"
git diff --stat packages/*/BUILD.bazel packages/*/*/BUILD.bazel 2>/dev/null || true