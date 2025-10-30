# Bazel Quick Reference

One-page reference for common Bazel commands and workflows.

## Essential Commands

| Task | Command |
|------|---------|
| **Build a package** | `bazel build //packages/category/name:all` |
| **Build everything** | `bazel build //...` |
| **Run tests** | `bazel test //packages/category/name:test` |
| **Run all tests** | `bazel test //...` |
| **Format code** | `bazel run //:format` |
| **Check format** | `bazel run //:format_check` |
| **Clean outputs** | `bazel clean` |
| **Deep clean** | `bazel clean --expunge` |

## Target Types

| Target Suffix | Purpose | Example |
|---------------|---------|---------|
| `*_esm` | ESM TypeScript compilation | `:core_interfaces_esm` |
| `*_cjs` | CJS TypeScript compilation | `:core_interfaces_cjs` |
| `*_pkg` | npm package (single format) | `:core_interfaces_esm_pkg` |
| `:pkg` | Final publishable package | `:pkg` |
| `:test` | Test execution | `:test` |
| `:package_test` | Test compilation | `:package_test` |
| `:all` | All targets in package | `:all` |

## Label Format

```
//path/to/package:target_name
└─┬──┘ └────┬────┘ └─────┬─────┘
  │         │            │
  Required  Package path Target name
```

Examples:
- `//packages/common/core-interfaces:core_interfaces_esm`
- `//packages/utils/tool-utils:test`
- `//packages/dds/map:pkg`

## Build Options

| Option | Effect |
|--------|--------|
| `--test_output=all` | Show all test output |
| `--test_output=errors` | Show only test failures |
| `--keep_going` | Continue on errors |
| `--verbose_failures` | Show detailed error info |
| `--jobs=N` | Limit parallel jobs |

Example:
```bash
bazel test //... --test_output=errors --keep_going
```

## Query Commands

| Query | Purpose |
|-------|---------|
| `bazel query //package:*` | List all targets |
| `bazel query "deps(:target)"` | Show dependencies |
| `bazel query "rdeps(//..., :target)"` | Show reverse deps |
| `bazel query 'kind(mocha_test, //...)'` | Find test targets |
| `bazel query 'kind(ts_project, //...)'` | Find TypeScript targets |

## Common Patterns

### Build and Test a Package

```bash
bazel build //packages/common/core-interfaces:all
bazel test //packages/common/core-interfaces:test
```

### Build Multiple Packages

```bash
# All packages in a directory
bazel build //packages/common/...

# All packages
bazel build //...
```

### Run Tests with Output

```bash
# All output
bazel test //packages/common/core-interfaces:test --test_output=all

# Errors only
bazel test //... --test_output=errors
```

### CI Workflow

```bash
# 1. Check formatting
bazel run //:format_check

# 2. Build all
bazel build //... --keep_going

# 3. Test all
bazel test //... --keep_going --test_output=errors
```

## Directory Structure

```
your-package/
├── BUILD.bazel              # Build configuration
├── tsconfig.json            # IDE TypeScript config
├── tsconfig.bazel.json      # Bazel TypeScript config
├── package.json
├── src/
│   └── *.ts                 # Source files
└── test/
    └── *.spec.ts            # Test files
```

## Build Outputs

```
bazel-bin/packages/common/core-interfaces/
├── core_interfaces_esm/     # ESM compiled output
│   ├── src/                 # .js files
│   └── package.json
├── core_interfaces_cjs/     # CJS compiled output
│   ├── src/                 # .js files
│   └── package.json
└── pkg/                     # Final package
    ├── esm/                 # -> core_interfaces_esm
    ├── cjs/                 # -> core_interfaces_cjs
    └── package.json
```

## Dependencies in BUILD.bazel

### For TypeScript Compilation

```python
deps = [
    # Workspace packages (need ESM for types)
    "//packages/other-package:other_package_esm",
    
    # npm packages
    "//:node_modules/@types/node",
]
```

### For Tests

```python
deps = [
    # Self-references
    ":package_name_esm",       # For compiling tests
    ":pkg",                    # For runtime
    
    # Other packages
    "//other-package:other_package_esm",
    "//other-package:pkg",
]
```

### For Test Data

```python
mocha_bin.mocha_test(
    name = "test",
    data = [
        ":package_test",       # Compiled test files
        ":pkg",                # Runtime package
        "package.json",        # For ESM detection (required!)
    ],
)
```

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| "Cannot find module" | Add to `deps` in BUILD.bazel |
| Test ESM errors | Add `package.json` to mocha_test `data` |
| Stale cache | `bazel clean` |
| Random failures | `bazel clean --expunge` |
| Build too slow | First build is always slow, cache helps after |
| Out of disk space | `bazel clean --expunge` |

## Configuration Files

| File | Purpose |
|------|---------|
| `.bazelversion` | Bazel version (8.4.2) |
| `WORKSPACE.bazel` | External dependencies |
| `.bazelrc` | Build settings |
| `BUILD.bazel` | Per-package builds |
| `tsconfig.bazel.json` | TypeScript config |

## Help Commands

```bash
bazel help                   # General help
bazel help build            # Build command help
bazel help test             # Test command help
bazel help query            # Query command help
bazel version               # Show version
bazel info                  # Show workspace info
```

## Environment

- **Bazel Version**: 8.4.2 (managed by Bazelisk)
- **Node Version**: See [.nvmrc](../../.nvmrc)
- **Cache Location**: `~/.cache/bazel`
- **Build Outputs**: `bazel-bin/` (symlink in workspace)

## Quick Links

- [Getting Started](./GETTING_STARTED.md) - Detailed setup guide
- [FAQ](./FAQ.md) - Common questions
- [Commands](./COMMANDS.md) - Full command reference
- [Troubleshooting](./TROUBLESHOOTING.md) - Detailed solutions
- [Migration Status](../../BAZEL_MIGRATION_STATUS.md) - Current status

## Remember

1. **First build is slow** - Bazel compiles everything from scratch
2. **Second build is fast** - Aggressive caching kicks in
3. **Clean when weird** - `bazel clean` fixes most issues
4. **Build what you need** - Don't always build `//...`
5. **Tests need package.json** - In mocha_test data array

---

**Print this page** or keep it handy while learning Bazel!

**Last Updated**: 2025-10-30 | **Bazel Version**: 8.4.2
