# API Extractor Integration with Bazel (Session 2.14)

**Date**: 2025-10-28
**Status**: ✅ Complete
**Package**: @fluidframework/core-interfaces (reference implementation)

## Overview

API Extractor integration for Fluid Framework packages follows a two-step workflow:
1. Generate entrypoint files (`public.d.ts`, `legacy.d.ts`) using `flub generate entrypoints`
2. Run API Extractor on the entrypoint files to generate/validate API reports

Both steps are integrated as `bazel run` targets that operate on the workspace directory (similar to the Biome format targets from Session 2.12).

## Architecture

### Workflow

```
TypeScript Build (ts_project)
    ↓ generates .d.ts files in lib/
flub generate entrypoints
    ↓ creates lib/public.d.ts, lib/legacy.d.ts
API Extractor
    ↓ generates/validates api-report/*.api.md files
```

### Tool Integration

**flub (Fluid Build Tool)**
- Provided by `@fluid-tools/build-cli` package
- Generates entrypoint `.d.ts` files by extracting APIs by release tag
- Supports `@public`, `@beta`, `@alpha`, `@legacy*` release tags
- Required before API Extractor can run

**API Extractor**
- Provided by `@microsoft/api-extractor` package
- Generates API report markdown files (`.api.md`)
- Validates API surface changes and breaking changes
- Multiple configurations for different entry points (public, legacy, etc.)

## Implementation Pattern

### BUILD.bazel Targets

```python
# 1. Generate entrypoint files using flub
sh_binary(
    name = "generate_entrypoints",
    srcs = ["//tools/bazel:run-flub-entrypoints.sh"],
    args = [
        "packages/common/core-interfaces",  # Package path
        "lib",                               # Output directory
    ],
    data = [
        ":core_interfaces_esm",              # TypeScript build outputs
        "//tools/bazel:run-flub-entrypoints.sh",
    ],
    tags = ["api-extraction"],
)

# 2. Run API Extractor for current API reports
sh_binary(
    name = "api_reports_current",
    srcs = ["//tools/bazel:run-api-extractor.sh"],
    args = [
        "packages/common/core-interfaces",
        "api-extractor/api-extractor.current.json",
    ],
    data = [
        ":core_interfaces_esm",
        "api-extractor/api-extractor.current.json",
        "tsconfig.json",
        "//tools/bazel:run-api-extractor.sh",
    ] + glob(["api-report/*.api.md"]),
    tags = ["api-extraction"],
)

# 3. Run API Extractor for legacy API reports
sh_binary(
    name = "api_reports_legacy",
    srcs = ["//tools/bazel:run-api-extractor.sh"],
    args = [
        "packages/common/core-interfaces",
        "api-extractor/api-extractor.legacy.json",
    ],
    data = [
        ":core_interfaces_esm",
        "api-extractor/api-extractor.legacy.json",
        "tsconfig.json",
        "//tools/bazel:run-api-extractor.sh",
    ] + glob(["api-report/*.api.md"]),
    tags = ["api-extraction"],
)
```

### Wrapper Scripts

**tools/bazel/run-flub-entrypoints.sh**
```bash
#!/usr/bin/env bash
set -euo pipefail

# Uses BUILD_WORKSPACE_DIRECTORY to run from workspace root
cd "$BUILD_WORKSPACE_DIRECTORY"

PACKAGE_PATH="${1:-}"
OUT_DIR="${2:-lib}"

cd "$PACKAGE_PATH"

# Run flub via pnpm (finds it in node_modules/.bin)
exec pnpm flub generate entrypoints \
    --outFileLegacyBeta legacy \
    --outDir "./$OUT_DIR" \
    --node10TypeCompat
```

**tools/bazel/run-api-extractor.sh**
```bash
#!/usr/bin/env bash
set -euo pipefail

cd "$BUILD_WORKSPACE_DIRECTORY"

PACKAGE_PATH="${1:-}"
CONFIG_FILE="${2:-api-extractor.json}"

cd "$PACKAGE_PATH"

# Run api-extractor directly (not via npm script to avoid double "run")
exec ../../../node_modules/.bin/api-extractor run --local --config "$CONFIG_FILE"
```

