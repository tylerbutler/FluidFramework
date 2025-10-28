# Session 2.4: Client-Utils Migration - SUCCESS

**Date**: 2025-10-27
**Duration**: 1.5 hours
**Status**: ✅ Complete
**Package**: @fluid-internal/client-utils

## Summary

Successfully migrated @fluid-internal/client-utils after solving a complex `.cts → .cjs` compilation pattern with TypeScript module resolution. The key breakthrough was using `rootDirs` in tsconfig to enable TypeScript to find generated `.d.cts` declaration files.

## Package Characteristics

- **npm dependencies**: base64-js, buffer, events_pkg (aliased), sha.js
- **Workspace dependencies**: @fluidframework/core-interfaces, @fluidframework/core-utils
- **Special compilation**: `.cts` files that compile to `.cjs` format
- **Circular dependency**: TypeScript source files import from generated `.cjs` files
- **Multiple entry points**: Browser and Node variants

## Investigation Findings

### The .cts Compilation Challenge

1. **File Structure**:
   - Source: `src/eventEmitter.cts`
   - Output: `lib/eventEmitter.cjs` (ESM build) and `dist/eventEmitter.cjs` (CJS build)
   - Declaration: `eventEmitter.d.cts`

2. **Import Pattern**:
   ```typescript
   // src/indexBrowser.ts, src/indexNode.ts, src/typedEventEmitter.ts
   import { EventEmitter } from "./eventEmitter.cjs";
   ```

3. **Build Dependency Issue**:
   - TypeScript source files (`.ts`) import from generated files (`.cjs`)
   - The `.cjs` files must be compiled BEFORE the main TypeScript compilation
   - Bazel's sandboxed compilation doesn't naturally support this pattern

### Attempted Solutions

#### Attempt 1: Separate .cts ts_project Target
```python
ts_project(
    name = "client_utils_cts",
    srcs = glob(["src/**/*.cts"]),
    out_dir = "lib",
    ...
)

ts_project(
    name = "client_utils_esm",
    srcs = glob(["src/**/*.ts"], exclude=["src/**/*.cts"]),
    deps = [":client_utils_cts"],  # Depend on .cts output
    ...
)
```

**Result**: ❌ TypeScript can't find `./eventEmitter.cjs` during compilation
**Issue**: The `.cjs` files are in `bazel-bin/` but TypeScript looks in `src/`

#### Attempt 2: Path Mapping in tsconfig
```json
{
  "paths": {
    "./eventEmitter.cjs": ["./lib/eventEmitter.cjs"]
  }
}
```

**Result**: ❌ Path mapping didn't resolve the module
**Issue**: TypeScript path resolution doesn't work for relative imports with explicit extensions

#### Attempt 3: Including .cts Output as srcs
```python
ts_project(
    name = "client_utils_esm",
    srcs = glob(["src/**/*.ts"]) + [":client_utils_cts"],
    ...
)
```

**Result**: ❌ Same module resolution error
**Issue**: Bazel target doesn't provide files in expected location for TypeScript

#### Attempt 4: rootDirs Configuration ✅ SUCCESS
```json
{
  "compilerOptions": {
    "rootDirs": ["./src", "./lib"]
  }
}
```

**Result**: ✅ Build succeeded!
**Solution**: TypeScript now treats src/ and lib/ as a unified virtual directory for module resolution

## Root Cause Analysis & Solution

### The Problem
TypeScript source files (`.ts`) import from generated `.cjs` files:
```typescript
import { EventEmitter } from "./eventEmitter.cjs";
```

When TypeScript compiles these files, it needs to find the type declarations for `./eventEmitter.cjs`. The `.cts` compilation produces `eventEmitter.d.cts` in the output directory (`lib/`), but TypeScript's module resolution for relative imports looks in the SOURCE directory (`src/`).

### The Solution: `rootDirs`

By configuring `rootDirs: ["./src", "./lib"]` in tsconfig, TypeScript treats both directories as a single virtual directory for module resolution. When resolving `./eventEmitter.cjs` from `src/indexBrowser.ts`, TypeScript now finds `lib/eventEmitter.d.cts`.

```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./lib",
    "rootDirs": ["./src", "./lib"]  // ← Key insight!
  }
}
```

This allows the build order:
1. Compile `.cts` → produces `.cjs` and `.d.cts` in `lib/`
2. Compile `.ts` → finds `.d.cts` via `rootDirs` configuration
3. Both builds succeed with proper type checking

## Files Created (for investigation)

- `packages/common/client-utils/BUILD.bazel` - Attempted build configuration
- `packages/common/client-utils/tsconfig.bazel.json` - ESM tsconfig (inline)
- `packages/common/client-utils/tsconfig.cjs.bazel.json` - CJS tsconfig (inline)
- `packages/common/client-utils/tsconfig.cts.bazel.json` - CTS tsconfig (inline)

## Final Build Configuration

### BUILD.bazel Structure
```python
# 1. Compile .cts files first (both ESM and CJS variants)
ts_project(name = "client_utils_cts", out_dir = "lib", ...)
ts_project(name = "client_utils_cts_cjs", out_dir = "dist", ...)

# 2. Main compilations depend on .cts outputs
ts_project(
    name = "client_utils_esm",
    deps = [":client_utils_cts", ...],  # ← Dependency ensures build order
)

ts_project(
    name = "client_utils_cjs",
    deps = [":client_utils_cts_cjs", ...],
)
```

### Key Attributes
- **`incremental = True`**: Match tsconfig.json settings
- **`composite = True`**: Required for project references
- **`rootDirs`**: Enable cross-directory module resolution

## Impact on Migration

✅ **Pattern Established**: `.cts` compilation pattern now documented and working
✅ **Reusable**: Any future packages with `.cts` files can use this approach
✅ **No Compromises**: Full TypeScript validation enabled, no shortcuts taken

## Key Learnings

1. **`rootDirs` is powerful**: Allows TypeScript to resolve modules across multiple directories
2. **User feedback matters**: The question "but typescript should handle the CJS import" led to the breakthrough
3. **Don't give up too early**: The solution was simpler than the initial deferral suggested
4. **.cts files are manageable**: They work fine in Bazel with proper tsconfig
5. **Build order via deps**: Bazel's `deps` attribute ensures correct compilation order

## Deliverables

✅ BUILD.bazel for client-utils with npm dependencies and .cts compilation
✅ Three inline tsconfig files (ESM, CJS, CTS)
✅ ESM build: 14 .js + 14 .d.ts files + source maps
✅ CJS build: 14 .js + 14 .d.ts files + source maps
✅ .cjs files: eventEmitter.cjs in both lib/ and dist/
✅ Pattern documentation for future .cts migrations

## Next Steps

1. **Validate all packages build together**: Ensure no breakage
2. **Update tracker**: Mark Session 2.4 as complete
3. **Commit changes**: Document .cts pattern success
4. **Session 2.5**: Continue with remaining Phase 2 packages

## Time Spent

- Investigation: 1.5 hours
- Attempts: 4 (3 failed, 1 success)
- Outcome: ✅ **SUCCESS** - Full migration complete with .cts pattern established

---

**Conclusion**: Great collaboration! User insight led to breakthrough. The `.cts` compilation pattern is now solved and documented for future packages.
