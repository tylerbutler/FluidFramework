# Parallel Migration Groups - Bazel Migration

**Generated**: 2025-10-28
**Current Status**: 22/88 packages migrated (25%)
**Remaining**: 66 packages (63 in analysis + 3 framework packages without package.json)

---

## Strategy

Groups are organized by:
1. **Dependency count** (low to high)
2. **Category isolation** (avoid cross-dependencies within group)
3. **Parallel execution** (3-5 packages per group)

---

## Group 1: Low-Dependency Drivers (5 packages)
**Category**: drivers
**Max Dependencies**: 6 workspace deps
**Estimated Time**: 1.5-2 hours

```
1. @fluidframework/tinylicious-driver      (4 ws_deps)
2. @fluidframework/debugger                (4 ws_deps)
3. @fluidframework/odsp-urlresolver        (6 ws_deps)
4. @fluidframework/file-driver             (6 ws_deps)
5. @fluidframework/routerlicious-driver    (7 ws_deps) - UNBLOCKS test-runtime-utils!
```

**Priority**: HIGH - routerlicious-driver unblocks final runtime package
**Dependencies**: All driver dependencies are already migrated

---

## Group 2: Simple DDS Packages (5 packages)
**Category**: dds
**Max Dependencies**: 7 workspace deps
**Estimated Time**: 1.5-2 hours

```
1. @fluid-experimental/ink                 (6 ws_deps)
2. @fluidframework/shared-summary-block    (6 ws_deps)
3. @fluidframework/cell                    (7 ws_deps)
4. @fluidframework/counter                 (7 ws_deps)
5. @fluidframework/register-collection     (8 ws_deps)
```

**Dependencies**: Core runtime packages (all migrated ✅)
**Risk**: Low - simple DDS with minimal dependencies

---

## Group 3: Mid-Complexity DDS (5 packages)
**Category**: dds
**Max Dependencies**: 10 workspace deps
**Estimated Time**: 2-2.5 hours

```
1. @fluid-experimental/pact-map            (8 ws_deps)
2. @fluidframework/legacy-dds              (9 ws_deps)
3. @fluidframework/ordered-collection      (9 ws_deps)
4. @fluidframework/task-manager            (10 ws_deps)
5. @fluidframework/merge-tree              (10 ws_deps)
```

**Dependencies**: Runtime + simple DDS packages
**Risk**: Medium - may depend on Group 2 DDS

---

## Group 4: Complex DDS & Shared Base (5 packages)
**Category**: dds
**Max Dependencies**: 12 workspace deps
**Estimated Time**: 2-3 hours

```
1. @fluidframework/map                     (10 ws_deps)
2. @fluidframework/sequence                (10 ws_deps)
3. @fluidframework/shared-object-base      (11 ws_deps)
4. @fluid-private/test-dds-utils           (11 ws_deps)
5. @fluidframework/matrix                  (11 ws_deps)
```

**Dependencies**: Runtime + Groups 2-3 DDS
**Risk**: Medium-High - complex interdependencies

---

## Group 5: Tree DDS (1 package - special case)
**Category**: dds
**Max Dependencies**: 17 total deps (11 workspace)
**Estimated Time**: 1-1.5 hours

```
1. @fluidframework/tree                    (11 ws_deps, 17 total)
```

**Why Separate**: Large package with many external deps, deserves focused attention
**Dependencies**: All DDS from Groups 2-4
**Risk**: High - most complex DDS package

---

## Group 6: Low-Dependency Framework (5 packages)
**Category**: framework
**Max Dependencies**: 5 workspace deps
**Estimated Time**: 1.5-2 hours

```
1. @fluidframework/synthesize              (1 ws_dep)
2. @fluidframework/tree-agent-ses          (1 ws_dep)
3. @fluidframework/tree-agent-langchain    (2 ws_deps)
4. @fluidframework/tree-agent              (4 ws_deps)
5. @fluidframework/request-handler         (5 ws_deps)
```

**Dependencies**: Minimal - mostly core packages
**Risk**: Low - isolated framework utilities

---

## Group 7: Mid-Level Framework (5 packages)
**Category**: framework
**Max Dependencies**: 7 workspace deps
**Estimated Time**: 1.5-2 hours

