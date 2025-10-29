# Mocha Test Integration with Bazel - Session 2.13

**Date**: 2025-10-28
**Status**: ✅ **SOLVED** in Session 4.2 (2025-10-29)
**Reference Package**: `@fluidframework/core-interfaces`

---

## ✅ SOLUTION FOUND - Session 4.2 (2025-10-29)

The npm @types resolution issue has been **SOLVED**!

See complete solution documentation: **[TEST_INTEGRATION_SOLUTION.md](./TEST_INTEGRATION_SOLUTION.md)**

### Quick Summary

**Problem**: TypeScript couldn't find `@types/mocha` and `@types/node` in Bazel sandbox.

**Solution**: Three-part fix:
1. Add explicit deps in BUILD.bazel: `:node_modules/@types/mocha` and `:node_modules/@types/node`
2. Add `"types": ["mocha", "node"]` to tsconfig.bazel.json compilerOptions
3. Include source files in test compilation srcs to support relative imports

**Result**: TypeScript now finds all test framework globals (`describe`, `it`, etc.)

**Impact**: Pattern works for Mocha AND Jest - ready to apply to all 74 migrated packages.

---

## Original Problem Documentation (Historical)

**Date**: 2025-10-28
**Status**: ⚠️ Blocked - npm types resolution issue (RESOLVED in Session 4.2)
**Reference Package**: `@fluidframework/core-interfaces`

## Goal

Establish Mocha test integration pattern for Bazel builds to enable:
- Test compilation via `ts_project`
- Test execution via `mocha_bin.mocha_test`
- Validation against existing `pnpm test` behavior

## Current Status

### What Works ✅
1. **Test target structure** - BUILD.bazel has proper test targets:
   - `core_interfaces_test` (ts_project for compilation)
   - `test` (mocha_bin.mocha_test for execution)

2. **Test file discovery** - Glob patterns correctly identify test files

3. **Mocha binary integration** - Mocha executable properly loaded via `@npm//:mocha/package_json.bzl`

4. **Path mappings** - TypeScript can resolve package imports via tsconfig paths:
   ```json
   "paths": {
     "@fluidframework/core-interfaces": ["../../lib/index.js"],
     "@fluidframework/core-interfaces/internal": ["../../lib/internal.js"],
     "@fluidframework/core-interfaces/legacy": ["../../lib/legacy.js"]
   }
   ```

### What's Blocked ❌

**npm @types Resolution**: TypeScript cannot find `@types/mocha` and `@types/node` in Bazel sandbox

**Error:**
```
error TS2582: Cannot find name 'describe'. Do you need to install type definitions
for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
```

**Root Cause**:
- Bazel's ts_project rule executes in a sandbox where `node_modules/@types` isn't automatically available
- Simply adding `//:node_modules/mocha` as a dependency doesn't expose the @types packages
- `typeRoots` paths don't resolve correctly in Bazel sandbox environment

## Implementation Attempted

### BUILD.bazel Configuration

```python
load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
load("@npm//:mocha/package_json.bzl", mocha_bin = "bin")

package(default_visibility = ["//visibility:public"])

# Test compilation (ESM)
ts_project(
    name = "core_interfaces_test",
    srcs = glob(
        ["src/test/**/*.ts"],
        exclude = [
            "src/test/types/**",  # Type validation tests require build-tools
            "src/test/mocha.d.ts",  # Type declaration file
        ],
    ),
    declaration = False,
    source_map = True,
    incremental = True,
    out_dir = "lib/test",
    root_dir = "src/test",
    tsconfig = "src/test/tsconfig.bazel.json",
    transpiler = "tsc",
    deps = [
        ":core_interfaces_esm",
        "//:node_modules/mocha",  # ⚠️ Doesn't expose @types
    ],
)

# Mocha test runner
mocha_bin.mocha_test(
    name = "test",
    args = [
        "lib/test/**/*.spec.js",
        "--exit",
    ],
    data = [
        ":core_interfaces_test",
    ],
)
```

