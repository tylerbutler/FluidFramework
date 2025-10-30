# Remaining Build Tasks Not Yet Migrated to Bazel

**Status**: Phase 6 In Progress - API Extractor Integration ✅ COMPLETE!

## Summary

The current Bazel migration covers:
- ✅ TypeScript compilation (ESM + CJS)
- ✅ Test compilation and execution (Mocha)
- ✅ Code formatting (Biome via `//:format`)
- ✅ Basic npm package creation
- ✅ **API Extractor integration (74 packages)** - Phase 6 Complete! 🎉

**Not yet migrated**:
- ❌ Type tests (typetests:gen, typetests:prepare)
- ❌ CJS package stub copying (copyfiles)
- ❌ Per-package linting/formatting targets
- ❌ Bundle generation (webpack)
- ❌ Documentation generation

## Task Details

### 1. API Extractor ✅ COMPLETE (2025-10-30)

**Status**: ✅ **INTEGRATED** - 74 packages now have API extractor targets

**What it does**:
- Generates API documentation
- Creates API reports (.api.json, .api.md)
- Validates public API surface
- Checks for breaking changes
- Lints export patterns

**Implementation**: 
- ✅ 74 packages have `generate_entrypoints` targets
- ✅ 74 packages have `api_reports` targets (+ variants for multiple configs)
- ✅ Uses `sh_binary` wrapper approach from documented pattern
- ✅ All configs in `api-extractor/` directories detected and integrated

**Usage**:
```bash
# Generate entrypoint files
bazel run //packages/common/core-interfaces:generate_entrypoints

# Generate/validate API reports
bazel run //packages/common/core-interfaces:api_reports

# For packages with multiple configs
bazel run //packages/common/core-interfaces:api_reports_current
bazel run //packages/common/core-interfaces:api_reports_legacy
```

**Documentation**: See `docs/bazel/API_EXTRACTOR_INTEGRATION.md`

**Impact**: ✅ API validation now fully integrated in Bazel builds

### 2. Type Tests (MEDIUM PRIORITY)

**Current State**: Runs via flub tool in package.json

**Examples**:
```json
"typetests:gen": "flub generate typetests --dir . -v",
"typetests:prepare": "flub typetests --dir . --reset --previous --normalize"
```

**What it does**:
- Generates TypeScript type tests
- Validates type compatibility across versions
- Ensures type safety guarantees

**Not yet documented for Bazel**

**Impact**: Type compatibility testing not integrated

**Recommendation**:
- Create Bazel rule for flub type test generation
- Add to BUILD files where used
- Integrate with test targets

### 3. CJS Package Stub (LOW PRIORITY)

**Current State**: Uses copyfiles in package.json

**Examples**:
```json
"tsc": "fluid-tsc commonjs --project ./tsconfig.cjs.json && copyfiles -f ../../../common/build/build-common/src/cjs/package.json ./dist",
"place:cjs:package-stub": "copyfiles -f ./src/cjs/package.json ./dist"
```

**What it does**:
- Copies `package.json` stub to CJS dist directory
- Contains `{"type": "commonjs"}` to mark as CJS

**Impact**: CJS packages may not have proper module type marker

**Recommendation**:
- Use Bazel `copy_file` rule
- Add to npm_package srcs
- Example:
  ```python
  copy_file(
      name = "cjs_package_json",
      src = "src/cjs/package.json",
      out = "dist/package.json",
  )
  ```

### 4. Per-Package Linting (LOW PRIORITY)

**Current State**: Root-level `//:format` target exists

**Missing**: Per-package lint targets

**Examples**:
```json
"build:lint": {},
"eslint": "eslint src",
"lint": "fluid-build . --task lint"
```

**What it does**:
- Runs Biome/ESLint on package sources
- Validates code style
- Catches common errors

**Current Coverage**: Root `//:format` and `//:format_check` cover workspace

**Impact**: Cannot lint individual packages in isolation

