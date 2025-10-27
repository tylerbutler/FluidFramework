# Bazel Migration Tracking

**Project**: FluidFramework TypeScript Monorepo
**Migration Start Date**: 2025-10-27
**Current Phase**: Phase 1 - Proof of Concept (In Progress)
**Overall Progress**: 8% (5/66 sessions complete)

---

## Quick Status Overview

| Phase | Status | Sessions Complete | Total Sessions | Progress |
|-------|--------|-------------------|----------------|----------|
| Phase 0: Setup | ✅ Complete | 2/2 | 2 | 100% |
| Phase 1: PoC | 🔄 In Progress | 3/6 | 6 | 50% |
| Phase 2: Expansion | ⏳ Not Started | 0/15 | 10-15 | 0% |
| Phase 3: Core Migration | ⏳ Not Started | 0/30 | 20-30 | 0% |
| Phase 4: Integration | ⏳ Not Started | 0/8 | 5-8 | 0% |
| Phase 5: Cleanup | ⏳ Not Started | 0/5 | 3-5 | 0% |

**Legend**: ✅ Complete | 🔄 In Progress | ⏳ Not Started | ⚠️ Blocked | ❌ Failed

---

## Phase 0: Environment Setup & Preparation

**Status**: ✅ Complete
**Sessions**: 2/2 complete
**Time Spent**: 1.5 hours
**Estimated Time**: 2-4 hours

### Session 0.1: Bazelisk Installation & Project Structure Setup
**Status**: ✅ Complete
**Date Started**: 2025-10-27
**Date Completed**: 2025-10-27
**Time Spent**: 0.5 hours
**Estimated**: 1-2 hours

#### Tasks
- [x] Install Bazelisk globally via npm
- [x] Create `.bazelversion` file (8.4.2 - upgraded from 7.4.1)
- [x] Verify Bazelisk installation
- [x] Create `bazel-migration/` directory structure
- [x] Initialize TypeScript project for migration scripts
- [x] Create tsconfig for migration scripts

#### Deliverables
- [x] Bazelisk installed and verified
- [x] `.bazelversion` file created (8.4.2)
- [x] Bazel 8.4.2 downloaded and working
- [x] `bazel-migration/` directory structure created
- [x] TypeScript tooling initialized
- [x] Git commit: `chore(bazel): initialize Bazelisk and migration tooling`

#### Validation
```bash
bazel version  # Shows: "Build label: 8.4.2" ✅
cat .bazelversion  # Shows: "8.4.2" ✅
cd bazel-migration && npm install && npm run build  # TypeScript setup verified ✅
```

#### Notes
- Started: 2025-10-27
- Completed: 2025-10-27
- **Decision**: Upgraded from Bazel 7.4.1 to 8.4.2 (latest LTS)
  - Bazel 8.0 is LTS release with better Bzlmod support
  - rules_js and rules_ts optimized for Bazel 8
  - Better performance and future-proof for Bazel 9 migration
- bazel-migration is separate from pnpm workspace, uses npm directly

#### Issues Encountered
- Initial plan called for Bazel 7.4.1, but research showed Bazel 8.4.2 is superior
- Resolved by updating to Bazel 8.4.2 (LTS) for better long-term support

---

### Session 0.2: Bazel Workspace Initialization & Rules Setup
**Status**: ✅ Complete
**Date Started**: 2025-10-27
**Date Completed**: 2025-10-27
**Time Spent**: 1 hour
**Prerequisites**: Session 0.1 complete
**Estimated**: 1-2 hours

#### Tasks
- [x] Create root `WORKSPACE.bazel` file
- [x] Configure aspect_rules_js and aspect_rules_ts
- [x] Create `.bazelrc` with optimized settings and remote cache config
- [x] Create `.bazelignore` file
- [x] Create root `BUILD.bazel` file
- [x] Set up bazel-remote cache (Docker) - documented, not installed (Docker unavailable)