```
1. @fluid-experimental/oldest-client-observer  (5 ws_deps)
2. @fluid-experimental/dds-interceptions       (5 ws_deps)
3. @fluidframework/undo-redo                   (5 ws_deps)
4. @fluidframework/ai-collab                   (4 ws_deps)
5. @fluidframework/react                       (7 ws_deps)
```

**Dependencies**: Core + some DDS packages
**Risk**: Low-Medium

---

## Group 8: Advanced Framework (5 packages)
**Category**: framework
**Max Dependencies**: 13 workspace deps
**Estimated Time**: 2-2.5 hours

```
1. @fluidframework/agent-scheduler         (11 ws_deps)
2. fluid-framework                         (11 ws_deps) - Main framework package!
3. @fluid-experimental/attributor          (12 ws_deps)
4. @fluid-experimental/data-object-base    (12 ws_deps)
5. @fluidframework/presence                (13 ws_deps)
```

**Dependencies**: Runtime + DDS + Groups 6-7 framework
**Risk**: Medium - core framework packages

---

## Group 9: Top-Level Framework (2 packages)
**Category**: framework
**Max Dependencies**: 16 workspace deps
**Estimated Time**: 1.5-2 hours

```
1. @fluidframework/aqueduct                (16 ws_deps)
2. @fluidframework/fluid-static            (16 ws_deps)
```

**Dependencies**: Everything in Groups 1-8
**Risk**: High - top-level aggregation packages

---

## Group 10: Remaining Drivers (2 packages)
**Category**: drivers
**Max Dependencies**: 9 workspace deps
**Estimated Time**: 1-1.5 hours

```
1. @fluidframework/local-driver            (8 ws_deps)
2. @fluidframework/odsp-driver             (9 ws_deps)
```

**Dependencies**: All drivers from Group 1 + DDS packages
**Risk**: Medium - complex driver implementations

---

## Group 11: Loader & Final Runtime (2 packages)
**Category**: Mixed
**Max Dependencies**: 13 workspace deps
**Estimated Time**: 1-1.5 hours

```
1. @fluidframework/container-loader        (7 ws_deps - loader)
2. @fluidframework/test-runtime-utils      (13 ws_deps - runtime) - REQUIRES Group 1!
```

**Dependencies**: Group 1 (routerlicious-driver) for test-runtime-utils
**Risk**: Medium - loader is complex

---

## Group 12: Service Clients (3 packages)
**Category**: service-clients
**Max Dependencies**: 12 workspace deps
**Estimated Time**: 1.5-2 hours

```
1. @fluidframework/azure-client            (8 ws_deps)
2. @fluidframework/odsp-client             (11 ws_deps)
3. @fluidframework/tinylicious-client      (12 ws_deps)
```

**Dependencies**: Framework + Drivers (Groups 1, 8-9)
**Risk**: Medium - high-level client packages

---

## Group 13: Basic Test Utilities (5 packages)
**Category**: test
**Max Dependencies**: 4 workspace deps
**Estimated Time**: 1.5-2 hours

```
1. @fluid-internal/local-server-tests      (0 ws_deps)
2. @fluid-private/test-pairwise-generator  (0 ws_deps)
3. @fluid-internal/functional-tests        (0 ws_deps)
4. @types/jest-environment-puppeteer       (0 ws_deps)
5. @fluid-private/stochastic-test-utils    (1 ws_dep)
```

**Dependencies**: Minimal to none
**Risk**: Low - test infrastructure

---

## Group 14: Mid-Level Test Utilities (3 packages)
**Category**: test
**Max Dependencies**: 15 workspace deps
**Estimated Time**: 1.5-2 hours

```
1. @fluid-internal/mocha-test-setup        (2 ws_deps)
2. @fluid-internal/test-driver-definitions (2 ws_deps)
3. @fluid-private/test-drivers             (15 ws_deps)
```

**Dependencies**: Test infrastructure + drivers (Group 1)
**Risk**: Medium - test driver complexity

---

## Group 15: Advanced Test Packages (3 packages)
**Category**: test
**Max Dependencies**: 22 workspace deps
**Estimated Time**: 2-2.5 hours

