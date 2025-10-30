# Bazel Frequently Asked Questions (FAQ)

Common questions and answers about using Bazel in the FluidFramework monorepo.

## General Questions

### What is Bazel?

Bazel is a build and test tool that provides fast, correct, and reproducible builds. It's designed for large monorepos and uses aggressive caching and parallelization.

### Why did we switch to Bazel?

We migrated from fluid-build to Bazel for:
- **Better performance**: Incremental builds and caching
- **Correctness**: Hermetic builds ensure reproducibility
- **Scale**: Better support for large monorepos
- **Industry standard**: Widely adopted and maintained

### Do I need to learn Starlark?

**For most developers: No.** You'll primarily run `bazel build` and `bazel test` commands. BUILD files are already set up.

**For package maintainers: Basic knowledge helps** when adding new packages or modifying build logic.

### What happened to `npm run build`?

It's been replaced with Bazel commands:
- Old: `npm run build`
- New: `bazel build //...` or `bazel build //packages/your-package:all`

### What happened to `npm test`?

It's been replaced with:
- Old: `npm test`
- New: `bazel test //packages/your-package:test`

## Getting Started

### How do I install Bazel?

You don't need to! Bazelisk (included via corepack) automatically manages the correct Bazel version.

Just run:
```bash
corepack enable
pnpm install
bazel version  # Verifies it works
```

### What's the first thing I should build?

Try building a single package first:
```bash
bazel build //packages/common/core-interfaces:core_interfaces
```

Then try running its tests:
```bash
bazel test //packages/common/core-interfaces:test
```

### How do I build everything?

```bash
bazel build //...
```

Note: This builds ALL packages and can take time. Usually you only need to build what you're working on.

## Daily Workflows

### I'm working on one package. What do I run?

```bash
# Build your package
bazel build //packages/category/your-package:all

# Run its tests
bazel test //packages/category/your-package:test

# Format your code
bazel run //:format
```

### How do I run tests in watch mode?

Bazel doesn't have built-in watch mode, but you can use:

```bash
# Option 1: Run tests after each build
bazel test //packages/your-package:test

# Option 2: Use ibazel (if available)
ibazel test //packages/your-package:test
```

### How do I see test output?

```bash
# Show all output
bazel test //packages/your-package:test --test_output=all

# Show only errors
bazel test //packages/your-package:test --test_output=errors
```

### How do I format code?

```bash
# Format all files
bazel run //:format

# Check formatting (CI mode)
bazel run //:format_check
```

### My build is slow. What do I do?

1. **First time builds are slow** - Bazel needs to compile everything once
2. **Second builds are fast** - Bazel caches aggressively
3. **Clean your cache** if things seem wrong:
   ```bash
   bazel clean
   ```
4. **Use remote cache** (if configured) for better team-wide caching

## Dependencies

### How do I add an npm dependency?

1. Add to `package.json`:
   ```json
   {
     "dependencies": {
       "new-package": "^1.0.0"
     }
   }
   ```

2. Install it:
   ```bash
   pnpm install
   ```

3. Sync Bazel:
   ```bash
   bazel sync
   ```

4. Reference in BUILD.bazel:
   ```python
   deps = [
       "//:node_modules/new-package",
   ]
   ```

### How do I depend on another workspace package?

In your `BUILD.bazel`:
```python
deps = [
    "//packages/other/package:other_package_esm",  # For TypeScript compilation
    "//packages/other/package:pkg",                 # For runtime
]
```

### Why do I need both `:package_esm` and `:pkg`?

- **`:package_esm`**: Provides TypeScript types for compilation
- **`:pkg`**: Provides the actual runtime package with all files

Both are needed for proper module resolution.

## Troubleshooting

### "Cannot find module" errors

Make sure you have both compilation and runtime dependencies:
```python
deps = [
    ":your_package_esm",           # Self for tests
    ":pkg",                        # Self runtime
    "//other:other_package_esm",   # External compilation
    "//other:pkg",                 # External runtime
]
```

### Tests fail with ESM errors

Ensure your `mocha_test` has `package.json` in data:
```python
mocha_bin.mocha_test(
    name = "test",
    data = [
        ":package_test",
        ":pkg",
        "package.json",  # Required!
    ],
    ...
)
```

### Build fails randomly

Try cleaning:
```bash
bazel clean
bazel build //packages/your-package:all
```

### My changes aren't reflected

1. Check you're building the right target
2. Clear cache: `bazel clean`
3. Verify your files are in `srcs` of BUILD.bazel

## Understanding Bazel

### What are targets?

Targets are buildable units. Common ones:
- `ts_project`: Compiles TypeScript
- `npm_package`: Creates npm packages
- `mocha_test`: Runs tests

### What are labels?

Labels identify targets: `//path/to/package:target_name`

Examples:
- `//packages/common/core-interfaces:core_interfaces_esm`
- `//packages/common/core-interfaces:test`

### Where are build outputs?

