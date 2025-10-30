# Getting Started with Bazel in FluidFramework

This guide covers the basics of working with Bazel in the FluidFramework monorepo.

## Prerequisites

- **Git** with Git LFS
- **Node.js**: Version specified in [.nvmrc](../../.nvmrc)
- **Bazelisk**: Automatically installed via corepack

## Initial Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/microsoft/FluidFramework.git
   cd FluidFramework
   ```

2. **Enable corepack**:
   ```bash
   corepack enable
   ```

3. **Install dependencies**:
   ```bash
   pnpm install
   ```

4. **Verify Bazel is working**:
   ```bash
   bazel version
   ```
   This should display Bazel version 8.4.2 (automatically managed by Bazelisk).

## Common Commands

### Building

```bash
# Build a specific package (both ESM and CJS)
bazel build //packages/common/core-interfaces:core_interfaces

# Build only ESM output
bazel build //packages/common/core-interfaces:core_interfaces_esm

# Build only CJS output
bazel build //packages/common/core-interfaces:core_interfaces_cjs

# Build all packages
bazel build //...

# Build a specific directory
bazel build //packages/common/...
```

### Testing

```bash
# Run tests for a specific package
bazel test //packages/common/core-interfaces:test

# Run all tests
bazel test //...

# Run tests with verbose output
bazel test //packages/common/core-interfaces:test --test_output=all
```

### Formatting

```bash
# Format all code
bazel run //:format

# Check formatting without making changes (CI)
bazel run //:format_check
```

### Querying

```bash
# List all targets in a package
bazel query //packages/common/core-interfaces:*

# Show dependencies of a target
bazel query "deps(//packages/common/core-interfaces:core_interfaces_esm)"

# Show reverse dependencies (what depends on this)
bazel query "rdeps(//..., //packages/common/core-interfaces:core_interfaces_esm)"

# Find all test targets
bazel query 'kind(mocha_test, //...)'
```

## Understanding Build Outputs

Bazel stores all build outputs in the `bazel-bin/` directory (symlinked from project root).

For a package like `@fluidframework/core-interfaces`:

```
bazel-bin/packages/common/core-interfaces/
├── core_interfaces_esm/          # ESM output
│   ├── src/                      # Compiled .js files
│   └── package.json              # npm_package output
├── core_interfaces_cjs/          # CJS output
│   ├── src/                      # Compiled .js files
│   └── package.json              # npm_package output
└── core_interfaces/              # Combined package
    ├── esm/                      # -> core_interfaces_esm
    ├── cjs/                      # -> core_interfaces_cjs
    └── package.json
```

## Working with Individual Packages

Each package has a `BUILD.bazel` file that defines build targets:

- **`<package>_esm`**: TypeScript compilation to ESM format
- **`<package>_cjs`**: TypeScript compilation to CJS format
- **`<package>_esm_pkg`**: npm package for ESM
- **`<package>_cjs_pkg`**: npm package for CJS
- **`<package>`**: Combined dual-format package
- **`pkg`**: Final publishable package
- **`test`**: Mocha test suite
- **`package_test`**: TypeScript compilation of tests

## Build Configuration

### TypeScript Configuration

Each package uses two TypeScript configs:
- **`tsconfig.json`**: Original configuration (for IDE)
- **`tsconfig.bazel.json`**: Bazel-specific configuration

The Bazel config typically:
- Extends the original tsconfig
- Adds composite project settings
- Configures proper module resolution

### Bazel Configuration Files

- **`WORKSPACE.bazel`**: Workspace setup, rules configuration
- **`.bazelrc`**: Build settings, caching configuration
- **`.bazelversion`**: Pinned Bazel version (8.4.2)
- **`MODULE.bazel`**: Bzlmod configuration (future)

## Caching

Bazel uses aggressive caching to speed up builds:

- **Local cache**: `~/.cache/bazel` (disk cache)
- **Remote cache**: Configured but requires Docker setup (see [REMOTE_CACHE_SETUP.md](../../REMOTE_CACHE_SETUP.md))

To clear the cache:
```bash
bazel clean
bazel clean --expunge  # More thorough
```

## IDE Integration

### VS Code

The repository includes VS Code configuration for:
- Building with Bazel (Ctrl+Shift+B)
- Debugging tests (F5 from test files)

### TypeScript Language Server

Your IDE should use the regular `tsconfig.json` files for IntelliSense. Bazel's TypeScript compilation is separate and happens during builds.

## Next Steps

- **Command Reference**: See [COMMANDS.md](./COMMANDS.md) for comprehensive command list
- **Troubleshooting**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
- **Integration Docs**: 
  - [API_EXTRACTOR_INTEGRATION.md](./API_EXTRACTOR_INTEGRATION.md)
  - [BIOME_INTEGRATION.md](./BIOME_INTEGRATION.md)
  - [MOCHA_TEST_INTEGRATION.md](./MOCHA_TEST_INTEGRATION.md)

## Additional Resources

- [Bazel Documentation](https://bazel.build/docs)
- [rules_js Documentation](https://github.com/aspect-build/rules_js)
- [rules_ts Documentation](https://github.com/aspect-build/rules_ts)