```
1. @fluidframework/test-utils              (20 ws_deps)
2. @fluid-internal/test-snapshots          (20 ws_deps)
3. @fluid-internal/test-service-load       (22 ws_deps)
```

**Dependencies**: Most packages from Groups 1-12
**Risk**: High - complex test utilities

---

## Group 16: Top-Level Test Packages (3 packages)
**Category**: test
**Max Dependencies**: 55 workspace deps
**Estimated Time**: 2-3 hours

```
1. @fluid-private/test-version-utils       (27 ws_deps)
2. @fluid-internal/local-server-stress-tests (28 ws_deps)
3. @fluid-private/test-end-to-end-tests    (46 ws_deps) - MASSIVE!
```

**Dependencies**: Nearly everything
**Risk**: VERY HIGH - integration test packages

---

## Group 17: Tools (4 packages)
**Category**: tools
**Max Dependencies**: 27 workspace deps
**Estimated Time**: 1.5-2 hours

```
1. @fluid-private/changelog-generator-wrapper (0 ws_deps)
2. @fluidframework/fluid-runner            (8 ws_deps)
3. @fluid-tools/fetch-tool                 (14 ws_deps)
4. @fluid-internal/replay-tool             (26 ws_deps)
```

**Dependencies**: Variable - tools can be done anytime
**Risk**: Low-Medium - mostly standalone tools

---

## Recommended Execution Order

### Phase 3A: Unblock Runtime (PRIORITY)
1. **Group 1** - Drivers (includes routerlicious-driver)
2. **Group 11** - Complete runtime with test-runtime-utils

### Phase 3B: DDS Foundation (Core Framework)
3. **Group 2** - Simple DDS
4. **Group 3** - Mid-complexity DDS
5. **Group 4** - Complex DDS
6. **Group 5** - Tree DDS (special)

### Phase 3C: Framework Layer
7. **Group 6** - Low-dependency framework
8. **Group 7** - Mid-level framework
9. **Group 8** - Advanced framework
10. **Group 9** - Top-level framework
11. **Group 10** - Remaining drivers

### Phase 3D: Clients & Infrastructure
12. **Group 12** - Service clients
13. **Group 13** - Basic test utilities
14. **Group 14** - Mid-level test utilities
15. **Group 17** - Tools (can be done anytime)

### Phase 3E: Advanced Testing
16. **Group 15** - Advanced test packages
17. **Group 16** - Top-level test packages (FINAL - requires everything)

---

## Estimated Total Time

| Phase | Groups | Packages | Time Estimate |
|-------|--------|----------|---------------|
| 3A: Runtime Completion | 2 | 7 | 3-3.5 hours |
| 3B: DDS Foundation | 4 | 21 | 7-10 hours |
| 3C: Framework Layer | 5 | 19 | 9-12 hours |
| 3D: Clients & Infrastructure | 4 | 17 | 6-8 hours |
| 3E: Advanced Testing | 2 | 6 | 4-5.5 hours |
| **TOTAL** | **17** | **70** | **29-39 hours** |

*Note: 70 packages = 63 analyzed + 7 already in progress/tools*

---

## Parallel Execution Guidelines

### Per Group
- Execute 3-5 packages in parallel using Task agents
- Each agent handles one package independently
- Consolidate results and commit together

### Success Criteria Per Package
1. ✅ BUILD.bazel created
2. ✅ tsconfig.bazel.json & tsconfig.cjs.bazel.json created
3. ✅ Both ESM and CJS targets build successfully
4. ✅ Dependencies resolve correctly

### Pattern Recognition
- **TS1479 fix**: Add package.json to ts_project srcs
- **TypeScript customization**: Check original tsconfig.json for overrides
- **Subpath exports**: Include package.json in js_library srcs
- **Common attributes**: composite, declaration_map, incremental, source_map

---

## Notes

1. **Group 1 is CRITICAL** - Unblocks final runtime package
2. **Group 5 (tree)** - May need special attention due to complexity
3. **Group 16** - Defer until everything else is complete (46 workspace deps!)
4. **Test packages** - Can be deferred to Phase 4 if needed
5. **Tools** - Can be done opportunistically between other groups

---

**Next Session**: Start with Group 1 (Drivers) to unblock runtime completion!
