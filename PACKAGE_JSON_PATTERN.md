# Package.json Handling Pattern for Bazel ts_project

**Created**: 2025-10-29  
**Session**: 2.35  
**Context**: Resolved critical pattern issue during fluid-runner migration

---

## Problem Statement

Packages with TypeScript subpath exports (`/internal`, `/legacy`, `/beta`) require `package.json` for module type detection, but including it in `ts_project.srcs` causes build errors about expected outputs not being created.

### Initial Error

```
ERROR: output 'packages/tools/fluid-runner/lib/package.json' was not created
ERROR: Transpiling & type-checking TypeScript project failed: not all outputs were created or valid
```

### The Confusion

TypeScript doesn't transpile `package.json` - it only reads it for module detection. This led to the assumption that `package.json` shouldn't be in outputs, but `ts_project` was expecting it.

---

## Solution Pattern

### ✅ Correct Pattern

```python
ts_project(
    name = "my_package_esm",
    srcs = glob(
        ["src/**/*.ts"],
        exclude = ["src/test/**"],
    ) + ["package.json"],  # ✅ Include package.json
    composite = True,
    declaration = True,
    declaration_map = True,
    incremental = True,
    out_dir = "lib",
    root_dir = "src",
    source_map = True,
    # ✅ DO NOT set resolve_json_module (let it default to false)
    # ✅ DO NOT set ts_build_info_file (let it default to empty)
    tsconfig = ":tsconfig.bazel.json",
    deps = [...],
)
```

### ✅ Correct tsconfig.bazel.json

```json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "incremental": true,
    "inlineSources": true,
    "jsx": "react",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "Node16",
    "moduleResolution": "Node16",
    // ✅ DO NOT include "resolveJsonModule": true
    "noImplicitAny": false,
    "noUnusedLocals": true,
    "pretty": true,
    "sourceMap": true,
    "strict": true,
    "target": "ES2021",
    "rootDir": "./src",
    "outDir": "./lib",
    "types": ["node"],
    "noUncheckedIndexedAccess": false,
    "exactOptionalPropertyTypes": false
    // ✅ DO NOT include "tsBuildInfoFile": "./lib/.tsbuildinfo"
  },
  "include": ["src/**/*"],
  "exclude": ["src/test/**/*"]
}
```

---

## Why This Works

1. **ts_project special handling**: The `ts_project` rule recognizes `package.json` as a special file
2. **Passthrough file**: `package.json` is automatically copied to the output directory without transpilation
3. **Module detection**: TypeScript reads `package.json` during compilation to understand module type
4. **Validation match**: By NOT setting `resolve_json_module` and NOT including `resolveJsonModule`, the BUILD attributes match the tsconfig

---

## Common Mistakes to Avoid

### ❌ WRONG: Setting resolve_json_module

```python
ts_project(
    name = "my_package_esm",
    srcs = [...] + ["package.json"],
    resolve_json_module = True,  # ❌ This causes validation errors
    ...
)
```

**Error**: `attribute resolve_json_module=true does not match compilerOptions.resolveJsonModule=undefined`

### ❌ WRONG: Including resolveJsonModule in tsconfig

```json
{
  "compilerOptions": {
    "resolveJsonModule": true,  // ❌ Causes validation mismatch
    ...
  }
}
```

**Error**: `attribute resolve_json_module=false does not match compilerOptions.resolveJsonModule=true`

### ❌ WRONG: Setting ts_build_info_file

```python
ts_project(
    name = "my_package_esm",
    srcs = [...] + ["package.json"],
    ts_build_info_file = "lib/.tsbuildinfo",  # ❌ Causes validation errors
    ...
)
```

**Error**: `attribute ts_build_info_file= does not match compilerOptions.tsBuildInfoFile=lib/.tsbuildinfo`

### ❌ WRONG: Omitting package.json from srcs

```python
ts_project(
    name = "my_package_esm",
    srcs = glob(["src/**/*.ts"]),  # ❌ Missing package.json
    ...
)
```

**Error**: TypeScript TS1479 - "The current file is a CommonJS module whose imports will produce 'require' calls"

---

## When to Use This Pattern

Use this pattern for packages that:

1. Have subpath exports in `package.json` (`/internal`, `/legacy`, `/beta`)
2. Use `"moduleResolution": "Node16"` 
3. Import from other packages using subpath imports (e.g., `@fluidframework/telemetry-utils/internal`)

### Example Packages

- `@fluidframework/fluid-runner` (Session 2.35)
- `@fluidframework/odsp-driver` (Session 2.31)
- `@fluidframework/runtime-definitions` (Session 2.17)
- Most framework and service packages with `/internal` exports

---

## Comparison with Other Patterns

### Pattern 1: No package.json needed
**Use when**: Package has no subpath exports, standard `"type": "module"` in root package.json
```python
ts_project(
    srcs = glob(["src/**/*.ts"]),  # No package.json
    ...
)
```

### Pattern 2: package.json in srcs (THIS PATTERN)
**Use when**: Package has subpath exports (`/internal`, `/legacy`)
```python
ts_project(
    srcs = glob(["src/**/*.ts"]) + ["package.json"],  # Include package.json
    # No resolve_json_module or ts_build_info_file
    ...
)
```

### Pattern 3: src/package.json
**Use when**: Package needs different module type in source vs output (rare)
```python
ts_project(
    srcs = glob(["src/**/*.ts"]) + ["src/package.json"],
    ...
)
```

---

## Key Takeaways

1. ✅ **Include** `package.json` in `ts_project.srcs` for packages with subpath exports
2. ✅ **Omit** `resolve_json_module` from BUILD.bazel (let it default)
3. ✅ **Omit** `resolveJsonModule` from tsconfig.bazel.json (don't include it)
4. ✅ **Omit** `ts_build_info_file` from BUILD.bazel (let it default)
5. ✅ **Trust** ts_project to copy package.json automatically
6. ✅ **Keep** tsconfig options minimal - only include what differs from defaults

---

## References

- Session 2.35: fluid-runner migration (this pattern discovered)
- Session 2.31: odsp-driver migration (similar pattern used)
- Session 2.17: runtime-definitions migration (subpath exports pattern)
- BAZEL_MIGRATION_STATUS.md: Migration progress tracking
