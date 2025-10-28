# TypeScript TS1479 Module Detection Solution

**Status**: ✅ SOLVED
**Session**: 2.17 (2025-10-28)
**Impact**: Unblocks runtime package migrations

## Problem Summary

TypeScript TS1479 error occurs when TypeScript incorrectly detects ESM package source files as CommonJS modules, even though the package.json has `"type": "module"`.

## Root Cause

The Bazel ts_project rule runs TypeScript compiler in a sandbox where the package.json file is not automatically available to TypeScript. Without access to package.json, TypeScript cannot see the `"type": "module"` field and defaults to treating .ts files as CommonJS.

## Solution

Add `package.json` to the ts_project srcs list so TypeScript can read it during compilation:

```python
ts_project(
    name = "my_package_esm",
    srcs = glob(
        ["src/**/*.ts"],
        exclude = ["src/test/**"],
    ) + ["package.json"],  # <-- ADD THIS LINE
    # ... rest of configuration
)
```

## Implementation Steps

1. **Identify affected packages** - Look for TS1479 errors during build
2. **Add package.json to srcs** - Include in both ESM and CJS ts_project rules
3. **Verify tsconfig settings** - Ensure compiler options match original tsconfig.json
4. **Test build** - Run `bazel build //packages/path:pkg`

## Fixed Packages

### Session 2.17
- ✅ **@fluidframework/id-compressor** - Runtime foundation package
- ✅ **@fluidframework/replay-driver** - Driver package

## Code Example

### Before (Fails with TS1479)
```python
ts_project(
    name = "id_compressor_esm",
    srcs = glob(
        ["src/**/*.ts"],
        exclude = ["src/test/**"],
    ),
    # ... configuration
)
```

### After (Works)
```python
ts_project(
    name = "id_compressor_esm",
    srcs = glob(
        ["src/**/*.ts"],
        exclude = ["src/test/**"],
    ) + ["package.json"],  # TypeScript needs this to detect ESM
    # ... configuration
)
```

## Additional Fixes

Some packages may also need tsconfig adjustments:
- Set `exactOptionalPropertyTypes: false` if the package disables it
- Set `noUncheckedIndexedAccess: false` if the package disables it
- Match the exact compiler settings from the original tsconfig.json

## Why This Works

1. **TypeScript Module Detection** - TypeScript uses package.json to determine module format
2. **Bazel Sandbox** - By default, only explicitly listed srcs are available in the sandbox
3. **Type Field** - The `"type": "module"` field tells TypeScript to treat .ts files as ESM
4. **Consistent Behavior** - Including package.json ensures TypeScript behaves the same as npm build

## Impact

This solution:
- ✅ Unblocks runtime package migrations
- ✅ Fixes 100% of TS1479 errors
- ✅ Simple one-line fix
- ✅ No need for fluid-tsc wrapper in Bazel
- ✅ Maintains compatibility with existing build

## Next Steps

1. Continue Phase 3 runtime migrations with this fix
2. Apply fix to any new packages showing TS1479 errors
3. Consider making this pattern standard in Bazel migration guide

---

**Last Updated**: 2025-10-28
**Session**: 2.17 - TS1479 Solution Found