**Recommendation**:
- Add per-package format/lint targets if needed
- Current root-level targets may be sufficient

### 5. Bundle Generation (FUTURE)

**Current State**: Not yet addressed

**Examples**:
```json
"webpack": "webpack",
"webpack:profile": "webpack --profile --json > dist/webpack-stats.json"
```

**What it does**:
- Creates browser bundles
- Optimizes for production
- Generates bundle analysis

**Documented**: No Bazel integration yet

**Impact**: Cannot generate production bundles via Bazel

**Recommendation**:
- Defer to future phase
- Use rules_webpack when needed
- Low priority for library packages

### 6. Documentation Generation (FUTURE)

**Current State**: Not yet addressed

**Examples**:
```json
"build:docs": "...",
"build:gendocs": "..."
```

**What it does**:
- Generates API documentation website
- Processes .api.json files
- Creates markdown/HTML docs

**Impact**: Documentation generation still manual

**Recommendation**:
- Defer to future phase
- May integrate with API Extractor targets

## Migration Priority

### Phase 6 ✅ COMPLETE (2025-10-30)

1. **API Extractor Integration** ✅ **COMPLETE**
   - ✅ 74 packages integrated
   - ✅ All configurations detected and implemented
   - ✅ Tested and validated on multiple packages

### Phase 7 (Recommended Next Phase)

1. **CJS Package Stub** (MEDIUM)
   - Simple to implement
   - Uses standard Bazel copy_file
   - Affects CJS output correctness

2. **Type Tests Integration** (MEDIUM)
   - Important for type safety
   - Requires flub tool integration
   - Affects subset of packages

### Future Phases

3. **Bundle Generation** (when needed)
4. **Documentation Generation** (when needed)
5. **Per-package linting** (if needed beyond root targets)

## Current Workaround

Developers can still run these tasks via npm scripts:

```bash
# API Extractor
cd packages/common/core-interfaces
npm run api-extractor

# Type tests
npm run typetests:gen

# Linting (via root)
bazel run //:format
```

## Impact Assessment

**For Development**:
- ✅ Build and test workflows fully functional
- ✅ Code formatting integrated
- ⚠️ API validation requires npm scripts
- ⚠️ Type tests require npm scripts

**For CI/CD**:
- ✅ Can build and test via Bazel
- ❌ Cannot validate API via Bazel
- ❌ Cannot run type tests via Bazel
- ⚠️ Some tasks still require npm/pnpm

**For Package Quality**:
- ⚠️ API surface not validated in Bazel builds
- ⚠️ Type compatibility not checked in Bazel builds
- ⚠️ Breaking changes might not be caught

## Recommendations

### Immediate (Phase 7)
1. **Add CJS package stubs**
   - Simple copy_file rules
   - Include in npm_package targets

2. **Integrate type tests**
   - Create Bazel wrapper for flub
   - Add to test suites

### Medium-term
3. **Bundle generation** (if needed)
4. **Full documentation pipeline** (if needed)

### Long-term
5. **Per-package linting** (if needed beyond root targets)

## Success Criteria

Phase 6 ✅ **COMPLETE**:
- ✅ API Extractor runs as Bazel targets (74 packages)
- ✅ All API extractor configs detected and integrated
- ✅ CI can validate API surface via Bazel
- ✅ Tested and validated on multiple packages

Phase 7 complete when:
- ✅ CJS package.json stubs copied correctly
- ✅ Type tests integrated (or deferred with rationale)

## References

- [API Extractor Integration](./docs/bazel/API_EXTRACTOR_INTEGRATION.md) - Already documented
- [Session 1.5 Deferral](./SESSION_1.5_DEFERRAL.md) - Original API Extractor deferral
- [Migration Status](./BAZEL_MIGRATION_STATUS.md) - Current migration state

---

**Document Created**: 2025-10-30
**Last Updated**: 2025-10-30
**Status**: Phase 6 complete ✅, Phase 7 planning