In `bazel-bin/` directory:
```
bazel-bin/packages/common/core-interfaces/
├── core_interfaces_esm/      # ESM output
├── core_interfaces_cjs/      # CJS output
└── pkg/                      # Final package
```

### What's in BUILD.bazel?

BUILD.bazel files define:
- What to build (`srcs`)
- How to build it (rules like `ts_project`)
- What it depends on (`deps`)
- Who can use it (`visibility`)

### What's the difference between ESM and CJS targets?

- **ESM** (`*_esm`): ES Modules format (`import/export`)
- **CJS** (`*_cjs`): CommonJS format (`require/module.exports`)

Most packages build both for compatibility.

## Advanced Usage

### How do I see what will be built?

```bash
# List targets in a package
bazel query //packages/common/core-interfaces:*

# Show dependencies
bazel query "deps(//packages/common/core-interfaces:core_interfaces_esm)"
```

### How do I build just one format (ESM or CJS)?

```bash
# ESM only
bazel build //packages/common/core-interfaces:core_interfaces_esm

# CJS only
bazel build //packages/common/core-interfaces:core_interfaces_cjs
```

### How do I run a specific test file?

Bazel runs all tests in a target. To run specific tests, use Mocha's pattern matching:

```bash
bazel test //packages/your-package:test --test_arg="--grep" --test_arg="your test name"
```

### Can I use Bazel with VS Code?

Yes! The repo includes VS Code configuration:
- **Build**: Ctrl+Shift+B
- **Debug Tests**: F5 from test files (use "Debug Current Test")

## Configuration

### Where is Bazel configured?

- **`.bazelversion`**: Bazel version (8.4.2)
- **`WORKSPACE.bazel`**: External dependencies, rules setup
- **`.bazelrc`**: Build options, caching, optimization
- **`BUILD.bazel`**: Per-package build definitions
- **`tsconfig.bazel.json`**: TypeScript config for Bazel

### Can I customize build options?

Yes, but generally you shouldn't need to. Options are in `.bazelrc`.

For one-off changes:
```bash
bazel build //... --some_option=value
```

### How do I disable caching?

```bash
bazel build //... --noremote_accept_cached --noremote_upload_local_results
```

## CI/CD

### How does CI work now?

CI runs:
1. `bazel run //:format_check` - Verify formatting
2. `bazel build //...` - Build everything
3. `bazel test //...` - Test everything

### How do I test what CI will do?

Run the same commands locally:
```bash
bazel run //:format_check
bazel build //... --keep_going
bazel test //... --keep_going
```

### Does Bazel work in Codespaces?

Yes! Bazelisk and all tools work in Codespaces.

## Performance

### Why is my first build slow?

First builds compile everything from scratch. Subsequent builds are much faster due to caching.

### How can I speed up builds?

1. **Use remote cache** (if configured)
2. **Build less**: Only build what you need
3. **Use local cache**: Automatic, stored in `~/.cache/bazel`

### How much disk space does Bazel use?

- Local cache: Can grow to several GB in `~/.cache/bazel`
- Build outputs: Usually < 1GB in workspace
- Clean periodically: `bazel clean --expunge`

## Migration Questions

### Is the migration complete?

Phase 5 (cleanup) is in progress. Core functionality is complete:
- ✅ 74/88 packages migrated (84%)
- ✅ Build system working
- ✅ Tests working
- ✅ Formatting/linting integrated

### Can I still use fluid-build?

No, the migration replaces fluid-build entirely. All workflows now use Bazel.

### Where can I learn more?

- [Getting Started Guide](./GETTING_STARTED.md)
- [Command Reference](./COMMANDS.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Migration Status](../../BAZEL_MIGRATION_STATUS.md)

### Who do I ask for help?

1. Check this FAQ
2. Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
3. Search [GitHub Discussions](https://github.com/microsoft/FluidFramework/discussions)
4. Ask your team
5. File an issue with `bazel` label

## Quick Command Reference

```bash
# Build
bazel build //packages/your-package:all    # Build a package
bazel build //...                          # Build everything

# Test
bazel test //packages/your-package:test    # Test a package
bazel test //...                           # Test everything

# Format
bazel run //:format                        # Format code
bazel run //:format_check                  # Check formatting

# Clean
bazel clean                                # Clean outputs
bazel clean --expunge                      # Deep clean

# Query
bazel query //packages/your-package:*      # List targets
bazel query "deps(:target)"                # Show dependencies

# Help
bazel help                                 # General help
bazel help build                           # Command-specific help
```

## Still Have Questions?

- 📖 Read the [Documentation](./README.md)
- 🐛 Check [Troubleshooting](./TROUBLESHOOTING.md)
- 💬 Ask in [Discussions](https://github.com/microsoft/FluidFramework/discussions)
- 🚨 File an [Issue](https://github.com/microsoft/FluidFramework/issues)

---

**Last Updated**: 2025-10-30  
**Bazel Version**: 8.4.2
