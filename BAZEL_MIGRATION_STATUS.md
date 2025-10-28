# Bazel Migration Status - Quick Reference

**Last Updated**: 2025-10-28
**Current Phase**: Phase 2 - Expansion (In Progress)
**Overall Progress**: 28% (13/46 core sessions complete)

For full details, see: [BAZEL_MIGRATION_TRACKER.md](./BAZEL_MIGRATION_TRACKER.md)

---

## Quick Status

| Phase | Status | Progress | Sessions |
|-------|--------|----------|----------|
| **Phase 0: Setup** | ✅ Complete | 100% | 2/2 |
| **Phase 1: PoC** | ✅ Complete | 83% | 5/6 |
| **Phase 2: Expansion** | 🔄 In Progress | 72% | 13/18 |
| **Phase 3: Core Migration** | ⏳ Pending | 0% | 0/20 |
| **Phase 4: Integration** | ⏳ Pending | 0% | 0/5 |
| **Phase 5: Cleanup** | ⏳ Pending | 0% | 0/3 |

---

## Recently Completed

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

**Session 2.14: Tooling Integration - API Extractor**
- **Goal**: Establish API Extractor integration pattern for API report generation
- **Reference**: @fluidframework/core-interfaces
- **Key Tasks**:
  - js_run_binary rule for api_extractor
  - Configure api-extractor.json paths for Bazel
  - Generate and validate API reports
  - Document API extraction pattern
- **Estimated**: 2 hours
- **Note**: May encounter similar npm dependency issues as Session 2.13
- **Details**: [BAZEL_MIGRATION_TRACKER.md#session-2.14](./BAZEL_MIGRATION_TRACKER.md)

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
1. **Session 2.13**: Mocha test integration
2. **Session 2.14**: API Extractor integration (deferred from Phase 1)
3. **Session 2.15-2.18**: Complete remaining Phase 2 packages

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
- **API Extraction**: Deferred to Session 2.14 (after test patterns established)
- **Biome Integration**: Wrapper script approach instead of js_binary

### Known Issues
- API extraction pattern not yet established (Session 2.14)
- Jest integration pending (Phase 4)
- No remote cache in production yet (using local disk cache)

---

## Documentation

- **Migration Plan**: [BAZEL_MIGRATION_PLAN.md](./BAZEL_MIGRATION_PLAN.md)
- **Full Tracker**: [BAZEL_MIGRATION_TRACKER.md](./BAZEL_MIGRATION_TRACKER.md)
- **Biome Integration**: [docs/bazel/BIOME_INTEGRATION.md](./docs/bazel/BIOME_INTEGRATION.md)

---

**For detailed session notes, implementation patterns, and troubleshooting, see the full tracker**: [BAZEL_MIGRATION_TRACKER.md](./BAZEL_MIGRATION_TRACKER.md)
