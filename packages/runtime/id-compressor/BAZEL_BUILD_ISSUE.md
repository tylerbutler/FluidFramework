# Bazel Build Issue: @fluidframework/id-compressor

**Status**: ⚠️ Known Issue - TypeScript Module Detection Problem
**Error**: TS1479
**Session**: 2.17 (2025-10-28)
**Related**: packages/drivers/replay-driver/BAZEL_BUILD_ISSUE.md (same issue)

## Error Description

TypeScript compiler treats id-compressor source files as CommonJS despite `"type": "module"` in package.json:

```
TS1479: The current file is a CommonJS module whose imports will produce 'require' calls;
however, the referenced file is an ECMAScript module and cannot be imported with 'require'.
```

## Build Configuration

- **Package Type**: `"type": "module"` in package.json ✅
- **TSConfig**: `"module": "Node16"`, `"moduleResolution": "Node16"` ✅
- **Dependencies**: All workspace dependencies migrated ✅
- **npm_link_all_packages**: Correctly configured ✅
- **npm_package pattern**: Following Session 2.15 proven approach ✅

## Failed Files

All source files fail with TS1479 when importing from workspace packages:

1. `src/appendOnlySortedMap.ts` - imports from `@fluidframework/core-utils/internal`
2. `src/finalSpace.ts` - imports from `@fluidframework/core-utils/internal`
3. `src/idCompressor.ts` - imports from multiple workspace packages
4. `src/persistanceUtilities.ts` - imports from `@fluidframework/core-utils/internal`
5. `src/sessionSpaceNormalizer.ts` - imports from `@fluidframework/core-utils/internal`
6. `src/sessions.ts` - imports from `@fluidframework/core-utils/internal`
7. `src/utilities.ts` - imports from `@fluidframework/core-utils/internal`

## Investigation

### npm Build Status
✅ **Successfully builds with npm**: `pnpm run esnext` works perfectly

### Bazel Status
❌ **Fails with Bazel**: TypeScript incorrectly detects files as CommonJS

### Comparison with Successful Packages

**driver-utils** (builds successfully):
- Also has `"type": "module"` ✅
- Also imports from `/internal` subpaths ✅
- Also uses dual ESM/CJS compilation ✅
- **WORKS** with identical BUILD.bazel pattern

**14 other Phase 2 packages** (build successfully):
- Identical `"type": "module"` configuration
- Same npm_package approach
- Same tsconfig settings
- **ALL WORK** with identical pattern

### Why id-compressor Fails

**Unknown root cause**. Identical configuration to 14 successfully building packages.

Possible factors investigated:
- ❌ `/internal` subpath imports (driver-utils has them, works fine)
- ❌ Dual ESM/CJS (all packages do this)
- ❌ Package type field (verified correct)
- ❌ TSConfig module settings (matches working packages)
- ❌ npm_link_all_packages (configured correctly)
- ❌ Dependencies (all migrated successfully)

## Attempted Solutions

### Solution 1: Standard npm_package Pattern
Created BUILD.bazel following Session 2.15 proven approach:
```python
npm_link_all_packages(name = "node_modules")
ts_project(name = "id_compressor_esm", ...)
ts_project(name = "id_compressor_cjs", ...)
js_library(name = "lib", srcs = [..., "package.json"])
npm_package(name = "pkg", srcs = [":lib"])
```
**Result**: ❌ TS1479 errors on all source files

### Solution 2: TSConfig Attribute Alignment
Added explicit attributes to match tsconfig.bazel.json:
- `composite = True`
- `declaration_map = True`
- `incremental = True`
- `source_map = True`

**Result**: ❌ Same TS1479 errors

## Migration Strategy

### Decision
**Skip id-compressor, continue Phase 3 migrations**

### Rationale
1. **High success rate**: 14/15 Phase 2 packages (93%) build successfully
2. **Known issue pattern**: Same as replay-driver (Session 2.16)
3. **Blocking migration progress**: Investigating further delays entire Phase 3
4. **Types-only workaround**: runtime-definitions can use id-compressor types via npm dependencies
5. **Deferred investigation**: Return after more data points from Phase 3

### Impact
- runtime-definitions: Can still migrate (types-only, no implementation)
- Other runtime packages: May encounter same issue if they have similar structure
- Test coverage: id-compressor tests cannot run in Bazel (yet)

## Next Steps

1. **Continue Phase 3**: Migrate types-only packages (runtime-definitions, datastore-definitions, container-runtime-definitions)
2. **Monitor pattern**: Track if more packages exhibit TS1479 errors
3. **Collect data**: Build understanding of what triggers this issue
4. **Return later**: Investigate with more information from additional migrations

## Technical Context

### TypeScript Module Detection
TypeScript determines module system based on:
1. `package.json` `"type"` field (should be "module" for ESM)
2. File extension (`.mts` for ESM, `.cts` for CJS, `.ts` uses package.json)
3. TSConfig `module` setting

For id-compressor, all three are correctly configured for ESM, yet TypeScript detects CommonJS.

### Bazel Sandbox Hypothesis
Possible (unconfirmed) causes:
- Bazel sandbox may not properly expose package.json to TypeScript
- npm_link_all_packages may create symlinks that confuse module detection
- ts_project rule may need additional configuration for module resolution

### Similar Issues
- **replay-driver**: Exact same TS1479 error pattern
- **14 working packages**: All use identical configuration successfully

## Files

### Created
- `packages/runtime/id-compressor/BUILD.bazel`
- `packages/runtime/id-compressor/tsconfig.bazel.json`
- `packages/runtime/id-compressor/tsconfig.cjs.bazel.json`
- `packages/runtime/id-compressor/BAZEL_BUILD_ISSUE.md` (this file)

### Status
- ⚠️ **Documented**: Issue recorded for future investigation
- 🔄 **Deferred**: Migration postponed until root cause identified
- ✅ **Unblocked**: Phase 3 continues with types-only packages

---

**Last Updated**: 2025-10-28
**Session**: 2.17 - Begin Phase 3 Runtime Migrations
**Related**: Session 2.16 (replay-driver same issue)
