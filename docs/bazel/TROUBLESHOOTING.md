# Bazel Troubleshooting Guide

Common issues and solutions when working with Bazel in the FluidFramework monorepo.

## Build Issues

### "No such file or directory" errors

**Symptom**: Bazel can't find source files or dependencies.

**Solutions**:

1. **Clean and rebuild**:
   ```bash
   bazel clean
   bazel build //packages/your-package:target
   ```

2. **Check BUILD.bazel file**: Ensure all source files are included in `srcs` or `data`.

3. **Verify dependencies**: Make sure all dependencies are listed in `deps`.

4. **Check for stale symlinks**:
   ```bash
   rm -rf bazel-*
   bazel build //packages/your-package:target
   ```

### TypeScript compilation errors (TS2307: Cannot find module)

**Symptom**: TypeScript can't resolve module imports.

**Solutions**:

1. **Check package dependencies**: Ensure the dependency is in both:
   - `package.json` dependencies
   - `BUILD.bazel` deps array

2. **For workspace packages**: Add both ESM and pkg targets:
   ```python
   deps = [
       "//packages/other-package:other_package_esm",  # For compilation
       "//packages/other-package:pkg",                 # For runtime
   ]
   ```

3. **For npm packages**: Ensure they're in pnpm-lock.yaml and npm_translate_lock has run:
   ```bash
   bazel sync
   ```

### TS1479: Module detection errors

**Symptom**: Error about module format detection or "Could not find a declaration file".

**Solutions**:

1. **Check tsconfig.bazel.json**: Ensure it has:
   ```json
   {
     "compilerOptions": {
       "module": "Node16",
       "moduleResolution": "Node16"
     }
   }
   ```

2. **Verify package.json**: Must have `"type": "module"` for ESM packages.

3. **Check extends chain**: Ensure tsconfig.bazel.json properly extends base config.

See [TS1479_SOLUTION.md](../../TS1479_SOLUTION.md) for detailed analysis.

## Test Issues

### Tests can't load modules (ESM errors)

**Symptom**: `ERR_UNKNOWN_FILE_EXTENSION` or module loading failures.

**Solution**: Ensure `package.json` is in the mocha_test data array:

```python
mocha_bin.mocha_test(
    name = "test",
    args = [".../**/*.spec.js", "--exit"],
    data = [
        ":package_test",
        ":pkg",
        "package.json",  # Required for ESM detection
    ],
)
```

See [MOCHA_TEST_INTEGRATION.md](./MOCHA_TEST_INTEGRATION.md) for details.

### Tests can't resolve workspace packages

**Symptom**: Tests fail with "Cannot find module '@fluidframework/...'"

**Solution**: Add both compilation and runtime dependencies:

```python
deps = [
    ":package_esm",      # For compiling test code
    ":pkg",              # For runtime package resolution
    "//other:other_esm", # External package compilation dep
    "//other:pkg",       # External package runtime dep
]
```

See [TEST_INTEGRATION_SOLUTION.md](./TEST_INTEGRATION_SOLUTION.md) for full pattern.

### Test output not showing

**Solution**: Use `--test_output` flag:
```bash
bazel test //packages/your-package:test --test_output=all
```

### Tests timeout

**Solutions**:

1. **Increase timeout**:
   ```bash
   bazel test //packages/your-package:test --test_timeout=300
   ```

2. **In BUILD.bazel**:
   ```python
   mocha_bin.mocha_test(
       name = "test",
       timeout = "long",  # short, moderate, long, or eternal
       ...
   )
   ```

## Cache Issues

### Stale cache causing incorrect builds

**Symptom**: Changes not reflected in build, or random failures.

**Solutions**:

1. **Clean build**:
   ```bash
   bazel clean
   ```

2. **Full cache clear**:
   ```bash
   bazel clean --expunge
   ```

3. **Disable cache temporarily**:
   ```bash
   bazel build //... --noremote_accept_cached --noremote_upload_local_results
   ```

### Remote cache connection issues

**Symptom**: Slow builds, cache connection errors.

**Solutions**:

1. **Check cache server status**: If using bazel-remote, verify Docker container is running.

2. **Disable remote cache temporarily**:
   ```bash
   unset BAZEL_REMOTE_CACHE_URL
   bazel build //...
   ```

3. **Use disk cache only**: Comment out remote cache in `.bazelrc`.

See [REMOTE_CACHE_SETUP.md](../../REMOTE_CACHE_SETUP.md) for setup details.

## Performance Issues

### Slow builds

**Solutions**:

1. **Check cache hit rate**:
   ```bash
   bazel build //... --execution_log_json_file=exec.json
   ```

2. **Enable remote cache**: See [REMOTE_CACHE_SETUP.md](../../REMOTE_CACHE_SETUP.md).

3. **Use workers** (already enabled in `.bazelrc`):
   ```bash
   bazel build //... --worker_max_instances=4
   ```

4. **Reduce parallelism if running out of memory**:
   ```bash
   bazel build //... --jobs=4
   ```

### High memory usage

**Solutions**:

1. **Limit jobs**:
   ```bash
   bazel build //... --jobs=2
   ```

2. **Adjust JVM memory** (in `.bazelrc` or command line):
   ```bash
   bazel build //... --host_jvm_args=-Xmx2g
   ```

## Dependency Issues

### "Circular dependency" errors

**Symptom**: Bazel detects circular dependencies.

**Solution**: This is a real issue that needs fixing. Break the cycle by:
- Extracting shared code into a new package
- Removing unnecessary dependencies
- Using dependency injection

**Debug**:
```bash
bazel query "somepath(//packages/a:target, //packages/b:target)"
```

### External npm dependency not found

**Symptom**: `@@npm//package-name:target` not found.

**Solutions**:

1. **Ensure package is in pnpm-lock.yaml**:
   ```bash
   pnpm install
   ```

2. **Sync Bazel repositories**:
   ```bash
   bazel sync
   ```

3. **Check npm_translate_lock in WORKSPACE.bazel**.

## IDE Issues

### VS Code not recognizing imports

**Symptom**: Red squiggles on imports that work in Bazel.

**Solutions**:

1. **Use tsconfig.json, not tsconfig.bazel.json**: VS Code should use the regular tsconfig.json.

2. **Restart TypeScript server**: Cmd/Ctrl+Shift+P → "TypeScript: Restart TS Server"

3. **Check workspace packages are built**:
   ```bash
   bazel build //packages/your-dependency:pkg
   ```

### Debugger not working

**Solution**: Check `.vscode/launch.json` configuration. Use the "Debug Current Test" configuration.

## Query Issues

### Query returns unexpected results

**Solutions**:

1. **Check query syntax**:
   ```bash
   bazel help query
   ```

2. **Test query incrementally**: Start simple, add complexity.

3. **Use `--output` for clarity**:
   ```bash
   bazel query //... --output=label_kind
   ```

## General Debugging Strategies

### Enable verbose output

```bash
bazel build //packages/your-package:target --verbose_failures --sandbox_debug
```

### Check the build log

```bash
bazel build //... --build_event_text_file=build-events.txt
cat build-events.txt
```

### Inspect the sandbox

```bash
bazel build //packages/your-package:target --sandbox_debug
# Sandbox paths will be printed
```

### Use --explain

```bash
bazel build //packages/your-package:target --explain=explain.txt
cat explain.txt
```

### Profile the build

```bash
bazel build //... --profile=profile.json
bazel analyze-profile profile.json
```

## Common Error Messages

### "Unresolved reference to repository"

**Cause**: External repository not loaded.

**Solution**: Run `bazel sync` or check WORKSPACE.bazel.

### "Target '...' does not exist"

**Causes**:
1. Typo in target name
2. Target not defined in BUILD.bazel
3. BUILD.bazel doesn't exist

**Solution**: Check BUILD.bazel file and target names.

### "Invalid package name"

**Cause**: Invalid characters in package path or incorrect // prefix.

**Solution**: Package names must use `//path/to/package:target` format.

### "Cycle in dependency graph"

**Cause**: Circular dependency between targets.

**Solution**: Use `bazel query` to find the cycle and break it.

## Getting Help

1. **Check migration docs**:
   - [BAZEL_MIGRATION_STATUS.md](../../BAZEL_MIGRATION_STATUS.md)
   - [BAZEL_MIGRATION_ISSUES.md](../../BAZEL_MIGRATION_ISSUES.md)

2. **Check Bazel docs**: https://bazel.build/docs

3. **Check rules_js docs**: https://github.com/aspect-build/rules_js

4. **Ask in GitHub Discussions**: https://github.com/microsoft/FluidFramework/discussions

## See Also

- [GETTING_STARTED.md](./GETTING_STARTED.md) - Bazel basics
- [COMMANDS.md](./COMMANDS.md) - Command reference
- [MOCHA_TEST_INTEGRATION.md](./MOCHA_TEST_INTEGRATION.md) - Test setup
- [API_EXTRACTOR_INTEGRATION.md](./API_EXTRACTOR_INTEGRATION.md) - API extraction
