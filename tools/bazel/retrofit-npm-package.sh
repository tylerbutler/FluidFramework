#!/usr/bin/env bash
# Retrofit existing BUILD.bazel files to use npm_package approach
# This enables proper TypeScript subpath exports resolution (/internal, /legacy, etc.)

set -euo pipefail

PACKAGE_DIR="${1:?Usage: $0 <package-dir>}"

if [[ ! -f "$PACKAGE_DIR/BUILD.bazel" ]]; then
    echo "Error: No BUILD.bazel found in $PACKAGE_DIR"
    exit 1
fi

if [[ ! -f "$PACKAGE_DIR/package.json" ]]; then
    echo "Error: No package.json found in $PACKAGE_DIR"
    exit 1
fi

# Extract package name from package.json
PACKAGE_NAME=$(jq -r '.name' "$PACKAGE_DIR/package.json")
# Convert to safe Bazel target name: @fluidframework/core-interfaces -> core_interfaces
# Remove scope prefix and convert to snake_case
SAFE_NAME=$(echo "$PACKAGE_NAME" | sed 's/@[^/]*\///g' | sed 's/-/_/g')

echo "Retrofitting $PACKAGE_NAME ($SAFE_NAME) in $PACKAGE_DIR"

# Backup original BUILD.bazel
cp "$PACKAGE_DIR/BUILD.bazel" "$PACKAGE_DIR/BUILD.bazel.pre_npm_package_retrofit"

# Check if already has npm_package
if grep -q "npm_package" "$PACKAGE_DIR/BUILD.bazel"; then
    echo "  Already has npm_package, skipping..."
    exit 0
fi

# Create new BUILD.bazel with npm_package pattern
cat > "$PACKAGE_DIR/BUILD.bazel" << 'EOF_HEADER'
# BUILD.bazel for PACKAGE_NAME
# Retrofitted for npm_package approach (Session 2.15)

load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
load("@aspect_rules_js//js:defs.bzl", "js_library")
load("@aspect_rules_js//npm:defs.bzl", "npm_package")
load("@npm//:defs.bzl", "npm_link_all_packages")

package(default_visibility = ["//visibility:public"])

# Link npm packages for this workspace package
npm_link_all_packages(name = "node_modules")

EOF_HEADER

# Replace placeholder with actual package name
sed -i "s|PACKAGE_NAME|$PACKAGE_NAME|g" "$PACKAGE_DIR/BUILD.bazel"

# Copy existing ts_project targets from backup
# Extract everything from first ts_project to the last closing paren before any filegroup
awk '/^ts_project\(/,/^filegroup\(/ {
    if (/^filegroup\(/) exit;
    print
}' "$PACKAGE_DIR/BUILD.bazel.pre_npm_package_retrofit" >> "$PACKAGE_DIR/BUILD.bazel"

# Add js_library wrapper
cat >> "$PACKAGE_DIR/BUILD.bazel" << EOF

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

echo "  ✓ Retrofitted successfully"
echo "  Backup saved to: BUILD.bazel.pre_npm_package_retrofit"
