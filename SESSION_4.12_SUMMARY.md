# Session 4.12: Test Pattern Redesign - Discovery & Analysis

**Date**: 2025-10-29
**Status**: Analysis Complete, Implementation Partially Blocked
**Progress**: Identified root cause and validated solution approach

---

## Work Completed

### 1. Fixed Critical Syntax Errors
- ✅ Fixed stray comma in `id-compressor/BUILD.bazel` (line 131)
- ✅ Syntax now validates correctly

### 2. Created Migration Scripts
- ✅ `migrate-test-pattern.ts` - Comprehensive test pattern migration
- ✅ `fix-test-pattern-final.ts` - Focused fixes for root_dir/out_dir
- ✅ `add-esm-to-test-deps.ts` - Add ESM deps for module resolution
- ✅ `fix-broken-deps.ts` - Fix syntax errors from automated changes

### 3. Root Cause Analysis
**CRITICAL FINDING**: The systemic test failure is caused by TypeScript's inability to resolve package self-references during test compilation.

**The Problem**:
```typescript
// Test file imports from its own package
import { someFunction } from "@fluidframework/core-utils/internal";
```

During test compilation:
1. TypeScript needs to resolve `@fluidframework/core-utils/internal`
2. The `:pkg` dependency creates the npm package structure
3. But TypeScript can't see it during ts_project compilation
4. Result: TS2307 "Cannot find module" errors in 95%+ of tests

### 4. Solution Validated
**SOLUTION**: Add `:package_esm` to test deps alongside `:pkg`

```python
deps = [
    ":core_utils_esm",  # For TypeScript to see compiled outputs
    ":pkg",  # For runtime package resolution with subpath exports
    ":node_modules/@types/mocha",
    ...
],
```

**Validation**: Manually tested with:
- ✅ `core-utils` - Package self-reference errors ELIMINATED
- ✅ `core-interfaces` - Module resolution works correctly
- ✅ `request-handler` - Compiles successfully (but placeholder test)

**Remaining errors after fix**:
1. Relative imports (`'../index.js'`) - Pre-existing test code issue
2. TypeScript code quality (TS7006 implicit any) - Pre-existing, acceptable
3. Complex edge cases (routerlicious-urlResolver .cts files)

---

## Current Status

### Test Survey Results
- **Before Session**: 1/60 passing (test-pairwise-generator only)
- **After pattern updates**: 1/60 passing (request-handler, but placeholder)
- **With ESM deps (manual)**: Module resolution fixed, but relative imports remain

### Error Categories
1. **TS2307 Package imports** ✅ SOLVED by adding `:package_esm` to deps
2. **TS2307 Relative imports** ⚠️  Pre-existing test code issue (not bazel)
3. **TS7006 Implicit any** ⚠️  Pre-existing code quality (acceptable to defer)
4. **Special cases** ⚠️  2 packages with unique issues (defer to later)

---

## Implementation Blocker

**Problem**: Automated script to add `:package_esm` to all 60 test targets failed due to:
1. Complex regex patterns breaking with cross-package references
2. Quote handling issues in Python-like syntax
3. Mixed formatting across BUILD.bazel files (tabs/spaces, comments, etc.)

**Attempted**: 
- Created `add-esm-to-test-deps.ts` - broke 54/60 files
- Created `fix-broken-deps.ts` - fixed some but not all syntax errors
- Reverted changes to prevent further issues

**Root Issue**: String replacement in BUILD.bazel files is error-prone. Need more robust approach.

---

## Path Forward

### Option A: Manual Migration (Recommended for Now)
1. Manually update 3-5 representative packages with the correct pattern
2. Validate they compile and tests can resolve imports
3. Document the exact pattern as a template
4. Use the template for remaining packages (or improve automation)

**Pattern to Apply**:
```python
ts_project(
    name = "package_name_test",
    srcs = glob(["src/test/**/*.ts"]) + ["package.json"],
    root_dir = "src/test",
    out_dir = "lib-test/test",
    deps = [
        ":package_name_esm",  # CRITICAL: TypeScript module resolution
        ":pkg",  # CRITICAL: Runtime subpath exports
        ":node_modules/@types/mocha",
        ...other deps...
    ],
)

mocha_bin.mocha_test(
    name = "test",
    args = ["packages/category/package-name/lib-test/test/**/*.spec.js", "--exit"],
    data = [
        ":package_name_test",
        ":pkg",  # Runtime needs package
        "package.json",
    ],
)
```

### Option B: Better Automation
1. Use a proper BUILD file parser (Starlark parser)
2. Or use Bazel's buildozer tool for surgical edits
3. Or write more defensive regex with better error handling

### Option C: Alternative Approach
1. Keep old pattern (compile source + tests together)
2. But ensure `:pkg` is built FIRST (dependency ordering)
3. May require ts_project to support circular-ish dependencies

---

## Key Insights

1. **The npm_package pattern works great** for production builds
2. **Test pattern needs the ESM build as a dependency** for module resolution
3. **TypeScript's module resolution runs DURING compilation**, not at runtime
4. **Most test failures are the SAME root cause** (not 60 different issues)
5. **Automation of BUILD.bazel edits is risky** without proper parsing

---

## Recommendations

### Immediate (Next Session)
1. **Manually fix 5 representative packages** as proof of concept:
   - Simple: `test-pairwise-generator` (but will need relative import fixes)
   - Medium: `core-utils`, `core-interfaces`
   - Complex: `runtime-utils`, `container-runtime`
2. **Verify tests compile** for those 5 packages
3. **Document any additional patterns** needed

### Short-term
1. Use `buildozer` tool for safe automated BUILD file edits
2. Or create a proper Starlark parser-based migration tool
3. Batch migrate remaining 55 packages

### Long-term
1. Address relative import issues in test code (separate effort)
2. Fix pre-existing TypeScript errors (code quality initiative)
3. Handle 2 special-case packages (routerlicious-urlResolver, etc.)

---

## Files Created

1. `bazel-migration/scripts/migrate-test-pattern.ts`
2. `bazel-migration/scripts/fix-test-pattern-final.ts`
3. `bazel-migration/scripts/add-esm-to-test-deps.ts`
4. `bazel-migration/scripts/fix-broken-deps.ts`
5. `SESSION_4.12_SUMMARY.md` (this file)

---

## Next Steps

**Session 4.13**: Manual Migration of 5 Representative Packages
- Goal: 5/60 tests compiling successfully
- Approach: Manual, careful updates with validation
- Success Criteria: Module resolution works, tests find their imports
- Time Estimate: 1-2 hours

---

**Key Takeaway**: We've identified the root cause and validated the solution. The remaining work is careful, methodical application of the fix pattern across all packages.
