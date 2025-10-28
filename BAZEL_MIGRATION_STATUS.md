# Bazel Migration Status - Quick Reference

**Last Updated**: 2025-10-28
**Current Phase**: Phase 2 - Expansion (In Progress)
**Overall Progress**: 30% (14/46 core sessions complete)

For full details, see: [BAZEL_MIGRATION_TRACKER.md](./BAZEL_MIGRATION_TRACKER.md)

---

## Quick Status

| Phase | Status | Progress | Sessions |
|-------|--------|----------|----------|
| **Phase 0: Setup** | ✅ Complete | 100% | 2/2 |
| **Phase 1: PoC** | ✅ Complete | 83% | 5/6 |
| **Phase 2: Expansion** | 🔄 In Progress | 78% | 14/18 |
| **Phase 3: Core Migration** | ⏳ Pending | 0% | 0/20 |
| **Phase 4: Integration** | ⏳ Pending | 0% | 0/5 |
| **Phase 5: Cleanup** | ⏳ Pending | 0% | 0/3 |

---

## Recently Completed

### Session 2.14: API Extractor Integration (2025-10-28)
- **Status**: ✅ Complete
- **Implementation**: sh_binary wrapper approach for flub + api-extractor
- **Targets**: `:generate_entrypoints`, `:api_reports_current`, `:api_reports_legacy`
- **Workflow**: TypeScript build → flub entrypoints → API extractor → API reports
- **Validation**: Generated API reports match npm baseline exactly
- **Files**: tools/bazel/run-{flub-entrypoints,api-extractor}.sh, docs/bazel/API_EXTRACTOR_INTEGRATION.md
- **Details**: [BAZEL_MIGRATION_TRACKER.md#session-2.14](./BAZEL_MIGRATION_TRACKER.md)

### Session 2.13: Mocha Test Integration (2025-10-28)
- **Status**: ⚠️ Blocked - npm @types resolution
- **Implementation**: Test target structure established, compilation blocked
- **Blocker**: TypeScript cannot find @types/mocha, @types/node in Bazel sandbox
- **Documentation**: Comprehensive 400-line analysis in docs/bazel/MOCHA_TEST_INTEGRATION.md
- **Decision**: Defer full test integration to Phase 4, continue with build-only migrations
- **Details**: [BAZEL_MIGRATION_TRACKER.md#session-2.13](./BAZEL_MIGRATION_TRACKER.md)

### Session 2.12: Biome Lint/Format Integration (2025-10-28)
- **Status**: ✅ Complete
- **Implementation**: sh_binary wrapper approach with BUILD_WORKSPACE_DIRECTORY
- **Targets**: `//:format`, `//:format_check`
- **Testing**: 5,666 files processed, nested config discovery confirmed
- **Files**: BUILD.bazel, tools/bazel/run-biome.sh, docs/bazel/BIOME_INTEGRATION.md
- **Details**: [BAZEL_MIGRATION_TRACKER.md#session-2.12](./BAZEL_MIGRATION_TRACKER.md)

### Session 2.11: Parallel Migration - 3 Packages (2025-10-27)
- **Packages**: tool-utils, driver-base, driver-web-cache
- **Approach**: Parallel agent execution
- **Details**: [BAZEL_MIGRATION_TRACKER.md#session-2.11](./BAZEL_MIGRATION_TRACKER.md)

---

## Next Session

**Session 2.15+: Continue Phase 2 Package Migrations**
- **Goal**: Migrate remaining Phase 2 packages with full tooling stack
- **Tooling**: ESM/CJS compilation + Biome + API extraction
- **Approach**: 2-3 packages per session, parallel execution where possible
- **Target Categories**: Remaining utils/, drivers/, loader/ packages
- **Pattern**: Copy from core-interfaces BUILD.bazel as template
- **Estimated**: 1-2 hours per session
- **Details**: [BAZEL_MIGRATION_PLAN.md#session-2.15](./BAZEL_MIGRATION_PLAN.md)

---

## Migrated Packages (18 total)

### Phase 1 - PoC (3 packages)
1. @fluidframework/core-interfaces
2. @fluidframework/driver-definitions
3. @fluidframework/container-definitions

### Phase 2 - Expansion (15 packages)

**Common Packages (5)**:
4. @fluidframework/core-utils
5. @fluid-internal/client-utils

**Utils Packages (5)**:
6. @fluidframework/telemetry-utils
7. @fluidframework/tool-utils

**Driver Packages (5)**:
8. @fluidframework/odsp-driver-definitions
9. @fluidframework/routerlicious-urlresolver
10. @fluidframework/driver-utils
11. @fluidframework/driver-base
12. @fluidframework/driver-web-cache

**Loader Packages (2)**:
13. @fluid-private/test-loader-utils

**Other (1)**:
14. @fluidframework/odsp-doclib-utils

*Note: Session numbers may not align exactly due to parallel migrations and tooling sessions*

---

## Established Patterns

### Build Patterns
- **Dual Compilation**: ESM (lib/) + CJS (dist/) via ts_project
- **TypeScript Configs**: tsconfig.bazel.json, tsconfig.cjs.bazel.json
- **Dependency Pattern**: npm deps via //:node_modules/package-name
- **Target Naming**: `{package}_esm`, `{package}_cjs`, `{package}` (filegroup)

### Test Patterns
- **Mocha**: ⚠️ Blocked - npm @types resolution (Session 2.13 deferred to Phase 4)

### Tooling Patterns
- **Biome**: sh_binary wrapper with BUILD_WORKSPACE_DIRECTORY (Session 2.12)
- **API Extraction**: flub entrypoints → api-extractor (Session 2.14)

### Migration Scripts
- Located in: `bazel-migration/scripts/`
- Not actively used yet (manual BUILD file creation preferred)

---

## Key Files & Locations

| File/Directory | Purpose |
|----------------|---------|
| `WORKSPACE.bazel` | Workspace configuration, rules_js/rules_ts setup |
| `.bazelrc` | Build settings, remote cache config |
| `BUILD.bazel` (root) | Root-level targets (format, format_check) |
| `bazel-migration/` | Migration scripts and tooling |
| `packages/*/BUILD.bazel` | Per-package build definitions |
| `packages/*/tsconfig.bazel.json` | Bazel-specific TypeScript configs |
| `tools/bazel/` | Bazel utility scripts (wrappers, helpers) |
| `docs/bazel/` | Bazel integration documentation |
| `docs/bazel/API_EXTRACTOR_INTEGRATION.md` | API Extractor integration guide |
| `docs/bazel/BIOME_INTEGRATION.md` | Biome lint/format integration |
| `docs/bazel/MOCHA_TEST_INTEGRATION.md` | Mocha test integration analysis |

---

## Common Commands

```bash
# Format entire workspace
bazel run //:format

# Check formatting (CI)
bazel run //:format_check

# Build a package (both ESM + CJS)
bazel build //packages/common/core-interfaces:core_interfaces

# Build specific format
bazel build //packages/common/core-interfaces:core_interfaces_esm

# Run tests (when Session 2.13 complete)
bazel test //packages/common/core-interfaces:test

# Query dependencies
bazel query "deps(//packages/common/core-interfaces:core_interfaces_esm)"
```

---

## Next Steps (Roadmap)

### Immediate (Phase 2)
1. ✅ **Session 2.13**: Mocha test integration (blocked - deferred to Phase 4)
2. ✅ **Session 2.14**: API Extractor integration
3. **Session 2.15-2.18**: Complete remaining Phase 2 packages with full tooling

### Short-term (Phase 3)
- Begin systematic migration of core framework packages
- Target: dds/, drivers/, loader/, runtime/, framework/
- Use parallel agent approach where applicable

### Medium-term (Phase 4)
- Jest test integration
- Webpack bundle integration
- CI/CD pipeline updates
- Remote cache production setup

---

## Issues & Decisions

### Major Decisions
- **Bazel Version**: 8.4.2 (LTS) instead of 7.4.1
- **npm Deps**: Direct via pnpm-lock.yaml (no separate lock)
- **API Extraction**: sh_binary wrapper approach (Session 2.14)
- **Biome Integration**: sh_binary wrapper with BUILD_WORKSPACE_DIRECTORY
- **Test Integration**: Deferred to Phase 4 (npm @types resolution blocker)

### Known Issues
- Mocha test integration blocked by npm @types resolution (deferred to Phase 4)
- Jest integration pending (Phase 4)
- No remote cache in production yet (using local disk cache)

---

## Documentation

- **Migration Plan**: [BAZEL_MIGRATION_PLAN.md](./BAZEL_MIGRATION_PLAN.md)
- **Full Tracker**: [BAZEL_MIGRATION_TRACKER.md](./BAZEL_MIGRATION_TRACKER.md)
- **Biome Integration**: [docs/bazel/BIOME_INTEGRATION.md](./docs/bazel/BIOME_INTEGRATION.md)
- **API Extractor Integration**: [docs/bazel/API_EXTRACTOR_INTEGRATION.md](./docs/bazel/API_EXTRACTOR_INTEGRATION.md)
- **Mocha Test Analysis**: [docs/bazel/MOCHA_TEST_INTEGRATION.md](./docs/bazel/MOCHA_TEST_INTEGRATION.md)

---

**For detailed session notes, implementation patterns, and troubleshooting, see the full tracker**: [BAZEL_MIGRATION_TRACKER.md](./BAZEL_MIGRATION_TRACKER.md)
