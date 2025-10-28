# Session 2.3: npm Dependency Pattern Established

**Date**: 2025-10-27
**Status**: ✅ Complete - Pattern Successfully Established
**Time Spent**: 1.5 hours

## Summary

Successfully established the npm dependency resolution pattern for Bazel/TypeScript compilation. The key insight: **each workspace package needs `npm_link_all_packages` in its BUILD file** to link npm dependencies from its package.json.

## Problem Statement

Session 2.2 identified that npm packages are available as Bazel targets (`//:.aspect_rules_js/node_modules/uuid@11.1.0`), but TypeScript couldn't resolve module imports like `import { v4 } from "uuid"`.

**Root Cause**: aspect_rules_js/ts requires explicit npm package linking at the package level for TypeScript module resolution to work in the Bazel sandbox.

## Solution

### Step 1: Add npm Dependency to package.json

```json
{
  "name": "@fluidframework/core-utils",
  "dependencies": {
    "uuid": "^11.1.0"
  }
}
```

### Step 2: Update pnpm Lockfile

```bash
pnpm install --no-frozen-lockfile
```

This updates `pnpm-lock.yaml` with the new dependency.

### Step 3: Link npm Packages in BUILD.bazel

```python
load("@npm//:defs.bzl", "npm_link_all_packages")

# Link npm packages for this workspace package
npm_link_all_packages(name = "node_modules")
```

This creates `:node_modules/uuid` and other package targets that TypeScript can resolve.

### Step 4: Add npm Packages to ts_project deps

```python
ts_project(
    name = "core_utils_esm",
    srcs = glob(["src/**/*.ts"], exclude = ["src/test/**"]),
    # ... other attributes ...
    deps = [
        ":node_modules/uuid",  # Local node_modules target
    ],
)
```

### Step 5: Import in TypeScript Code

```typescript
import { v4 as uuidv4 } from "uuid";

export function generateId(): string {
    return uuidv4();
}
```

## Complete Pattern

### BUILD.bazel Template for Packages with npm Dependencies

```python
# Load both ts_project and npm linking
load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
load("@npm//:defs.bzl", "npm_link_all_packages")

# Link npm packages from this package's package.json
npm_link_all_packages(name = "node_modules")

package(default_visibility = ["//visibility:public"])

# ESM compilation with npm deps
ts_project(
    name = "my_package_esm",
    srcs = glob(["src/**/*.ts"], exclude = ["src/test/**"]),
    composite = True,
    declaration = True,
    declaration_map = True,
    incremental = True,
    out_dir = "lib",
    root_dir = "src",
    source_map = True,
    tsconfig = ":tsconfig.bazel.json",
    deps = [
        # npm dependencies
        ":node_modules/uuid",
        ":node_modules/debug",
        # workspace dependencies
        "//packages/common/core-interfaces:core_interfaces_esm",
    ],
)

# CJS compilation with same npm deps
ts_project(
    name = "my_package_cjs",
    srcs = glob(["src/**/*.ts"], exclude = ["src/test/**"]),
    composite = True,
    declaration = True,
    declaration_map = True,
    incremental = True,
    out_dir = "dist",
    root_dir = "src",
    source_map = True,
    tsconfig = ":tsconfig.cjs.bazel.json",
    deps = [
        ":node_modules/uuid",
        ":node_modules/debug",
        "//packages/common/core-interfaces:core_interfaces_cjs",
    ],
)
```

## Key Learnings

### 1. npm_link_all_packages Per Package

In pnpm workspace monorepos, **each package BUILD file** that uses npm dependencies must call `npm_link_all_packages`. The root-level call only links root package.json dependencies.

**Why**: aspect_rules_js creates local `:node_modules/package-name` targets based on each package's package.json dependencies.

### 2. Local vs Global npm Targets

```python
# ❌ Wrong: Using global .aspect_rules_js targets
deps = ["//:.aspect_rules_js/node_modules/uuid@11.1.0"]

# ✅ Correct: Using local linked targets
deps = [":node_modules/uuid"]
```

