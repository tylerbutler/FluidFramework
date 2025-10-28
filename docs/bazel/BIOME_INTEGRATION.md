# Biome Lint/Format Integration (Session 2.12)

## Overview

Root-level Bazel targets for workspace-wide Biome formatting and linting operations.

## Usage

```bash
# Format entire workspace (applies fixes)
bazel run //:format

# Check formatting without modifying files (CI/validation)
bazel run //:format_check
```

## Implementation Details

### Approach: Workspace-Aware Wrapper Script

The Biome targets use a shell wrapper script (`tools/bazel/run-biome.sh`) that:

1. Changes directory to `BUILD_WORKSPACE_DIRECTORY` (workspace root)
2. Executes `pnpm biome` with the specified arguments
3. Ensures Biome can find:
   - Root `biome.jsonc` configuration
   - Nested package-specific `biome.jsonc` configs
   - All source files across the workspace

### Why This Approach?

**Problem**: Bazel runs binaries from the `bazel-bin` directory, not the workspace root. Biome needs to:
- Find `biome.jsonc` in the workspace root
- Access source files with relative paths
- Discover nested configuration files

**Solution**: The wrapper script uses Bazel's `BUILD_WORKSPACE_DIRECTORY` environment variable to change to the workspace root before running Biome.

### Nested Configuration Discovery

Biome automatically discovers and applies nested `biome.jsonc` configurations:

**Root Config**: `/biome.jsonc`
- Comprehensive shared configuration
- Default formatter and linter settings
- File ignore patterns

**Nested Configs**: Various packages have their own `biome.jsonc`
- Example: `experimental/dds/tree/biome.jsonc`
- Uses `"extends": ["../../../biome.jsonc"]`
- Override specific settings (e.g., lineWidth, quoteStyle)

**Bazel Integration**: The wrapper approach ensures Biome runs from the workspace root, allowing it to naturally discover all nested configs just like the current `pnpm run format:biome` workflow.

## Comparison with Current Workflow

### Current (fluid-build)
```bash
pnpm run format:biome
# → fluid-build --task format:biome
# → Orchestrates per-package biome check commands
```

### Bazel
```bash
bazel run //:format
# → Wrapper script changes to workspace root
# → Executes: pnpm biome check . --write
```

**Benefits**:
- Single command for entire workspace
- Simpler than per-package orchestration
- Honors all nested biome.jsonc configs
- Works from any directory (via `bazel run`)

## Files

- **Root BUILD.bazel**: Target definitions (`//:format`, `//:format_check`)
- **tools/bazel/run-biome.sh**: Wrapper script
- **tools/bazel/BUILD.bazel**: Exports wrapper script
- **biome.jsonc**: Root Biome configuration

## CI Integration

For CI workflows, use the `format_check` target:

```bash
# Check formatting without modifying files
bazel run //:format_check

# Exit code 0: No issues
# Exit code non-zero: Formatting errors detected
```

## Future Enhancements

### Optional: Per-Package Targets

Currently, we use root-level targets for simplicity. If developer workflow requires per-package formatting:

```python
# Example per-package target (not currently implemented)
biome_bin.biome_binary(
    name = "format",
    args = ["check", ".", "--write"],
    chdir = package_name(),
)
```

### Build Integration

Biome format checking could be added as a build dependency:

```python
# Potential future integration
ts_project(
    name = "my_package",
    srcs = [...],
    deps = [...],
    # Format check before build
    data = ["//:format_check"],
)
```

## Troubleshooting

### "No files were processed"

**Cause**: Biome not finding biome.jsonc or source files
**Solution**: Ensure running via `bazel run` (not `bazel build`), which sets BUILD_WORKSPACE_DIRECTORY

### "Cannot read file biome.jsonc"

**Cause**: Wrapper script not changing to workspace root
**Solution**: Verify `tools/bazel/run-biome.sh` is executable (`chmod +x`)

### Nested config not applied

**Cause**: Biome running from wrong directory
**Solution**: The wrapper approach ensures correct directory; verify biome.jsonc has correct `"extends"` path

## References

- Migration Plan: Session 2.12
- FluidFramework Biome Config: `/biome.jsonc`
- Biome Documentation: https://biomejs.dev/
- Bazel BUILD_WORKSPACE_DIRECTORY: https://bazel.build/docs/user-manual#running-executables