## Usage

### Command Line

```bash
# 1. Build TypeScript (if not already built)
bazel build //packages/common/core-interfaces:core_interfaces_esm

# 2. Generate entrypoint files
bazel run //packages/common/core-interfaces:generate_entrypoints

# 3. Generate/validate API reports
bazel run //packages/common/core-interfaces:api_reports_current
bazel run //packages/common/core-interfaces:api_reports_legacy
```

### Typical Workflow

**After Code Changes**:
```bash
# Rebuild TypeScript
bazel build //packages/common/core-interfaces:core_interfaces_esm

# Regenerate entrypoints
bazel run //packages/common/core-interfaces:generate_entrypoints

# Update API reports
bazel run //packages/common/core-interfaces:api_reports_current
bazel run //packages/common/core-interfaces:api_reports_legacy

# Review changes
git diff api-report/
```

## Configuration

### API Extractor Configs

Fluid Framework uses hierarchical API Extractor configurations:

```
common/build/build-common/
├── api-extractor-base.json           # Base configuration
├── api-extractor-model.esm.json      # ESM model generation
└── api-extractor-report-base.esm.json # ESM report generation

packages/common/core-interfaces/
├── api-extractor.json                 # Main config (extends base)
└── api-extractor/
    ├── api-extractor.current.json     # Current API (public.d.ts entry)
    └── api-extractor.legacy.json      # Legacy API (legacy.d.ts entry)
```

### Entry Point Files

Generated by `flub generate entrypoints`:

- `lib/public.d.ts` - Public APIs only (`@public` tag)
- `lib/legacy.d.ts` - Legacy APIs (`@legacyBeta` tag)
- `legacy.d.ts` - Node10 compatibility entrypoint

## Validation

### Success Criteria

✅ **Entrypoint generation works**
```bash
$ bazel run //packages/common/core-interfaces:generate_entrypoints
INFO: Processing: ./src/index.ts
INFO:   Found output for public APIs. Generating ./lib/public.d.ts
INFO:   Found output for legacyBeta APIs. Generating ./lib/legacy.d.ts
```

✅ **API extraction succeeds**
```bash
$ bazel run //packages/common/core-interfaces:api_reports_current
api-extractor 7.52.11
Analysis will use the bundled TypeScript version 5.8.2
API Extractor completed successfully
```

✅ **API reports match npm baseline**
```bash
$ git status api-report/
nothing to commit, working tree clean
```

## Key Decisions

### Why `sh_binary` instead of `genrule`?

1. **Workspace Access**: Need to modify files in the source tree (not just bazel-out)
2. **Tool Dependencies**: Need access to pnpm and node_modules
3. **Consistency**: Matches Biome integration pattern (Session 2.12)
4. **User Experience**: Simple `bazel run` commands similar to npm scripts

### Why Not Use npm Scripts Directly?

**Problem**: npm scripts can have nested invocations
```json
{
  "scripts": {
    "api-extractor": "api-extractor run --local"
  }
}
```
Running `pnpm api-extractor run --local --config X` would result in:
`api-extractor run --local run --local --config X` ❌

**Solution**: Call binaries directly from `node_modules/.bin/`

### Entrypoint Generation Dependency

API Extractor REQUIRES entrypoint files (`public.d.ts`, `legacy.d.ts`) which are NOT generated by TypeScript compilation - they must be created by `flub generate entrypoints` first.

**Workflow Dependencies**:
```
ts_project → .d.ts files in lib/
    ↓ (must complete first)
flub generate entrypoints → lib/public.d.ts, lib/legacy.d.ts
    ↓ (must complete first)
api-extractor → api-report/*.api.md
```

## Comparison: npm vs Bazel

### npm Commands

```bash
# Generate entrypoints
pnpm run generate-entrypoints-esnext

# Generate API reports
pnpm run api-reports-current
pnpm run api-reports-legacy
```

