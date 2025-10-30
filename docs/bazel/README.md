# Bazel Documentation

Welcome to the Bazel documentation for FluidFramework. This directory contains guides and references for working with Bazel in this monorepo.

## Quick Start

New to Bazel? Start here:
1. [Getting Started](./GETTING_STARTED.md) - Installation, setup, and basic workflows
2. [Commands Reference](./COMMANDS.md) - Comprehensive command guide
3. [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions

## Documentation Index

### For Developers

- **[Getting Started](./GETTING_STARTED.md)** - First steps with Bazel
  - Prerequisites and installation
  - Common commands
  - Understanding build outputs
  - IDE integration

- **[Commands Reference](./COMMANDS.md)** - Complete command guide
  - Build commands
  - Test commands
  - Query commands
  - Advanced workflows

- **[Troubleshooting](./TROUBLESHOOTING.md)** - Solutions to common problems
  - Build issues
  - Test issues
  - Cache issues
  - Performance tips

### Integration Guides

- **[Mocha Test Integration](./MOCHA_TEST_INTEGRATION.md)** - Running tests with Bazel
  - Test configuration
  - ESM module loading
  - Common test patterns

- **[API Extractor Integration](./API_EXTRACTOR_INTEGRATION.md)** - API documentation generation
  - API extraction setup
  - Report generation
  - Validation workflows

- **[Biome Integration](./BIOME_INTEGRATION.md)** - Code formatting and linting
  - Format checking
  - Auto-formatting
  - CI integration

- **[Test Integration Solution](./TEST_INTEGRATION_SOLUTION.md)** - Detailed test pattern
  - Dependency configuration
  - Module resolution
  - Best practices

- **[Package JSON in Sources](./PACKAGE_JSON_IN_SRCS.md)** - Handling package.json in builds
  - Why package.json is needed
  - Configuration patterns

## Migration Documentation

For information about the Bazel migration:

- **[BAZEL_MIGRATION_STATUS.md](../../BAZEL_MIGRATION_STATUS.md)** - Current migration status
- **[BAZEL_MIGRATION_PLAN.md](../../BAZEL_MIGRATION_PLAN.md)** - Migration strategy and plan
- **[BAZEL_MIGRATION_TRACKER.md](../../BAZEL_MIGRATION_TRACKER.md)** - Detailed session notes
- **[BAZEL_MIGRATION_ISSUES.md](../../BAZEL_MIGRATION_ISSUES.md)** - Known issues and blockers
- **[BAZEL_CONVENTIONS.md](../../BAZEL_CONVENTIONS.md)** - Coding conventions for BUILD files

## Key Concepts

### Targets

A target is a buildable unit in Bazel. Common target types in this repo:

- **`ts_project`**: TypeScript compilation
- **`npm_package`**: npm package creation
- **`mocha_test`**: Test execution
- **`js_binary`**: Executable JavaScript

### Labels

Targets are referenced by labels: `//path/to/package:target_name`

Examples:
- `//packages/common/core-interfaces:core_interfaces_esm`
- `//packages/common/core-interfaces:test`

### BUILD Files

Each package has a `BUILD.bazel` file that defines its targets and dependencies.

Example structure:
```python
load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
load("@aspect_rules_js//npm:defs.bzl", "npm_package")

ts_project(
    name = "core_interfaces_esm",
    srcs = glob(["src/**/*.ts"]),
    declaration = True,
    tsconfig = "tsconfig.bazel.json",
    deps = [
        # Dependencies here
    ],
)

npm_package(
    name = "pkg",
    srcs = [":core_interfaces"],
    visibility = ["//visibility:public"],
)
```

## Common Workflows

### Development Workflow

1. Make code changes
2. Build affected packages: `bazel build //packages/your-package:all`
3. Run tests: `bazel test //packages/your-package:test`
4. Format code: `bazel run //:format`

### CI Workflow

1. Format check: `bazel run //:format_check`
2. Build all: `bazel build //...`
3. Test all: `bazel test //...`

## Configuration Files

- **`.bazelversion`** - Pinned Bazel version (8.4.2)
- **`WORKSPACE.bazel`** - Workspace configuration, external dependencies
- **`MODULE.bazel`** - Bzlmod configuration (future)
- **`.bazelrc`** - Build settings and optimizations
- **`.bazelignore`** - Paths Bazel should ignore
- **`BUILD.bazel`** - Per-package build definitions
- **`tsconfig.bazel.json`** - Bazel-specific TypeScript config

## Resources

### Official Documentation

- [Bazel Build](https://bazel.build/) - Official Bazel docs
- [rules_js](https://github.com/aspect-build/rules_js) - JavaScript/Node.js rules
- [rules_ts](https://github.com/aspect-build/rules_ts) - TypeScript rules

### FluidFramework Resources

- [Main README](../../README.md) - Repository overview
- [Contributing Guide](../../CONTRIBUTING.md) - How to contribute
- [Wiki](https://github.com/microsoft/FluidFramework/wiki) - Detailed guides

## FAQ

### Why Bazel?

Bazel provides:
- **Correctness**: Hermetic builds ensure reproducibility
- **Speed**: Aggressive caching and parallelism
- **Scale**: Efficient for large monorepos
- **Incrementality**: Only rebuild what changed

### What happened to fluid-build?

The migration to Bazel replaces fluid-build. All build, test, and development workflows now use Bazel.

### Do I need to know Starlark?

For day-to-day development, no. For adding new packages or complex build logic, basic Starlark knowledge helps. See [Bazel Starlark docs](https://bazel.build/rules/language).

### How do I debug Bazel builds?

See the [Troubleshooting Guide](./TROUBLESHOOTING.md#general-debugging-strategies) for debugging techniques.

### Where are build outputs?

Build outputs are in `bazel-bin/` (symlink from project root). Example:
```
bazel-bin/packages/common/core-interfaces/pkg/
```

## Getting Help

1. Check this documentation
2. Search [FluidFramework Discussions](https://github.com/microsoft/FluidFramework/discussions)
3. Ask in your team channel
4. File an issue with the `bazel` label

## Contributing to Documentation

Found an issue or want to improve these docs? 

1. Edit the relevant `.md` file in `docs/bazel/`
2. Submit a PR with your changes
3. Tag with the `documentation` label

---

**Last Updated**: 2025-10-30  
**Bazel Version**: 8.4.2  
**Migration Status**: Phase 5 - Cleanup & Documentation
