# Including package.json in ts_project srcs - Best Practice

**Status**: 📋 **REQUIRED** - Standard practice for all Bazel TypeScript builds
**Created**: Session 2.17 (2025-10-28)
**Impact**: Prevents TS1479 errors and ensures correct module detection

## Why package.json Must Be in srcs

TypeScript needs access to package.json to correctly determine:
1. **Module format** - The `"type": "module"` field tells TypeScript to treat .ts files as ESM
2. **Export conditions** - Package exports configuration affects module resolution
3. **Dependencies** - Understanding the package's dependency context
4. **Configuration** - Any TypeScript-relevant package configuration

Without package.json in the Bazel sandbox, TypeScript:
- Cannot see the `"type": "module"` field
- Defaults to treating .ts files as CommonJS
- May produce TS1479 errors for ESM packages
- Behaves differently than in npm builds

## Implementation

### Standard Pattern

```python
ts_project(
    name = "my_package_esm",
    srcs = glob(
        ["src/**/*.ts"],
        exclude = ["src/test/**"],
    ) + ["package.json"],  # ALWAYS include this
    # ... rest of configuration
)
```

### Both ESM and CJS Builds

```python
# ESM compilation
ts_project(
    name = "my_package_esm",
    srcs = glob(
        ["src/**/*.ts"],
        exclude = ["src/test/**"],
    ) + ["package.json"],  # Include package.json so TypeScript sees the "type": "module"
    out_dir = "lib",
    # ... rest of configuration
)

# CommonJS compilation
ts_project(
    name = "my_package_cjs",
    srcs = glob(
        ["src/**/*.ts"],
        exclude = ["src/test/**"],
    ) + ["package.json"],  # Include package.json for consistent behavior
    out_dir = "dist",
    # ... rest of configuration
)
```

## Tools and Automation

### 1. Create New BUILD.bazel Files

Use the provided script to create BUILD.bazel with package.json included:

```bash
./tools/bazel/create-build-bazel.sh packages/your-package
```

### 2. Update Existing BUILD.bazel Files

Fix existing BUILD.bazel files to include package.json:

```bash
python3 ./tools/bazel/add_package_json_to_srcs.py
```

### 3. Verify Your BUILD.bazel

Check that package.json is included:

```bash
grep 'package.json' packages/your-package/BUILD.bazel
```

Should output lines like:
```
    ) + ["package.json"],  # Include package.json so TypeScript sees the "type": "module"
```

## Common Issues Without package.json

### TS1479 Error

```
error TS1479: The current file is a CommonJS module whose imports will
produce 'require' calls; however, the referenced file is an ECMAScript
module and cannot be imported with 'require'.
```

**Cause**: TypeScript doesn't see `"type": "module"` and treats files as CommonJS
**Solution**: Add package.json to srcs

### Module Resolution Differences

Without package.json, TypeScript may:
- Resolve modules differently than npm build
- Fail to recognize package exports
- Use wrong module format assumptions

## Migration Checklist

When migrating a package to Bazel:

- [ ] Include package.json in ts_project srcs for ESM build
- [ ] Include package.json in ts_project srcs for CJS build
- [ ] Verify no TS1479 errors during build
- [ ] Test that module resolution matches npm build behavior

## Examples from FluidFramework

All successfully migrated packages include package.json:

```python
# From id-compressor/BUILD.bazel
ts_project(
    name = "id_compressor_esm",
    srcs = glob(
        ["src/**/*.ts"],
        exclude = ["src/test/**"],
    ) + ["package.json"],  # Fixed TS1479 errors
    # ...
)

# From core-utils/BUILD.bazel
ts_project(
    name = "core_utils_esm",
    srcs = glob(
        ["src/**/*.ts"],
        exclude = ["src/test/**"],
    ) + ["package.json"],  # Ensures correct ESM detection
    # ...
)
```

## Best Practices Summary

1. **ALWAYS include package.json** in ts_project srcs
2. **Include for both ESM and CJS** builds
3. **Use provided scripts** for new migrations
4. **Verify with grep** that package.json is included
5. **Document the reason** with a comment

## Standard Comments

Use these standard comments to explain why package.json is included:

```python
# For ESM builds:
+ ["package.json"],  # Include package.json so TypeScript sees the "type": "module"

# For CJS builds:
+ ["package.json"],  # Include package.json for consistent behavior

# For packages without "type": "module":
+ ["package.json"],  # Include package.json for TypeScript module detection
```

## References

- [TS1479 Solution](../../TS1479_SOLUTION.md) - How this solution was discovered
- [TypeScript Module Detection](https://www.typescriptlang.org/docs/handbook/modules/theory.html#module-detection)
- [Bazel ts_project](https://github.com/aspect-build/rules_ts/blob/main/docs/rules.md#ts_project)