#### Deliverables
- [x] `WORKSPACE.bazel` configured with rules_js v2.4.0 and rules_ts v3.6.3
- [x] `.bazelrc` with optimized settings and remote cache config
- [x] `.bazelignore` configured with 170+ node_modules paths
- [x] Root `BUILD.bazel` created
- [x] Remote cache documentation created (REMOTE_CACHE_SETUP.md)
- [x] Git commit: `chore(bazel): initialize workspace with remote caching`

#### Validation
```bash
bazel info workspace  # ✅ Shows: /home/tylerbu/code/FluidWorkspace/bazel-init
bazel query //:*  # ✅ Returns: //:.npmrc //:BUILD.bazel //:package.json //:pnpm-lock.yaml
# Remote cache not tested (Docker unavailable)
```

#### Notes
- Started: 2025-10-27
- Completed: 2025-10-27
- **aspect_rules_js**: v2.4.0 (latest as of 2025-07-15, Bazel 8 compatible)
- **aspect_rules_ts**: v3.6.3 (Bazel 8 compatible)
- **Bazel Configuration**: WORKSPACE mode (not Bzlmod) - Bzlmod will be future migration
- **Remote Cache**: Configured in .bazelrc but not enabled (Docker unavailable on system)
  - Can use disk cache (~/.cache/bazel) for now
  - Remote cache can be enabled later via BAZEL_REMOTE_CACHE_URL env var
- **node_modules Exclusion**: All 170+ package node_modules paths added to .bazelignore
- **npm_translate_lock**: Verification temporarily disabled to avoid false errors during setup

#### Issues Encountered
- Empty SHA256 hashes caused download failures - resolved by using Bazel-provided hashes
- Bzlmod warning: disabled in favor of WORKSPACE mode for now
- node_modules verification required explicit listing of all paths in .bazelignore
- Docker not available on system - remote cache setup documented but not tested

#### Next Steps
- Session 1.1: Create BUILD File Generation Script
- Can enable remote cache later when Docker becomes available
- Consider re-enabling verify_node_modules_ignored after confirming .bazelignore is complete

---

## Phase 1: Proof of Concept - Foundation Packages

**Status**: 🔄 In Progress
**Sessions**: 3/6 complete
**Prerequisites**: Phase 0 complete
**Estimated Time**: 8-12 hours
**Time Spent So Far**: 3.5 hours

### Session 1.1: Create BUILD File Generation Script
**Status**: ✅ Complete
**Date Started**: 2025-10-27
**Date Completed**: 2025-10-27
**Time Spent**: 0.5 hours
**Prerequisites**: Phase 0 complete
**Estimated**: 1-2 hours

#### Tasks
- [x] Create `generate-build-file.ts` script
- [x] Create `package-mapper.ts` utility
- [x] Compile and verify scripts

#### Deliverables
- [x] BUILD file generation script created
- [x] Package mapping utility created
- [x] Scripts compile without errors
- [x] Git commit: `feat(bazel): add BUILD file generation tooling`

#### Validation
```bash
pnpm tsc  # Compiles successfully ✅
node dist/package-mapper.js .  # Generates map with 94 packages ✅
node dist/generate-build-file.js packages/common/core-interfaces  # Creates BUILD.bazel ✅
```

#### Notes
- Scripts handle ESM + CJS dual compilation
- Detects test frameworks (Mocha/Jest) automatically
- Package mapper excludes CJS stub package.json files in src/cjs/
- Dependency resolution via package mapping JSON works correctly
- Generated 94 package mappings successfully

