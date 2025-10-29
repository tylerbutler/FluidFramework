# Test Compilation Pattern Redesign

**Date**: 2025-10-29  
**Context**: Session 4.11 Test Survey  
**Status**: Planning Document

## Problem Summary

### Current Pattern (Broken)
```python
ts_project(
    name = "package_test",
    srcs = glob(["src/test/**/*.ts"]) + glob(["src/**/*.ts"], exclude=["src/test/**"]),
    root_dir = "src",
    deps = [":pkg", ":node_modules/@types/mocha", ...],
)
```

**Issues**:
1. Compiles source + test files together
2. Source files import from own package (e.g., `@fluidframework/core-utils/internal`)
3. During compilation, package doesn't exist yet (circular dependency)
4. TypeScript can't resolve package imports → TS2307 errors
5. Affects 95%+ of packages (58/60 test targets failing)

### Why Current Pattern Exists
- Inherited from Session 4.2-4.3 when test integration was first added
- Seemed necessary to make tests see source code
- Worked for simple packages without self-referencing
- Never validated across all packages

## Survey Results

### Status: 1/60 Tests Passing
- **✅ Passing (1)**: test-pairwise-generator
- **❌ Failing (58)**: Module resolution errors (TS2307)
- **⏱️ Timeout (1)**: core-interfaces (compilation hangs)

### Why test-pairwise-generator Passes
It doesn't self-reference its own package - simple test pattern works.

## Proposed Solution

### New Pattern: Separate Test Compilation

```python
# Compile test files ONLY (not source)
ts_project(
    name = "package_test",
    srcs = glob(["src/test/**/*.ts"]) + ["package.json"],
    root_dir = "src/test",
    out_dir = "lib-test/test",
    tsconfig = "src/test/tsconfig.bazel.json",
    deps = [
        ":package_esm",  # For TypeScript to resolve imports
        ":pkg",          # For runtime package resolution
        ":node_modules/@types/mocha",
        ":node_modules/@types/node",
        # Add other npm deps as needed
    ],
)

# Test runner depends on compiled package
mocha_bin.mocha_test(
    name = "test",
    args = ["packages/category/package-name/lib-test/test/**/*.spec.js", "--exit"],
    data = [
        ":package_test",
        ":package_esm",  # Runtime needs compiled source
        ":pkg",          # For subpath exports at runtime
        "package.json",
    ],
)
```

### Key Changes

1. **srcs**: Only test files, not source files
2. **root_dir**: `src/test` instead of `src`
3. **out_dir**: `lib-test/test` instead of `lib-test`
4. **deps**: Include both `:package_esm` (for TypeScript) and `:pkg` (for runtime)
5. **data**: Ensure all runtime dependencies are available

### TypeScript Configuration

Test tsconfig needs to be able to resolve package imports:

```json
{
  "compilerOptions": {
    "module": "Node16",
    "moduleResolution": "Node16",
    "rootDir": "./",
    "outDir": "../../lib-test/test",
    // TypeScript will resolve @fluidframework/package-name via node_modules
    // which is linked via npm_link_all_packages
  }
}
```

## Migration Strategy

### Phase 1: Prototype (1-2 hours)
1. Pick 3 representative packages:
   - Simple: No subpath exports, no self-reference
   - Medium: Has subpath exports
   - Complex: Heavy self-referencing
2. Update their BUILD.bazel with new pattern
3. Verify tests compile and pass
4. Document any edge cases

### Phase 2: Script Creation (1 hour)
Create `migrate-test-pattern.ts`:
- Reads BUILD.bazel
- Identifies test ts_project
- Rewrites srcs, root_dir, out_dir
- Updates deps to include `:package_esm` and `:pkg`
- Updates mocha_test data

### Phase 3: Batch Migration (2-3 hours)
1. Run script on all 60 packages
2. Validate with test survey
3. Fix any edge cases manually
4. Verify improved pass rate

### Phase 4: Special Cases (1-2 hours)
Handle the 2 known problematic packages:
- **routerlicious-urlResolver**: .cts/.cjs import issue
- **core-interfaces**: Compilation timeout issue

## Expected Outcomes

### Success Metrics
- **Target**: 50+ tests passing (83%+ pass rate)
- **Acceptable**: 40+ tests passing (67%+ pass rate)
- **Blocked By**: Pre-existing code quality issues (TS7006, TS2345, etc.)

### Known Remaining Issues
1. Pre-existing TypeScript errors (code quality)
2. Missing npm dependencies (can be added incrementally)
3. 2 special-case packages (defer or handle separately)

## Timeline Estimate

- **Phase 1**: 1-2 hours (prototype 3 packages)
- **Phase 2**: 1 hour (create migration script)
- **Phase 3**: 2-3 hours (batch migrate 60 packages)
- **Phase 4**: 1-2 hours (special cases)
- **Total**: 5-8 hours (3-4 sessions)

## Risks & Mitigation

### Risk 1: Pattern doesn't work for all packages
**Mitigation**: Prototype with diverse sample first

### Risk 2: TypeScript path resolution issues
**Mitigation**: Ensure `:pkg` dependency is included, npm_link_all_packages handles resolution

### Risk 3: Runtime module resolution failures
**Mitigation**: Include both `:package_esm` and `:pkg` in mocha_test data

## Decision Points

### Before Starting
- [x] Confirm systemic issue via test survey
- [x] Analyze root cause
- [ ] Review proposed solution with team
- [ ] Approve migration approach

### After Prototype
- [ ] Validate new pattern works
- [ ] Document any required variations
- [ ] Confirm script approach viable
- [ ] Proceed with batch migration

## References

- **Test Survey Results**: `test-survey-results.json`
- **Error Analysis**: `test-error-analysis.json`
- **Session Notes**: `BAZEL_MIGRATION_STATUS.md` Session 4.11
- **Original Test Integration**: Session 4.2-4.3

---

**Next Session**: Start Phase 1 - Prototype new test pattern with 3 sample packages
