# Bazel Migration Known Issues and TODOs

This file tracks unresolved issues, workarounds, and items to revisit during the Bazel migration.

## Issues to Revisit

### 1. @types Packages Not Exposed by npm_translate_lock
**Status**: Workaround implemented
**File**: `packages/common/core-interfaces/src/test/mocha.d.ts`
**Issue**: aspect_rules_js npm_translate_lock doesn't properly expose @types/* packages as Bazel targets, even though they exist in pnpm-lock.yaml.

**Current Workaround**: Created minimal mocha type declarations in `mocha.d.ts` to provide global test functions (describe, it, before, after, etc.)

**Proper Solution**:
- Wait for aspect_rules_js to properly support @types packages
- Or migrate to bzlmod which may have better support
- Or configure custom npm package links for @types

**References**:
- aspect_rules_js documentation on @types packages
- pnpm-lock.yaml contains `@types/mocha@10.0.10`
- Attempts to reference `//:node_modules/@types/mocha` fail with "target not declared"

### 2. TypeScript tsconfig `extends` Not Working in Sandbox
**Status**: Resolved with inline tsconfig
**Files**:
- `packages/common/core-interfaces/tsconfig.bazel.json`
- `packages/common/core-interfaces/tsconfig.cjs.bazel.json`
- `packages/common/core-interfaces/src/test/tsconfig.bazel.json`

**Issue**: Bazel's sandboxed execution doesn't properly resolve relative paths in tsconfig `extends` field.

**Solution**: Created inline tsconfig files without `extends`, duplicating compiler options from base configs.