#### Issues Encountered
- Initial glob pattern picked up src/cjs/package.json files
- Resolved by adding src/cjs/** to ignore patterns

---

### Session 1.2: Migrate @fluidframework/core-interfaces
**Status**: ✅ Complete (production build), ⚠️ Tests deferred to Phase 2
**Date Started**: 2025-10-27
**Date Completed**: 2025-10-27
**Time Spent**: 2.5 hours
**Prerequisites**: Session 1.1 complete
**Estimated**: 1-2 hours
**Actual**: 2.5 hours (test investigation took longer than expected)

#### Tasks
- [x] Generate package mapping (94 packages mapped)
- [x] Create BUILD.bazel for core-interfaces
- [x] Build package with Bazel (ESM + CJS) **WITH FULL VALIDATION**
- [~] Run tests (BLOCKED - deferred to Phase 2, see BAZEL_MIGRATION_ISSUES.md)
- [~] Create output validation script (deferred to later session)

#### Deliverables
- [x] BUILD.bazel for core-interfaces with complete ts_project configuration
- [x] Package builds successfully with full TypeScript validation enabled
  - ESM: 25 .js + 25 .d.ts + 50 source maps = 100 files
  - CJS: 25 .js + 25 .d.ts + 50 source maps = 100 files
- [x] Inline tsconfig files (no extends) - **validated and working**
- [x] BUILD.bazel for common/build/build-common (tsconfig exports)
- [x] npm_link_all_packages setup in root BUILD.bazel
- [x] BAZEL_MIGRATION_ISSUES.md - comprehensive issue tracking
- [x] SESSION_1.2_SUMMARY.md - detailed session documentation
- [~] Test compilation (652 errors, module resolution issues, OOM with path mappings)
- [x] Git commit: `feat(bazel): migrate @fluidframework/core-interfaces production build` ✅

#### Validation
```bash
# Production builds ✅
bazel build //packages/common/core-interfaces:core_interfaces_esm  # ✅ Success with validation
bazel build //packages/common/core-interfaces:core_interfaces_cjs  # ✅ Success with validation
bazel build //packages/common/core-interfaces:core_interfaces      # ✅ Both builds
ls bazel-bin/packages/common/core-interfaces/lib/*.js   # ✅ 25 ESM files + maps
ls bazel-bin/packages/common/core-interfaces/lib/*.d.ts # ✅ 25 declaration files
ls bazel-bin/packages/common/core-interfaces/dist/*.js  # ✅ 25 CJS files + maps
ls bazel-bin/packages/common/core-interfaces/dist/*.d.ts # ✅ 25 declaration files

# Test compilation ❌
bazel build //packages/common/core-interfaces:core_interfaces_test  # ❌ 652 module resolution errors
```

#### Critical Issues Resolved
1. **TypeScript Version**: `ts_version = "5.4.5"` (exact version, not semver range)
2. **rules_shell**: Added http_archive for toolchain dependency
3. **tsconfig extends**: Created inline tsconfig files - **VALIDATION NOW ENABLED** ✅
4. **npm Package Linking**: Added `npm_link_all_packages` to root BUILD.bazel
5. **ts_project Attributes**: Added all compiler options to match tsconfig (composite, declaration_map, etc.)
6. **@types/mocha**: Created minimal mocha.d.ts workaround (temporary)

#### Known Issues (Documented in BAZEL_MIGRATION_ISSUES.md)
1. **Test Compilation BLOCKED** - Module resolution for package-name imports
   - TypeScript path mappings cause OOM (out of memory) errors
   - Without path mappings: 652 errors across 15 test files
   - **Decision**: Defer to Phase 2 for systematic test architecture design
2. **@types Packages**: npm_translate_lock doesn't expose @types/* as Bazel targets
3. **pnpm Version Mismatch**: Cannot use `update_pnpm_lock = True` (requires pnpm 10, have 8.15.9)
4. **Node Version Mismatch**: Workspace expects >=20.15.1, have 18.20.8

#### Architecture Decisions
- **Inline tsconfig**: Use self-contained tsconfig files without extends for Bazel reliability
- **Full Validation**: Never disable validation (`validate = False`) - work through issues properly
- **Test Deferral**: Production build quality over partial test support - address tests systematically
- **Workaround Documentation**: All temporary solutions documented in BAZEL_MIGRATION_ISSUES.md

#### Files Modified
- `WORKSPACE.bazel` - TypeScript version, rules_shell
- `BUILD.bazel` - npm_link_all_packages
- `common/build/build-common/BUILD.bazel` - tsconfig exports
- `packages/common/core-interfaces/BUILD.bazel` - complete ts_project setup

#### Files Created
- `packages/common/core-interfaces/tsconfig.bazel.json` - ESM config (inline)
- `packages/common/core-interfaces/tsconfig.cjs.bazel.json` - CJS config (inline)
- `packages/common/core-interfaces/src/test/tsconfig.bazel.json` - test config
- `packages/common/core-interfaces/src/test/mocha.d.ts` - temporary mocha types
- `BAZEL_MIGRATION_ISSUES.md` - comprehensive issue tracker
- `SESSION_1.2_SUMMARY.md` - detailed session documentation

#### Key Learnings
1. **Work Through Issues**: User feedback: "work through these issues, not skip them" - led to proper solutions
2. **TypeScript Path Mappings**: Can cause severe memory issues at scale - use cautiously
3. **Bazel Sandbox**: Strict isolation requires self-contained configs
4. **Test Complexity**: Test module resolution is a hard problem deserving systematic design
5. **Documentation Value**: Tracking issues and decisions is crucial for long migrations

#### Next Steps
1. **Immediate**: Create output validation script, commit working builds
2. **Phase 2**: Design test architecture for module resolution
3. **Phase 2**: Investigate npm_translate_lock @types package support
4. **Future**: Bzlmod migration (WORKSPACE deprecated in Bazel 9)

---

### Session 1.3: Migrate @fluidframework/driver-definitions
**Status**: ✅ Complete
**Date Started**: 2025-10-27
**Date Completed**: 2025-10-27
**Time Spent**: 0.5 hours
**Prerequisites**: Session 1.2 complete
**Estimated**: 1-2 hours
**Actual**: 0.5 hours (faster due to established patterns)

#### Tasks
- [x] Create BUILD.bazel with dependency on core-interfaces
- [x] Create inline tsconfig files with path mappings
- [x] Build and validate (ESM + CJS)
- [x] Validate dependency resolution

#### Deliverables
- [x] BUILD.bazel for driver-definitions created
- [x] Workspace dependency resolution working with TypeScript path mappings
- [x] Both packages build together (cached builds < 1s)
- [x] ESM: 19 .js + 19 .d.ts + source maps (38 files)
- [x] CJS: 19 .js + 19 .d.ts + source maps (38 files)
- [x] Git commit: `feat(bazel): migrate @fluidframework/driver-definitions with dependencies`

#### Validation
```bash
# Build individual packages ✅
bazel build //packages/common/driver-definitions:driver_definitions_esm  # ✅
bazel build //packages/common/driver-definitions:driver_definitions_cjs  # ✅
bazel build //packages/common/driver-definitions:driver_definitions      # ✅

# Build both packages together ✅
bazel build //packages/common/core-interfaces:core_interfaces //packages/common/driver-definitions:driver_definitions  # ✅ < 1s cached

# Validate dependency resolution ✅
bazel query "allpaths(//packages/common/driver-definitions:driver_definitions_esm, //packages/common/core-interfaces:core_interfaces_esm)"  # ✅ Shows dependency path
```

#### Key Solution: TypeScript Path Mappings
**Problem**: driver-definitions imports `@fluidframework/core-interfaces` as package name, but Bazel sandbox doesn't provide npm-style module resolution.

**Solution**: Added TypeScript `paths` compiler option to tsconfig files to map package imports to Bazel build outputs:
```json
"paths": {
  "@fluidframework/core-interfaces": ["../core-interfaces/lib/index.d.ts"],
  "@fluidframework/core-interfaces/*": ["../core-interfaces/lib/*"]
}
```

This allows TypeScript to resolve package-name imports to the actual compiled outputs without needing node_modules.

#### Files Created
- `packages/common/driver-definitions/BUILD.bazel`
- `packages/common/driver-definitions/tsconfig.bazel.json` (ESM with path mappings)
- `packages/common/driver-definitions/tsconfig.cjs.bazel.json` (CJS with path mappings)

#### Key Learnings
1. **Path Mappings Solution**: TypeScript path mappings enable cross-package imports in Bazel without node_modules
2. **Pattern Reusability**: Inline tsconfig pattern from core-interfaces worked immediately for driver-definitions
3. **Build Speed**: Cached builds are extremely fast (< 1s) when dependencies unchanged
4. **Dependency Validation**: `bazel query` is excellent for verifying dependency graphs

#### Next Steps
1. **Session 1.4**: Migrate @fluidframework/container-definitions (multi-level dependencies)
2. **Pattern Script**: Update BUILD generation script to automatically add path mappings for dependencies
3. **Documentation**: Document path mapping pattern for future package migrations

---

### Session 1.4: Migrate @fluidframework/container-definitions
**Status**: ⏳ Not Started
**Prerequisites**: Session 1.3 complete
**Estimated**: 1-2 hours

#### Tasks
- [ ] Create BUILD.bazel with multi-dependency chain
- [ ] Build and test dependency chain
- [ ] Verify transitive dependencies

#### Deliverables
- [ ] BUILD.bazel for container-definitions created
- [ ] Multi-level dependency chain working
- [ ] All three PoC packages build together
- [ ] Dependency graph validated
- [ ] Git commit: `feat(bazel): migrate @fluidframework/container-definitions with multi-deps`

---

### Session 1.5: API Extraction Integration
**Status**: ⏳ Not Started
**Prerequisites**: Session 1.4 complete
**Estimated**: 1-2 hours

#### Tasks
- [ ] Create Bazel rule for API Extractor
- [ ] Add API extraction to PoC packages
- [ ] Test API extraction
- [ ] Update package BUILD files to include API reports
- [ ] Verify API extraction runs on every build

#### Deliverables
- [ ] API Extractor Bazel rule created
- [ ] API reports generated as build targets
- [ ] API extraction included in default package build
- [ ] Reports match fluid-build outputs
- [ ] Git commit: `feat(bazel): integrate API extraction as mandatory build target`

---

### Session 1.6: PoC Documentation & Retrospective
**Status**: ⏳ Not Started
**Prerequisites**: Sessions 1.1-1.5 complete
**Estimated**: 1-2 hours

#### Tasks
- [ ] Create PoC summary document
- [ ] Finalize BUILD generation script
- [ ] Document patterns and conventions
- [ ] Collect performance metrics

#### Deliverables
- [ ] PoC summary document created
- [ ] BUILD generation script finalized
- [ ] Patterns documented
- [ ] Performance metrics collected
- [ ] Git commit: `docs(bazel): document PoC outcomes and conventions`

---

## Phase 2: Expansion - Common & Utility Packages

**Status**: ⏳ Not Started
**Sessions**: 0/15 complete
**Prerequisites**: Phase 1 complete
**Estimated Time**: 15-25 hours

### Session 2.1: Migrate common/ Packages (Batch 1)
**Status**: ⏳ Not Started
**Estimated**: 1-2 hours

#### Packages
- @fluidframework/core-utils
- @fluid-internal/client-utils

#### Tasks
- [ ] Run BUILD generation script for each package
- [ ] Adjust dependencies
- [ ] Build and test
- [ ] Validate outputs
- [ ] Commit changes

---

### Sessions 2.2-2.15
**Status**: ⏳ Not Started
**Note**: Will be detailed as Phase 1 completes

---

## Phase 3: Core Framework Migration

**Status**: ⏳ Not Started
**Sessions**: 0/30 complete
**Prerequisites**: Phase 2 complete
**Estimated Time**: 30-50 hours

### Categories to Migrate
- [ ] dds/ (16 packages, ~6-8 sessions)
- [ ] drivers/ (4 packages, ~2 sessions)
- [ ] loader/ (5 packages, ~2 sessions)
- [ ] runtime/ (10+ packages, ~4-5 sessions)
- [ ] framework/ (15+ packages, ~6-8 sessions)
- [ ] service-clients/ (3+ packages, ~2 sessions)

**Note**: Detailed session plans will be added as Phase 2 progresses

---

## Phase 4: Build Integration & Optimization

**Status**: ⏳ Not Started
**Sessions**: 0/8 complete
**Prerequisites**: Phase 3 complete
**Estimated Time**: 8-12 hours

### Planned Sessions
- [ ] Session 4.1: Create Root Build Targets
- [ ] Session 4.2: Jest Test Integration
- [ ] Session 4.3: Webpack Bundle Integration
- [ ] Session 4.4: CI Integration
- [ ] Session 4.5: Remote Caching Setup (Production)
- [ ] Session 4.6: Build Performance Optimization
- [ ] Session 4.7-4.8: Documentation & Developer Tooling

---

## Phase 5: Cleanup & Finalization

**Status**: ⏳ Not Started
**Sessions**: 0/5 complete
**Prerequisites**: Phase 4 complete
**Estimated Time**: 4-8 hours

### Planned Sessions
- [ ] Session 5.1: Remove fluid-build
- [ ] Session 5.2: Update Documentation
- [ ] Session 5.3: Team Training Materials
- [ ] Session 5.4: Final Validation
- [ ] Session 5.5: Migration Retrospective

---

## Migration Scripts Status

**Location**: `bazel-migration/scripts/`

### Core Scripts
- [ ] `generate-build-file.ts` - Generate BUILD.bazel for a package
- [ ] `package-mapper.ts` - Create package name → Bazel target mapping
- [ ] `validate-outputs.ts` - Compare Bazel vs fluid-build outputs
- [ ] `migrate-package.ts` - Full migration workflow for one package
- [ ] `dependency-graph.ts` - Analyze and visualize package dependencies
- [ ] `batch-migrate.ts` - Migrate multiple packages in dependency order

---

## Success Metrics Tracking

### Phase 1 (PoC) Success Criteria
- [ ] 3 packages build with Bazel
- [ ] Outputs identical to fluid-build
- [ ] Tests pass
- [ ] Build scripts repeatable
- [ ] Performance acceptable (within 20% of fluid-build)

### Phase 2-3 (Migration) Success Criteria
- [ ] All packages build with Bazel
- [ ] All tests pass
- [ ] CI pipeline using Bazel
- [ ] Developer documentation complete

### Phase 4-5 (Optimization) Success Criteria
- [ ] Build performance ≥ fluid-build
- [ ] Remote caching operational
- [ ] fluid-build removed
- [ ] Team trained and productive

---

## Build Performance Metrics

### fluid-build Baseline
- Full build (clean): TBD
- Full build (cached): TBD
- Incremental build: TBD

### Bazel Performance
- Full build (clean): TBD
- Full build (disk cache): TBD
- Full build (remote cache): TBD
- Incremental build: TBD

**Performance Improvement**: TBD

---

## Issues & Blockers

### Active Issues
None currently

### Resolved Issues
None yet

### Known Risks
1. API Extractor Integration - May need custom Bazel rules
2. Dual Compilation - ESM + CJS pattern might need refinement
3. External Dependencies - Some npm packages may need special handling
4. Test Framework Differences - Jest integration more complex than Mocha
5. Build Performance - Initial builds may be slower until caching optimized

---

## Questions to Resolve

### Open Questions
1. ❓ How should we handle API extraction in Bazel workflow?
2. ❓ What's the expected behavior for `pnpm-lock.yaml` with Bazel?
3. ❓ Should we use Bazel for all scripts, or keep some as npm scripts?
4. ❓ How to handle packages with native dependencies?
5. ❓ Remote cache location and configuration for team?

### Resolved Questions
None yet

---

## Timeline & Milestones

| Milestone | Target Date | Status | Actual Date |
|-----------|-------------|--------|-------------|
| Phase 0 Complete | TBD | ✅ Complete | 2025-10-27 |
| Phase 1 Complete (PoC) | TBD | 🔄 In Progress | - |
| Phase 2 Complete | TBD | ⏳ Not Started | - |
| Phase 3 Complete | TBD | ⏳ Not Started | - |
| Phase 4 Complete | TBD | ⏳ Not Started | - |
| Phase 5 Complete | TBD | ⏳ Not Started | - |
| Migration Complete | TBD | ⏳ Not Started | - |

---

## Session Log

### 2025-10-27
- Started migration planning
- Created tracking document
- **Session 0.1 COMPLETE**: Bazelisk Installation & Project Structure Setup
  - Installed Bazelisk globally
  - Created .bazelversion (8.4.2 - upgraded from 7.4.1)
  - Set up bazel-migration tooling structure
  - Verified Bazel 8.4.2 installation
  - Updated migration plan to reflect Bazel 8
  - Time: 0.5 hours
- **Session 0.2 COMPLETE**: Bazel Workspace Initialization & Rules Setup
  - Created WORKSPACE.bazel with aspect_rules_js v2.4.0 and aspect_rules_ts v3.6.3
  - Configured .bazelrc with build optimizations and remote cache support
  - Created .bazelignore with all 170+ node_modules paths
  - Created root BUILD.bazel file
  - Documented remote cache setup (REMOTE_CACHE_SETUP.md)
  - Workspace loads successfully, ready for Phase 1
  - Time: 1 hour
- **Phase 0 COMPLETE**: Environment Setup & Preparation (1.5 hours total)
- **Session 1.1 COMPLETE**: Create BUILD File Generation Script
  - Created generate-build-file.ts for BUILD.bazel generation
  - Created package-mapper.ts for package → Bazel target mapping
  - Scripts compile and execute successfully
  - Generated package map with 94 packages
  - Time: 0.5 hours
- **Session 1.2 COMPLETE**: Migrate @fluidframework/core-interfaces
  - Created BUILD.bazel for core-interfaces with ESM + CJS targets
  - Fixed WORKSPACE.bazel TypeScript version (exact 5.4.5, not semver)
  - Added rules_shell dependency for rules_ts
  - Created js_library wrappers for shared tsconfig files
  - Successfully built ESM (25 files) and CJS (25 files) outputs
  - Deferred test configuration (mocha binary loading issue)
  - Time: 1 hour

---

## Notes & Learnings

### General Notes
- Using Bazelisk for version management (not direct Bazel)
- Target Bazel version: **8.4.2** (upgraded from 7.4.1 - LTS release)
- No backward compatibility - complete switch to Bazel
- All migration steps must be scripted and repeatable
- Remote caching configured from the start

### Technical Decisions
- **Bazel Version**: Using 8.4.2 instead of 7.4.1 for better Bzlmod support and LTS
- Using aspect_rules_js and aspect_rules_ts for modern JS/TS support
- pnpm-lock.yaml treated as npm lockfile (no separate lock file)
- API extraction integrated as build targets (not separate step)
- bazel-remote for PoC, cloud cache for production
- bazel-migration tooling uses npm (separate from pnpm workspace)

### Best Practices Discovered
(Will be populated as migration progresses)

---

**Last Updated**: 2025-10-27
**Next Session**: Session 1.3 - Migrate @fluidframework/driver-definitions (with npm test setup)
**Document Version**: 1.3