The local targets provide proper TypeScript module resolution because they're linked with the package's context.

### 3. @types Packages

Many modern npm packages (like uuid@11) include TypeScript types. You **don't need** separate `@types/*` dependencies unless:
- The package doesn't include types
- You're using an older version without types

```python
# Usually sufficient (for packages with built-in types)
deps = [":node_modules/uuid"]

# Only if needed (for packages without types)
deps = [
    ":node_modules/some-package",
    ":node_modules/@types/some-package",  # Only if available and needed
]
```

### 4. Dependency Matching ESM/CJS

Always match npm dependency module format to output format:
- ESM targets use ESM npm imports
- CJS targets use CJS npm imports

The `:node_modules/uuid` target handles both automatically.

## Validation

### Build Success

```bash
# ESM build ✅
bazel build //packages/common/core-utils:core_utils_esm
# Success: 15 files (including uuidUtils.js)

# CJS build ✅
bazel build //packages/common/core-utils:core_utils_cjs
# Success: 15 files (including uuidUtils.js)
```

### Output Verification

Build outputs created in `bazel-out/k8-fastbuild/bin/packages/common/core-utils/`:
- `lib/uuidUtils.js` - ESM compiled output
- `lib/uuidUtils.d.ts` - TypeScript declarations
- `lib/uuidUtils.js.map` - Source maps
- `dist/uuidUtils.js` - CJS compiled output
- `dist/uuidUtils.d.ts` - CJS declarations
- `dist/uuidUtils.js.map` - CJS source maps

## Pattern Application

This pattern now applies to ALL packages needing npm dependencies:

1. **@fluid-internal/client-utils** (Session 2.2 deferred package)
   - Add npm deps: `base64-js`, `sha.js`, `events`
   - Add `npm_link_all_packages` to BUILD
   - Add `:node_modules/base64-js` etc to deps
   - Handle `.cts` files separately (still needs investigation)

2. **@fluidframework/telemetry-utils**
   - npm deps: `debug@^4.3.4`, `uuid@^11.1.0`
   - Same pattern applies

3. **All other packages with npm dependencies**
   - Follow this established pattern

## Comparison to Session 2.2 Investigation

| Aspect | Session 2.2 Finding | Session 2.3 Solution |
|--------|-------------------|---------------------|
| **npm Target Format** | Discovered `//:.aspect_rules_js/node_modules/uuid@11.1.0` | Use `:node_modules/uuid` instead |
| **TypeScript Resolution** | Identified as blocker | Solved via npm_link_all_packages per package |
| **@types Packages** | Thought needed | Not required for packages with built-in types |
| **Monorepo Linking** | Unclear | Each workspace package needs npm_link_all_packages |

## Next Steps

1. **Session 2.4**: Apply pattern to migrate `@fluid-internal/client-utils`
   - Handle npm dependencies using this pattern
   - Investigate `.cts` file compilation separately
2. **Session 2.5+**: Migrate remaining common/ and utils/ packages with npm deps
3. **Update BUILD Generation Script**: Add npm_link_all_packages and npm dep detection

## Files Modified

- `packages/common/core-utils/package.json` - Added uuid dependency
- `packages/common/core-utils/BUILD.bazel` - Added npm_link_all_packages and deps
- `packages/common/core-utils/src/uuidUtils.ts` - Test file demonstrating npm import
- `pnpm-lock.yaml` - Updated with uuid@11.1.0

## References

- [aspect_rules_js npm_link_all_packages](https://github.com/aspect-build/rules_js/blob/main/docs/npm_link_all_packages.md)
- [aspect_rules_ts ts_project](https://github.com/aspect-build/rules_ts/blob/main/docs/rules.md)
- [Session 2.2 Investigation Notes](./SESSION_2.2_NOTES.md)

---

**Status**: ✅ Pattern Established and Validated
**Impact**: Unblocks migration of 50+ packages with npm dependencies
**Confidence**: High - pattern tested and documented
