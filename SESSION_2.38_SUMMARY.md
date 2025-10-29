# Session 2.38 Summary - Group 17 Complete

**Date**: 2025-10-29
**Duration**: ~1 hour
**Status**: ✅ Complete

## Objective
Complete Group 17 (Tools) migration by resolving replay-tool blocker.

## What Was Done

### 1. Root Cause Analysis
- Investigated why replay-tool couldn't import `@fluidframework/file-driver/internal`
- Discovered file-driver BUILD.bazel was missing `out_dir` attribute
- ESM outputs were going to `src/` instead of `lib/`
- npm_link pointed to source directory without lib/ structure

### 2. Fix Applied
- Added `out_dir = "lib"` to file_driver_esm ts_project
- Added `root_dir = "src"` to file_driver_esm ts_project
- Clean rebuild to clear Bazel cache
- Verified replay-tool builds successfully

### 3. Documentation Updates
- Updated BAZEL_CONVENTIONS.md with critical pattern requirements
- Added troubleshooting entry for subpath import errors
- Enhanced standard BUILD pattern with comments
- Emphasized importance of out_dir and root_dir attributes

### 4. Status Updates
- Updated BAZEL_MIGRATION_STATUS.md
- Marked Group 17 as 100% complete (4/4 tools)
- Updated overall progress to 72/88 packages (81.8%)

## Packages Migrated
- ✅ @fluid-internal/replay-tool (26 workspace dependencies)

## Key Learnings

### CRITICAL Discovery
**ts_project requires explicit `out_dir` and `root_dir` for predictable output locations.**

Without these attributes:
- TypeScript may output to unexpected directories (mirroring source structure)
- npm_link cannot resolve package.json exports correctly
- Packages with subpath exports (/internal, /legacy) fail to resolve
- Clean rebuild required after fixing output directories

### Standard Pattern (REQUIRED)
```python
ts_project(
    name = "package_esm",
    out_dir = "lib",      # CRITICAL: ESM → lib/
    root_dir = "src",     # CRITICAL: Predictable structure
    # ... other attributes
)

ts_project(
    name = "package_cjs",
    out_dir = "dist",     # CRITICAL: CJS → dist/
    root_dir = "src",     # CRITICAL: Predictable structure
    transpiler = "tsc",   # REQUIRED for CJS
    # ... other attributes
)
```

## Build Verification
```bash
# file-driver builds with lib/ output
bazel build //packages/drivers/file-driver:pkg
ls bazel-bin/packages/drivers/file-driver/pkg/
# Output: dist/ lib/ package.json ✅

# replay-tool builds successfully
bazel build //packages/tools/replay-tool:replay-tool
# Success! ✅
```

## Progress Summary
- **Before**: 71/88 packages (80.7%), Group 17 partial (2/4)
- **After**: 72/88 packages (81.8%), Group 17 complete (4/4)
- **Groups Complete**: 15/17 in Phase 3

## Remaining Work
### Remaining Groups (2/17)
- Group 11: Loader & Final Runtime (2 packages)
- Group 15: Advanced Test Packages (3 packages)
- Group 16: Top-Level Test Packages (3 packages)

### Recommended Next
**Group 15: Advanced Test Packages**
- @fluidframework/test-utils (20 ws_deps)
- @fluid-internal/test-snapshots (20 ws_deps)
- @fluid-internal/test-service-load (22 ws_deps)

## Files Changed
1. `packages/drivers/file-driver/BUILD.bazel` - Added out_dir and root_dir
2. `BAZEL_MIGRATION_STATUS.md` - Updated progress and added Session 2.38
3. `BAZEL_CONVENTIONS.md` - Added critical pattern documentation

## Commits
1. `Session 2.38: Complete Group 17 - Fix file-driver BUILD and migrate replay-tool`
2. `docs: Add critical BUILD pattern learnings to BAZEL_CONVENTIONS`

## Impact
This session resolved a critical pattern issue that could have affected many future migrations. The documentation updates ensure all future packages follow the correct pattern from the start.

---

**Session Complete**: Group 17 ✅ | 72/88 packages migrated (81.8%)
