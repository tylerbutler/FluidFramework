# Bazel Conventions for FluidFramework Migration

**Project**: FluidFramework TypeScript Monorepo
**Build System**: Bazel 8.4.2 with rules_js & rules_ts
**Document Version**: 1.0
**Last Updated**: 2025-10-27

---

## Table of Contents

1. [Target Naming Conventions](#target-naming-conventions)
2. [Dependency Management](#dependency-management)
3. [File Organization](#file-organization)
4. [TypeScript Configuration](#typescript-configuration)
5. [Build Patterns](#build-patterns)
6. [Path Mapping Patterns](#path-mapping-patterns)

---

## Target Naming Conventions

### Package Target Names

Convert package names to Bazel-safe target names:

**Pattern**: Replace `@`, `/`, and `-` characters with `_`

```python
# @fluidframework/core-interfaces → core_interfaces
# @fluidframework/driver-definitions → driver_definitions
# @fluid-internal/client-utils → fluid_internal_client_utils
```

### Module Format Suffixes

**ESM targets**: `<package_name>_esm`
```python
name = "core_interfaces_esm"
```

**CJS targets**: `<package_name>_cjs`
```python
name = "core_interfaces_cjs"
```

**Test targets**: `<package_name>_test`
```python
name = "core_interfaces_test"
```

**Main target**: `<package_name>` (filegroup aggregating ESM + CJS)
```python
filegroup(
    name = "core_interfaces",
    srcs = [
        ":core_interfaces_esm",
        ":core_interfaces_cjs",
    ],
)
```

---

## Dependency Management

### Cross-Package Dependencies

**Rule**: Always depend on the matching module format (ESM → ESM, CJS → CJS)

```python
# ESM target depends on ESM dependencies
ts_project(
    name = "driver_definitions_esm",
    deps = [
        "//packages/common/core-interfaces:core_interfaces_esm",
    ],
)

# CJS target depends on CJS dependencies
ts_project(
    name = "driver_definitions_cjs",
    deps = [
        "//packages/common/core-interfaces:core_interfaces_cjs",
    ],
)
```

### Dependency Path Format

**Pattern**: `//packages/<category>/<name>:<target>`

```python
# Full package dependency
"//packages/common/core-interfaces:core_interfaces_esm"

# Category wildcard (build all packages in category)
"//packages/common/..."

# Root wildcard (build everything)
"//..."
```

### External npm Dependencies

**Pattern**: Use npm_link_all_packages targets

```python
# In root BUILD.bazel
load("@npm//:defs.bzl", "npm_link_all_packages")

npm_link_all_packages(name = "node_modules")

# In package BUILD.bazel
deps = [
    "//:node_modules/@types/node",
    "//:node_modules/mocha",
]
```

---

## File Organization

### BUILD File Location

**Rule**: Place `BUILD.bazel` in package root directory

```
packages/common/core-interfaces/
├── BUILD.bazel              ← Bazel build file
├── package.json
├── tsconfig.bazel.json      ← ESM config
├── tsconfig.cjs.bazel.json  ← CJS config
└── src/
    ├── index.ts
    └── test/
        └── tsconfig.bazel.json  ← Test config
```

### TypeScript Config Files

**Pattern**: Use `.bazel.json` suffix for Bazel-specific configs

```
tsconfig.bazel.json       # ESM configuration
tsconfig.cjs.bazel.json   # CJS configuration
src/test/tsconfig.bazel.json  # Test configuration
```

**Why?**: Separates Bazel configs from npm/pnpm configs, prevents conflicts

---

## TypeScript Configuration

### Inline Configuration Pattern

**Rule**: Use self-contained tsconfig files without `extends` for Bazel

**Rationale**:
- Bazel sandbox isolation requires self-contained configs
- Avoids dependency on shared config files
- Enables full TypeScript validation (`validate = True`)

### ESM Configuration (`tsconfig.bazel.json`)

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "lib",
    "rootDir": "src",
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "paths": {
      "@fluidframework/core-interfaces": ["../core-interfaces/lib/index.d.ts"],
      "@fluidframework/core-interfaces/*": ["../core-interfaces/lib/*"]
    }
  },
  "include": ["src/**/*.ts"],
  "exclude": ["src/test/**/*"]
}
```

### CJS Configuration (`tsconfig.cjs.bazel.json`)

```json
{
  "extends": "./tsconfig.cjs.json",
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "Node10",
    "outDir": "dist",
    "rootDir": "src",
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "paths": {
      "@fluidframework/core-interfaces": ["../core-interfaces/dist/index.d.ts"],
      "@fluidframework/core-interfaces/*": ["../core-interfaces/dist/*"]
    }
  },
  "include": ["src/**/*.ts"],
  "exclude": ["src/test/**/*"]
}
```

### Key Configuration Attributes

**Required for ts_project**:
```python
composite = True,           # Enable project references
declaration = True,         # Generate .d.ts files
declaration_map = True,     # Generate .d.ts.map files
source_map = True,          # Generate .js.map files
transpiler = "tsc",         # Use TypeScript compiler (not swc)
ts_version = "5.4.5",       # Exact version (not semver range)
validate = True,            # Enable full type checking (default)
```

---

## Build Patterns

### Standard Package BUILD.bazel

**IMPORTANT**: Always include `out_dir` and `root_dir` attributes (see Critical section below).

```python
load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
load("@aspect_rules_js//js:defs.bzl", "js_library")
load("@aspect_rules_js//npm:defs.bzl", "npm_package")
load("@npm//:defs.bzl", "npm_link_all_packages")

package(default_visibility = ["//visibility:public"])

# Link npm packages for this workspace package
npm_link_all_packages(name = "node_modules")

# ESM compilation
ts_project(
    name = "core_interfaces_esm",
    srcs = glob(
        ["src/**/*.ts"],
        exclude = ["src/test/**"],
    ),
    declaration = True,
    declaration_map = True,
    incremental = True,
    source_map = True,
    composite = True,
    out_dir = "lib",           # CRITICAL: ESM output directory
    root_dir = "src",          # CRITICAL: Source root directory
    tsconfig = ":tsconfig.bazel.json",
    deps = [
        # Workspace dependencies here
    ],
)

# CJS compilation
ts_project(
    name = "core_interfaces_cjs",
    srcs = glob(
        ["src/**/*.ts"],
        exclude = ["src/test/**"],
    ),
    declaration = True,
    declaration_map = True,
    incremental = True,
    source_map = True,
    composite = True,
    out_dir = "dist",          # CRITICAL: CJS output directory
    root_dir = "src",          # CRITICAL: Source root directory
    transpiler = "tsc",        # REQUIRED for CJS
    tsconfig = ":tsconfig.cjs.bazel.json",
    deps = [
        # Workspace dependencies here
    ],
)

# js_library wrapper with package.json (for subpath exports)
js_library(
    name = "lib",
    srcs = [
        ":core_interfaces_esm",
        ":core_interfaces_cjs",
        "package.json",        # REQUIRED for /internal, /legacy exports
    ],
)

# npm_package - REQUIRED for npm_link_all_packages
npm_package(
    name = "pkg",
    srcs = [":lib"],
    package = "@fluidframework/core-interfaces",
    visibility = ["//visibility:public"],
)

# Backward compatibility filegroup
filegroup(
    name = "core_interfaces",
    srcs = [":lib"],
)
```

### ⚠️ CRITICAL: Output Directory Configuration

**ALWAYS specify `out_dir` and `root_dir` in ts_project targets.**

Without explicit `out_dir` and `root_dir` attributes, TypeScript may output files to unexpected locations, breaking npm_link resolution for packages with subpath exports.

**Required Pattern**:
```python
ts_project(
    name = "package_name_esm",
    out_dir = "lib",      # REQUIRED for ESM
    root_dir = "src",     # REQUIRED for predictable output
    # ... other attributes
)

ts_project(
    name = "package_name_cjs",
    out_dir = "dist",     # REQUIRED for CJS
    root_dir = "src",     # REQUIRED for predictable output
    transpiler = "tsc",   # REQUIRED for CJS
    # ... other attributes
)
```

**Why This Matters**:
- ESM outputs must go to `lib/` for npm_link to resolve package.json exports
- CJS outputs must go to `dist/` to match package.json exports
- Without `out_dir`, ts_project may mirror source structure (outputs to `src/`)
- Packages with `/internal` or `/legacy` subpath exports **require** lib/ directory
- npm_link_all_packages points to Bazel outputs, expects lib/ and dist/ structure

**Discovered In**: Session 2.38 - file-driver BUILD was missing out_dir, causing replay-tool import failures

### Build Commands

```bash
# Build ESM only
bazel build //packages/common/core-interfaces:core_interfaces_esm

# Build CJS only
bazel build //packages/common/core-interfaces:core_interfaces_cjs

# Build both (ESM + CJS)
bazel build //packages/common/core-interfaces:core_interfaces

# Build all packages in a category
bazel build //packages/common/...

# Build everything
bazel build //...
```

---

## Path Mapping Patterns

### Basic Package Import

For simple package imports without subpaths:

```json
{
  "paths": {
    "@fluidframework/core-interfaces": ["../core-interfaces/lib/index.d.ts"],
    "@fluidframework/core-interfaces/*": ["../core-interfaces/lib/*"]
  }
}
```

### Subpath Exports

For packages with subpath exports like `/internal`:

```json
{
  "paths": {
    "@fluidframework/driver-definitions": ["../driver-definitions/lib/index.d.ts"],
    "@fluidframework/driver-definitions/internal": ["../driver-definitions/lib/index.d.ts"],
    "@fluidframework/driver-definitions/*": ["../driver-definitions/lib/*"]
  }
}
```

**Pattern**: Explicitly map each subpath export to prevent module resolution errors

### Multi-Level Dependencies

For packages with transitive dependencies:

```json
{
  "paths": {
    // Direct dependencies
    "@fluidframework/driver-definitions": ["../driver-definitions/lib/index.d.ts"],
    "@fluidframework/driver-definitions/internal": ["../driver-definitions/lib/index.d.ts"],
    "@fluidframework/driver-definitions/*": ["../driver-definitions/lib/*"],

    // Transitive dependencies (must also be mapped)
    "@fluidframework/core-interfaces": ["../../core-interfaces/lib/index.d.ts"],
    "@fluidframework/core-interfaces/*": ["../../core-interfaces/lib/*"]
  }
}
```

**Note**: All dependencies in the chain must have path mappings

### Path Mapping by Module Format

**ESM**: Point to `lib/` directory
```json
"@fluidframework/core-interfaces": ["../core-interfaces/lib/index.d.ts"]
```

**CJS**: Point to `dist/` directory
```json
"@fluidframework/core-interfaces": ["../core-interfaces/dist/index.d.ts"]
```

**Why?**: Matches the actual build output directories

---

## Architecture Decisions

### Inline tsconfig Files (No extends)

**Decision**: Use self-contained tsconfig files instead of extending shared configs

**Pros**:
- Bazel sandbox isolation works correctly
- Full TypeScript validation enabled
- No dependency on shared config file resolution
- Clearer build dependency graph

**Cons**:
- More configuration duplication
- Updates to shared patterns require manual propagation

**Verdict**: ✅ Accepted - Reliability and validation quality > DRY principle

### TypeScript Path Mappings for Dependencies

**Decision**: Use TypeScript `paths` compiler option for workspace imports

**Pros**:
- Enables package-name imports in source code
- No need for relative import paths
- Matches npm-style module resolution
- Works within Bazel sandbox

**Cons**:
- Can cause OOM (out of memory) errors at scale
- Requires manual configuration for each dependency
- Duplicates information in BUILD deps

**Verdict**: ✅ Accepted with caution - Monitor memory usage, use carefully

**Future**: Investigate alternatives for large-scale dependency graphs

### Dual Compilation (ESM + CJS)

**Decision**: Separate ts_project targets for ESM and CJS

**Pros**:
- Explicit module format control
- Independent caching for each format
- Matches existing package.json dual exports
- Parallel compilation possible

**Cons**:
- Double compilation time
- More targets to maintain

**Verdict**: ✅ Accepted - Required for npm compatibility

---

## Best Practices

### 1. Build Incrementally

Start with leaf packages (zero dependencies) and work up the dependency tree:

```bash
# Build order
1. packages/common/core-interfaces (zero deps)
2. packages/common/driver-definitions (depends on core-interfaces)
3. packages/common/container-definitions (depends on driver-definitions)
```

### 2. Validate Dependency Graph

Use `bazel query` to verify dependencies:

```bash
# Show all dependencies of a target
bazel query "deps(//packages/common/container-definitions:container_definitions_esm)"

# Show dependency path between two targets
bazel query "allpaths(//packages/common/container-definitions:container_definitions_esm, //packages/common/core-interfaces:core_interfaces_esm)"

# Visualize dependency graph
bazel query "deps(//packages/common/...)" --output=graph > deps.dot
```

### 3. Leverage Build Caching

```bash
# Use disk cache (automatic via .bazelrc)
bazel build //packages/common/core-interfaces:core_interfaces

# Cached rebuild (< 1s)
bazel build //packages/common/core-interfaces:core_interfaces
INFO: Build completed successfully, 0 total actions
```

### 4. Clean Builds When Needed

```bash
# Clean all build outputs
bazel clean

# Clean and rebuild
bazel clean && bazel build //packages/common/...
```

---

## Common Patterns

### Export Shared TypeScript Config

```python
# common/build/build-common/BUILD.bazel
load("@aspect_rules_js//js:defs.bzl", "js_library")

# Export tsconfig files as targets
js_library(
    name = "tsconfig_base_esm",
    srcs = ["tsconfig.base.esm.json"],
    visibility = ["//visibility:public"],
)
```

### Multi-Package Build

```python
# Root BUILD.bazel
filegroup(
    name = "all_common_packages",
    srcs = [
        "//packages/common/core-interfaces:core_interfaces",
        "//packages/common/driver-definitions:driver_definitions",
        "//packages/common/container-definitions:container_definitions",
    ],
)
```

---

## Troubleshooting

### ⚠️ CRITICAL: Cannot find module with /internal subpath

**Symptom**: `TS2307: Cannot find module '@fluidframework/package/internal' or its corresponding type declarations`

**Root Cause**: Package BUILD.bazel missing `out_dir` attribute, causing ESM outputs to go to wrong directory

**Example Error**:
```
packages/tools/replay-tool/src/replayMessages.ts:34:8 - error TS2307: Cannot find module '@fluidframework/file-driver/internal'
```

**Solution**: Add explicit `out_dir` and `root_dir` to ts_project:
```python
ts_project(
    name = "package_name_esm",
    out_dir = "lib",      # REQUIRED: ESM outputs must go to lib/
    root_dir = "src",     # REQUIRED: Predictable output structure
    # ... other attributes
)
```

**Why It Happens**:
- Without `out_dir`, ts_project mirrors source structure (outputs to `src/`)
- npm_link expects lib/ directory for package.json exports resolution
- Packages with subpath exports (/internal, /legacy) require lib/ structure
- TypeScript cannot resolve subpaths when package structure is incorrect

**Prevention**: Always use the standard BUILD pattern with explicit out_dir (see Build Patterns section)

**Discovered In**: Session 2.38 - file-driver missing out_dir blocked replay-tool migration

### Module Resolution Errors

**Symptom**: `Cannot find module '@fluidframework/core-interfaces'`

**Solution**: Add TypeScript path mapping to tsconfig.bazel.json:
```json
{
  "paths": {
    "@fluidframework/core-interfaces": ["../core-interfaces/lib/index.d.ts"]
  }
}
```

### Out of Memory Errors

**Symptom**: `JavaScript heap out of memory` during compilation

**Potential Causes**:
- Too many TypeScript path mappings
- Circular dependencies
- Large source files

**Solutions**:
1. Reduce path mapping scope
2. Increase Node.js memory: `NODE_OPTIONS=--max_old_space_size=8192`
3. Use `validate = False` as last resort (NOT recommended)

### TypeScript Version Mismatch

**Symptom**: Unexpected TypeScript errors or compilation failures

**Solution**: Use exact version in WORKSPACE.bazel:
```python
rules_ts_dependencies(ts_version = "5.4.5")  # Exact, not "~5.4.5"
```

---

## Version Information

**Bazel Version**: 8.4.2 (via Bazelisk)
**rules_js Version**: 2.4.0
**rules_ts Version**: 3.6.3
**TypeScript Version**: 5.4.5
**Node Version**: 18.20.8 (workspace expects ≥20.15.1)
**pnpm Version**: 8.15.9

---

## Related Documentation

- [BAZEL_MIGRATION_PLAN.md](./BAZEL_MIGRATION_PLAN.md) - Overall migration strategy
- [BAZEL_MIGRATION_TRACKER.md](./BAZEL_MIGRATION_TRACKER.md) - Progress tracking
- [BAZEL_MIGRATION_ISSUES.md](./BAZEL_MIGRATION_ISSUES.md) - Known issues and solutions
- [SESSION_*.md](./SESSION_1.2_SUMMARY.md) - Individual session notes

---

**Document Created**: 2025-10-27
**Author**: Bazel Migration PoC (Phase 1)
**Status**: Living document - will be updated as patterns evolve