### Bazel Commands

```bash
# Generate entrypoints
bazel run //packages/common/core-interfaces:generate_entrypoints

# Generate API reports
bazel run //packages/common/core-interfaces:api_reports_current
bazel run //packages/common/core-interfaces:api_reports_legacy
```

### Advantages of Bazel Approach

1. **Explicit Dependencies**: Bazel knows TypeScript build must complete first
2. **Incremental**: Bazel tracks which steps need to run based on file changes
3. **Consistent Interface**: Same `bazel run` pattern across all tooling
4. **Parallelizable**: Can build multiple packages' APIs concurrently
5. **Hermetic**: Less reliance on ambient npm scripts

## Migration Notes

### For Future Packages

When migrating a new package to Bazel:

1. **Copy pattern** from core-interfaces BUILD.bazel
2. **Update package path** in args: `"packages/<category>/<name>"`
3. **Verify configs** exist: `api-extractor/api-extractor.{current,legacy}.json`
4. **Test workflow**: build → generate_entrypoints → api_reports_*

### Common Issues

**Issue**: `api-extractor: error: Unrecognized arguments: run`
**Cause**: Running through npm script that adds extra "run"
**Solution**: Call `node_modules/.bin/api-extractor` directly

**Issue**: `mainEntryPointFilePath does not exist: lib/public.d.ts`
**Cause**: Forgot to run entrypoint generation first
**Solution**: `bazel run :generate_entrypoints` before API extraction

**Issue**: `flub: command not found`
**Cause**: Bazel sandbox doesn't have access to node_modules
**Solution**: Use `BUILD_WORKSPACE_DIRECTORY` and run from workspace root

## Future Enhancements (Phase 4)

### Automated Workflow Target

Could create a combined target that runs the full workflow:

```python
# Run complete API extraction workflow
sh_binary(
    name = "api_reports_all",
    srcs = ["//tools/bazel:run-api-workflow.sh"],
    args = ["packages/common/core-interfaces"],
    data = [
        ":core_interfaces_esm",
        # ... all configs
    ],
)
```

### CI Integration

```bash
# Verify API reports are up-to-date (CI mode)
bazel run //packages/common/core-interfaces:api_reports_current
bazel run //packages/common/core-interfaces:api_reports_legacy

# Check for uncommitted changes
git diff --exit-code api-report/
```

### Root-Level Targets

```python
# Root BUILD.bazel
sh_binary(
    name = "api_reports_all",
    srcs = ["//tools/bazel:run-all-api-reports.sh"],
    data = [
        "//packages/common/...:api_reports_current",
        "//packages/common/...:api_reports_legacy",
    ],
)
```

## Related Documentation

- **Session 2.12**: Biome Integration (similar sh_binary pattern)
- **Session 2.13**: Mocha Test Integration (deferred due to npm @types issues)
- **Phase 1**: TypeScript compilation patterns (ts_project usage)

## Testing

```bash
# Clean state test
rm -rf packages/common/core-interfaces/lib/public.d.ts \
       packages/common/core-interfaces/lib/legacy.d.ts \
       packages/common/core-interfaces/legacy.d.ts

# Rebuild from scratch
bazel clean
bazel build //packages/common/core-interfaces:core_interfaces_esm
bazel run //packages/common/core-interfaces:generate_entrypoints
bazel run //packages/common/core-interfaces:api_reports_current
bazel run //packages/common/core-interfaces:api_reports_legacy

# Verify no changes
git status api-report/
```

## References

- **API Extractor**: https://api-extractor.com/
- **flub (Fluid Build CLI)**: @fluid-tools/build-cli package
- **Bazel sh_binary**: https://bazel.build/reference/be/shell#sh_binary
- **Fluid Framework API patterns**: common/build/build-common/*.json

---

**Session 2.14 Status**: ✅ Complete
**Next Session**: 2.15+ - Continue Phase 2 package migrations with full tooling