**TODO**:
- Consider using js_library targets for tsconfig files (attempted but didn't work for extends)
- May need aspect_rules_ts updates to properly handle extends in sandbox

### 3. TypeScript Path Mappings for Package Imports
**Status**: Partially working, investigating memory issues
**File**: `packages/common/core-interfaces/src/test/tsconfig.bazel.json`

**Issue**: Test files import using package names (`@fluidframework/core-interfaces/internal`) but TypeScript needs to resolve these to compiled outputs in Bazel.

**Current Approach**: Using TypeScript `paths` compiler option to map package names to built lib/ directory.

**Problems**:
- Path mapping may be causing TypeScript to run out of memory during compilation
- Need to ensure mappings don't create circular dependencies
- May need different approach for test compilation

**TODO**:
- Investigate if ts_project has better way to handle package-name imports
- Consider if tests should use relative imports instead
- Check if transpileonly mode would help (but avoid disabling validation per user request)

### 4. WORKSPACE vs Bzlmod
**Status**: TODO
**Issue**: Bazel shows warning "WORKSPACE support will be removed in Bazel 9 (late 2025)"

**Current State**: Using WORKSPACE.bazel

**TODO**:
- Evaluate bzlmod migration
- Check if bzlmod has better @types package support
- Plan migration strategy (likely in later phase)
- Update BAZEL_MIGRATION_PLAN.md to include bzlmod migration phase

### 5. pnpm Version Mismatch
**Status**: Blocked npm_translate_lock auto-update
**Issue**: Local pnpm version (8.15.9) doesn't match workspace requirement (10.x)

**Impact**: Cannot use `update_pnpm_lock = True` feature of npm_translate_lock

**TODO**:
- Document pnpm version requirement
- Consider updating local pnpm or adjusting workspace requirements
- For now, manual pnpm-lock.yaml management is required

### 6. Node.js Version Mismatch
**Status**: Warning during npm_translate_lock
**Issue**: Local Node.js v18.20.8, workspace expects >=20.15.1

**TODO**:
- Document Node.js version requirement
- Update local Node.js or adjust workspace requirements
- May affect Bazel's ability to run certain npm scripts

### 7. Test Compilation Module Resolution
**Status**: BLOCKED - Requires deeper Bazel/TypeScript integration work
**Issue**: Test files cannot resolve package-name imports in Bazel sandbox

**Root Cause**:
Test files import using package names (e.g., `@fluidframework/core-interfaces/internal`) which work in normal npm/pnpm environments because node_modules provides the resolution. In Bazel:
1. ts_project compiles in a sandbox without node_modules
2. Package-name imports need TypeScript path mappings
3. Path mappings cause TypeScript to run out of memory (OOM after ~100 seconds)
4. Without path mappings: 652 errors across 15 test files

**Errors Without Path Mappings**:
- `Cannot find module '@fluidframework/core-interfaces/internal'` (package exports)
- `Cannot find module '@fluidframework/core-interfaces/internal/exposedUtilityTypes'` (sub-exports)
- `Cannot find module 'node:assert'` (Node.js built-ins)
- `Cannot find module '../erasedType.js'` (relative imports to src/)

**Path Mappings Memory Issues**:
- Adding TypeScript `paths` to resolve package names causes OOM
- Tested configurations:
  - `baseUrl: "."` with relative paths → OOM
  - `baseUrl: "../.."` with lib/ paths → OOM
  - Pointing directly to `.d.ts` files → OOM
- Memory usage reaches ~2GB before crash
- Appears to be TypeScript recursively processing too many files

**Attempted Solutions**:
1. ❌ TypeScript path mappings (causes OOM)
2. ❌ Adjusting baseUrl and rootDir combinations (still OOM)
3. ✅ Removed path mappings (fast compilation but 652 errors)
4. ✅ Added skipLibCheck (helps but doesn't solve module resolution)

**Required Solution** (for future work):
This needs one of the following approaches:
1. **Restructure Test Imports**: Convert all package-name imports to relative imports
   - Con: Breaks consistency with production code patterns
   - Con: Large refactor across many test files
2. **Custom Module Resolution**: Create a Bazel-specific module resolution plugin
   - Pro: Matches npm behavior
   - Con: Complex, may affect TypeScript performance
3. **Virtual Package**: Create a local package link in sandbox that tests can import
   - Pro: Closest to real npm behavior
   - Con: Requires understanding Bazel's runfiles and sandbox structure
4. **Split Test Compilation**: Compile tests file-by-file or in small groups
   - Pro: Avoids memory issues
   - Con: Slower builds, more complex BUILD files

**Decision**: Defer test compilation to Phase 2
- ESM and CJS builds are working with full validation ✅
- Test compilation requires architectural decisions about module resolution strategy
- This is a known complexity in Bazel TypeScript projects
- Should be addressed systematically across all packages, not just core-interfaces

## Temporary Workarounds to Remove

### 1. mocha.d.ts Type Declarations
**File**: `packages/common/core-interfaces/src/test/mocha.d.ts`
**Reason**: Workaround for missing @types/mocha
**Remove When**: @types packages properly supported in npm_translate_lock

### 2. Inline tsconfig Files
**Files**: All `tsconfig.bazel.json` files
**Reason**: Workaround for extends not working in sandbox
**Remove When**: Sandbox path resolution fixed or better tsconfig sharing mechanism found

## Best Practices Established

### 1. Always Use Validation
Per user feedback: "work through these issues, not skip them"
- Never disable TypeScript validation (`validate = False`)
- Never use transpile-only mode to bypass type checking
- Work through compilation errors systematically

### 2. Inline TypeScript Configurations
For Bazel builds, use self-contained tsconfig files without extends to avoid sandbox path resolution issues.

### 3. Package Path Mappings
When tests import using package names, use TypeScript `paths` to map to compiled outputs in lib/ directory.

## Questions for Later Phases

1. Should we standardize on a single tsconfig approach across all packages?
2. How to handle packages with complex dependency graphs in tests?
3. What's the migration path for packages that use Jest instead of Mocha?
4. Should we generate BUILD files or maintain them manually?
5. What's the strategy for handling @types packages long-term?

## Success Criteria

For each issue to be considered "resolved":
- [ ] No workarounds or temporary files needed
- [ ] Full TypeScript validation enabled
- [ ] Tests compile and run successfully
- [ ] Build outputs match pnpm equivalents
- [ ] Documentation explains the solution
