# Bazel Command Reference

Comprehensive reference for Bazel commands used in the FluidFramework monorepo.

## Build Commands

### Basic Building

```bash
# Build a single target
bazel build //packages/common/core-interfaces:core_interfaces

# Build all targets in a package
bazel build //packages/common/core-interfaces:all

# Build all targets in a directory tree
bazel build //packages/common/...

# Build everything in the workspace
bazel build //...
```

### Build Options

```bash
# Keep going on errors (build as much as possible)
bazel build //... --keep_going

# Show more detailed output
bazel build //packages/common/core-interfaces:core_interfaces --verbose_failures

# Build with specific configuration
bazel build //packages/common/core-interfaces:core_interfaces --compilation_mode=opt

# Show progress
bazel build //... --show_progress
```

## Test Commands

### Running Tests

```bash
# Run tests for a package
bazel test //packages/common/core-interfaces:test

# Run all tests
bazel test //...

# Run tests in a directory
bazel test //packages/common/...
```

### Test Options

```bash
# Show all test output
bazel test //packages/common/core-interfaces:test --test_output=all

# Show only errors
bazel test //packages/common/core-interfaces:test --test_output=errors

# Run tests with specific timeout
bazel test //packages/common/core-interfaces:test --test_timeout=300

# Run tests with specific tag
bazel test //... --test_tag_filters=integration

# Run failed tests only
bazel test //... --rerun_flaky_tests
```

## Query Commands

### Finding Targets

```bash
# List all targets in a package
bazel query //packages/common/core-interfaces:*

# List all packages
bazel query //...

# Find all TypeScript libraries
bazel query 'kind(ts_project, //...)'

# Find all test targets
bazel query 'kind(mocha_test, //...)'
```

### Dependency Queries

```bash
# Show direct dependencies
bazel query "deps(//packages/common/core-interfaces:core_interfaces_esm, 1)"

# Show all dependencies
bazel query "deps(//packages/common/core-interfaces:core_interfaces_esm)"

# Show reverse dependencies (what depends on this)
bazel query "rdeps(//..., //packages/common/core-interfaces:core_interfaces_esm)"

# Show path between two targets
bazel query "somepath(//packages/common/core-interfaces:core_interfaces_esm, //packages/utils/tool-utils:tool_utils_esm)"

# Show dependencies with specific pattern
bazel query "filter('.*test.*', deps(//packages/common/core-interfaces:test))"
```

### Output Formatting

```bash
# Output as graph (requires graphviz)
bazel query "deps(//packages/common/core-interfaces:core_interfaces_esm)" --output=graph | dot -Tpng > deps.png

# Output as proto
bazel query //... --output=proto

# Output as JSON-like
bazel query //... --output=build

# Output with labels only
bazel query //... --output=label
```

## Run Commands

```bash
# Run a binary target
bazel run //:format

# Run with arguments
bazel run //tools/some-tool:bin -- --arg1 --arg2

# Run tests (alternative to bazel test)
bazel run //packages/common/core-interfaces:test
```

## Clean Commands

```bash
# Remove build outputs
bazel clean

# More thorough clean (removes external deps cache)
bazel clean --expunge

# Clean async (faster)
bazel clean --async
```

## Info Commands

```bash
# Show workspace info
bazel info

# Show specific info
bazel info output_base
bazel info execution_root
bazel info bazel-bin

# Show all Bazel options
bazel help options

# Show specific command help
bazel help build
bazel help test
bazel help query
```

## Cache Commands

```bash
# Clean just the repository cache
bazel clean --expunge_async

# Show cache statistics
bazel info | grep cache
```

## Diagnostic Commands

```bash
# Show build event log
bazel build //... --build_event_text_file=build-events.txt

# Show execution log
bazel build //... --execution_log_binary_file=exec.log

# Profile a build
bazel build //... --profile=profile.json
bazel analyze-profile profile.json

# Show action graph
bazel aquery //packages/common/core-interfaces:core_interfaces_esm
```

## Advanced Queries

### Complex Dependency Analysis

```bash
# Find all packages that depend on a specific package
bazel query "rdeps(//..., //packages/common/core-interfaces:core_interfaces_esm)" --output=package

# Find circular dependencies (should return empty)
bazel query "allpaths(//packages/common/core-interfaces:core_interfaces_esm, //packages/common/core-interfaces:core_interfaces_esm)"

# Find all external dependencies
bazel query "kind(npm_package, //...)"

# Find all targets with specific attribute
bazel query 'attr(testonly, 1, //...)'
```

### Package Sets

```bash
# Find all buildable targets
bazel query 'kind(rule, //...)'

# Find targets by name pattern
bazel query 'filter(".*_esm", //...)'

# Combine queries
bazel query "deps(//packages/common/core-interfaces:test) intersect kind(ts_project, //...)"
```

## Configuration Commands

```bash
# Show all bazelrc configs
bazel help startup_options

# Use specific config
bazel build //... --config=ci

# Show effective configuration
bazel config
```

## Workspace Commands

```bash
# Sync external dependencies
bazel sync

# Fetch all external dependencies
bazel fetch //...

# Show information about external repository
bazel query @npm//...
```

## Common Workflows

### Full Build + Test

```bash
# Build and test everything
bazel build //... && bazel test //...

# Or in one command (tests will build first)
bazel test //...
```

### Incremental Development

```bash
# Build only changed targets and their dependents
bazel build //packages/common/core-interfaces:all

# Test only affected tests
bazel test //packages/common/...
```

### CI/CD Workflows

```bash
# Format check (no changes)
bazel run //:format_check

# Build all
bazel build //... --keep_going

# Test all with coverage
bazel test //... --combined_report=lcov --coverage_report_generator=@bazel_tools//tools/test/CoverageOutputGenerator/java/com/google/devtools/coverageoutputgenerator:Main
```

## Tips

1. **Use `--keep_going`**: Continue building even after failures
2. **Use `--test_output=errors`**: Only show failing tests
3. **Use tab completion**: Bazel supports bash/zsh completion
4. **Use query before build**: Understand what will be built
5. **Use `.bazelrc`**: Configure common options there instead of typing them

## See Also

- [GETTING_STARTED.md](./GETTING_STARTED.md) - Introduction to Bazel
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues and solutions