### tsconfig.bazel.json Configuration

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "incremental": true,
    "inlineSources": true,
    "jsx": "react",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "Node16",
    "moduleResolution": "Node16",
    "noImplicitAny": false,
    "noUnusedLocals": true,
    "pretty": true,
    "sourceMap": true,
    "strict": true,
    "target": "ES2021",
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "rootDir": "./",
    "outDir": "../../lib/test",
    "paths": {
      "@fluidframework/core-interfaces": ["../../lib/index.js"],
      "@fluidframework/core-interfaces/internal": ["../../lib/internal.js"],
      "@fluidframework/core-interfaces/legacy": ["../../lib/legacy.js"]
    }
  },
  "include": ["./**/*"],
  "exclude": ["./jsonSerializable.exactOptionalPropertyTypes.false.spec.ts"]
}
```

### Approaches Attempted

1. **Explicit @types dependencies** ❌
   ```python
   deps = [
       "//:node_modules/@types/mocha",  # ERROR: target not declared
       "//:node_modules/@types/node",   # ERROR: target not declared
   ]
   ```

2. **TypeScript types array** ❌
   ```json
   "types": ["mocha", "node"]  // ERROR: Cannot find type definition file
   ```

3. **TypeScript typeRoots** ❌
   ```json
   "typeRoots": ["../../../../node_modules/@types"]  // Path not found in sandbox
   ```

4. **Dependency on mocha package** ❌
   ```python
   deps = ["//:node_modules/mocha"]  // Doesn't expose bundled @types
   ```

## Comparison: pnpm test vs Bazel

### pnpm test (Works)
```bash
cd packages/common/core-interfaces
pnpm test  # ✅ All tests pass
```

**Why it works:**
- Standard node_modules resolution
- TypeScript automatically finds `node_modules/@types/mocha`
- Test tsconfig extends from `common/build/build-common/tsconfig.test.node16.json`

### Bazel test (Blocked)
```bash
bazel test //packages/common/core-interfaces:test
# ❌ FAILED TO BUILD - Cannot find name 'describe'
```

**Why it's blocked:**
- Bazel sandbox isolates build environment
- `npm_translate_lock` from `pnpm-lock.yaml` doesn't auto-expose @types targets
- Need explicit configuration for @types package resolution

## Next Steps

### Option 1: Aspect Rules JS npm Integration (Recommended)
**Research needed**: How to properly expose @types packages from pnpm-lock.yaml
- Check `rules_js` documentation for @types handling
- Investigate `npm_link_all_packages` and scoped package support
- May need to explicitly configure @types targets in WORKSPACE.bazel

**Resources**:
- https://docs.aspect.build/rules/aspect_rules_js/
- https://github.com/aspect-build/rules_js/tree/main/examples

### Option 2: Manual Type Declaration Files
**Workaround**: Create local type declaration files for Mocha globals
- Copy `@types/mocha` declarations to `src/test/types/`
- Reference via triple-slash directive: `/// <reference path="./types/mocha.d.ts" />`
- **Drawback**: Manual maintenance, not scalable

### Option 3: Defer Full Test Integration
**Practical approach**: Focus on build targets first, tests in Phase 4
- Complete package migrations (Phase 2-3) without test targets
- Dedicate Phase 4 session to solving npm types resolution systematically
- Apply solution across all packages once proven

## Recommendation

**Proceed with Option 3** for migration momentum:
1. Document this pattern and blocker clearly
2. Continue Phase 2 package migrations with build-only targets (ESM + CJS compilation)
3. Schedule dedicated "Bazel npm Integration Deep Dive" session in Phase 4
4. Solve @types resolution once, apply to all packages

**Rationale**:
- Unblocks ~30 remaining package migrations
- Consolidates npm integration research into focused session
- Maintains migration velocity
- Tests can still run via `pnpm test` in parallel

## Test Pattern (For Future Use)

Once npm types resolution is solved, apply this pattern:

### BUILD.bazel Test Target Template
```python
# Test compilation
ts_project(
    name = "{package}_test",
    srcs = glob(
        ["src/test/**/*.ts"],
        exclude = ["src/test/types/**"],  # Exclude type validation tests initially
    ),
    declaration = False,
    source_map = True,
    out_dir = "lib/test",
    root_dir = "src/test",
    tsconfig = "src/test/tsconfig.bazel.json",
    deps = [
        ":{package}_esm",
        "//:node_modules/mocha",
        # TODO: Add proper @types/mocha dependency once resolved
    ],
)

# Mocha test execution
mocha_bin.mocha_test(
    name = "test",
    args = ["lib/test/**/*.spec.js", "--exit"],
    data = [":{package}_test"],
)
```

### Usage Commands
```bash
# Build tests
bazel build //packages/{category}/{name}:test

# Run tests (once compilation works)
bazel test //packages/{category}/{name}:test

# Run with full output
bazel test //packages/{category}/{name}:test --test_output=all

# Run all tests in category
bazel test //packages/{category}/...
```

## Files Modified (Session 2.13)

1. `packages/common/core-interfaces/BUILD.bazel`
   - Added test targets (blocked but structure correct)

2. `packages/common/core-interfaces/src/test/tsconfig.bazel.json`
   - Created Bazel-specific test tsconfig
   - Added path mappings for package imports
   - Attempted various @types resolution approaches

3. `docs/bazel/MOCHA_TEST_INTEGRATION.md` (this file)
   - Comprehensive documentation of findings and blocker

## Related Sessions

- **Session 1.2**: Core-interfaces migration (established build pattern)
- **Session 2.12**: Biome integration (successful root-level tooling)
- **Session 2.14** (Next): API Extractor integration
- **Phase 4**: Dedicated npm integration and test resolution session

---

**Status Summary**: Test structure established ✅ | Test compilation blocked ⚠️ | Solution deferred to Phase 4 🔄
