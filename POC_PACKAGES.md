# PoC Package Selection & Migration Plan

## Quick Summary

For the Bazel migration Proof of Concept, we recommend migrating **3 packages in sequence**:

1. **@fluidframework/core-interfaces** (foundation - NO deps)
2. **@fluidframework/driver-definitions** (adds 1 dep)
3. **@fluidframework/container-definitions** (adds multi-dep chain)

This progression tests:
- Phase 1: Basic Bazel TypeScript setup
- Phase 2: Inter-package workspace dependencies
- Phase 3: Dependency chains and complexity

---

## PACKAGE 1: @fluidframework/core-interfaces

### Why This Package?
✓ **Zero production dependencies** - only devDependencies  
✓ **Small scope** - interface definitions only (~500-1000 LOC)  
✓ **Standard build pattern** - dual ESM/CJS output  
✓ **Type validation** - includes API extraction & type tests  

### Package Details
```
Location: packages/common/core-interfaces
Name: @fluidframework/core-interfaces
Version: 2.70.0

Build Outputs:
├── lib/              (ESM - tsc output)
├── dist/             (CommonJS - tsc + transpile)
├── *.d.ts            (Type definitions - public, legacy, internal)
└── api-report/       (API documentation)

Scripts:
- build:esnext       → tsc --project ./tsconfig.json
- tsc               → fluid-tsc commonjs --project ./tsconfig.cjs.json
- api              → api-extractor
- test:mocha       → mocha tests
- lint             → eslint + api validation

Dependencies: NONE (only devDependencies)
Test Frameworks: Mocha
```

### Bazel BUILD Targets
```starlark
# Core compilation targets
ts_library(
  name = "core_interfaces_esm",
  srcs = glob(["src/**/*.ts"], exclude=["src/test/**"]),
  declaration = True,
  out_dir = "lib",
  tsconfig = ":tsconfig_esm",
)

ts_library(
  name = "core_interfaces_cjs",
  srcs = glob(["src/**/*.ts"], exclude=["src/test/**"]),
  declaration = True,
  out_dir = "dist",
  tsconfig = ":tsconfig_cjs",
  devmode = "cjs",
)

# Type tests
ts_library(
  name = "core_interfaces_tests",
  srcs = glob(["src/test/**/*.ts"]),
  deps = [":core_interfaces_esm"],
  tsconfig = ":tsconfig_test",
)

# API extraction
genrule(
  name = "api_extractor",
  srcs = [":core_interfaces_esm"],
  outs = ["api-report/core-interfaces.api.md"],
  cmd = "api-extractor run --config api-extractor/api-extractor.json",
)

# Test target
mocha_test(
  name = "test",
  srcs = [":core_interfaces_tests"],
)
```

### Migration Timeline
- **Time Estimate**: 2-3 hours
- **Validation**: Output comparison with fluid-build
- **Risk Level**: LOW (no deps, isolated)

---

## PACKAGE 2: @fluidframework/driver-definitions

### Why This Package?
✓ **Minimal dependencies** - only depends on core-interfaces  
✓ **Tests workspace dependency handling** - uses workspace:~ pattern  
✓ **Same build pattern** - dual ESM/CJS, API extraction  
✓ **Foundation for other packages** - widely depended on  

### Package Details
```
Location: packages/common/driver-definitions
Name: @fluidframework/driver-definitions
Version: 2.70.0

Dependencies:
├── @fluidframework/core-interfaces (workspace:~)
└── (devDependencies only)

Build Pattern: Same as core-interfaces
- ESM + CJS dual compilation
- API extraction with public/legacy configs
- Type validation tests

Test Setup: Mocha
Size: ~800-1200 LOC
```

### Bazel BUILD Targets
```starlark
ts_library(
  name = "driver_definitions_esm",
  srcs = glob(["src/**/*.ts"], exclude=["src/test/**"]),
  deps = [
    "//packages/common/core-interfaces:core_interfaces_esm",
  ],
  declaration = True,
  out_dir = "lib",
  tsconfig = ":tsconfig_esm",
)

ts_library(
  name = "driver_definitions_cjs",
  srcs = glob(["src/**/*.ts"], exclude=["src/test/**"]),
  deps = [
    "//packages/common/core-interfaces:core_interfaces_cjs",
  ],
  declaration = True,
  out_dir = "dist",
  tsconfig = ":tsconfig_cjs",
  devmode = "cjs",
)

mocha_test(
  name = "test",
  srcs = glob(["src/test/**/*.spec.ts"]),
  deps = [":driver_definitions_esm"],
)
```

### Key Testing Points
- ✓ Workspace dependency resolution
- ✓ Transitive dependency handling
- ✓ Type declaration chaining
- ✓ ESM imports from ESM, CJS from CJS

### Migration Timeline
- **Time Estimate**: 2-3 hours
- **Complexity**: Minimal (builds on core-interfaces)
- **Risk Level**: LOW (single dependency)

---

## PACKAGE 3: @fluidframework/container-definitions

### Why This Package?
✓ **Multi-dependency chain** - depends on both core-interfaces and driver-definitions  
✓ **Tests transitive dependencies** - full dependency graph  
✓ **Complex API extraction** - breaking change detection  
✓ **Real-world complexity** - validates full PoC scope  

### Package Details
```
Location: packages/common/container-definitions
Name: @fluidframework/container-definitions
Version: 2.70.0

Dependencies:
├── @fluidframework/core-interfaces (workspace:~)
├── @fluidframework/driver-definitions (workspace:~)
└── (devDependencies only)

Build Features:
- Dual ESM/CJS compilation
- API extraction (public, legacy, internal)
- Breaking change detection
- Type validation across deps

Test Setup: Mocha (no unit tests - interface-only package)
Size: ~1200-1800 LOC
Complexity: Medium
```

### Bazel BUILD Targets
```starlark
ts_library(
  name = "container_definitions_esm",
  srcs = glob(["src/**/*.ts"], exclude=["src/test/**"]),
  deps = [
    "//packages/common/core-interfaces:core_interfaces_esm",
    "//packages/common/driver-definitions:driver_definitions_esm",
  ],
  declaration = True,
  out_dir = "lib",
  tsconfig = ":tsconfig_esm",
)

ts_library(
  name = "container_definitions_cjs",
  srcs = glob(["src/**/*.ts"], exclude=["src/test/**"]),
  deps = [
    "//packages/common/core-interfaces:core_interfaces_cjs",
    "//packages/common/driver-definitions:driver_definitions_cjs",
  ],
  declaration = True,
  out_dir = "dist",
  tsconfig = ":tsconfig_cjs",
  devmode = "cjs",
)

# API extraction with legacy config
genrule(
  name = "api_extractor_public",
  srcs = [":container_definitions_esm"],
  outs = ["api-report/container-definitions.api.md"],
  cmd = "api-extractor run --config api-extractor/api-extractor.public.json",
)

genrule(
  name = "api_extractor_legacy",
  srcs = [":container_definitions_esm"],
  outs = ["api-report/container-definitions.legacy.api.md"],
  cmd = "api-extractor run --config api-extractor/api-extractor.legacy.json",
)

# Combined test (file existence check since no unit tests)
sh_test(
  name = "test",
  srcs = [":api_extractor_public", ":api_extractor_legacy"],
  cmd = "exit 0",  # Placeholder - validates API generation
)
```

### Complexity Validated
- ✓ Multi-level dependency chains
- ✓ Transitive type declarations
- ✓ Parallel API extraction configs
- ✓ Build ordering constraints
- ✓ Type validation ordering

### Migration Timeline
- **Time Estimate**: 3-4 hours
- **Complexity**: Medium
- **Risk Level**: MEDIUM (multi-dependency, API extraction)

---

## VALIDATION & SUCCESS CRITERIA

### Phase 1 Success (Package 1)
- [ ] Bazel builds core-interfaces
- [ ] ESM output matches lib/
- [ ] CJS output matches dist/
- [ ] Type declarations generated correctly
- [ ] API extraction runs
- [ ] Tests execute with mocha
- [ ] Build time ≤ fluid-build time

### Phase 2 Success (Package 1 + 2)
- [ ] Both packages build correctly
- [ ] Workspace dependency resolution works
- [ ] Cross-package imports resolve
- [ ] Type declarations chain correctly
- [ ] All tests pass
- [ ] No manual intervention needed

### Phase 3 Success (Packages 1 + 2 + 3)
- [ ] All three packages build
- [ ] Multi-level dependency chains work
- [ ] API extraction validates across chains
- [ ] Tests pass with correct types
- [ ] Build outputs are deterministic
- [ ] Incremental builds work
- [ ] Clean builds produce identical output

---

## OUTPUT COMPARISON MATRIX

### Expected Bazel vs fluid-build Outputs

| Aspect | fluid-build | Bazel | Notes |
|--------|-----------|-------|-------|
| ESM files | lib/*.js | lib/*.js | Identical |
| CJS files | dist/*.js | dist/*.js | Identical |
| Type declarations | lib/*.d.ts, dist/*.d.ts | lib/*.d.ts, dist/*.d.ts | Identical |
| API reports | api-report/*.api.md | api-report/*.api.md | Identical |
| Test results | PASS/FAIL | PASS/FAIL | Same tests |
| Build time | ~2-3s | ~2-3s | Bazel can cache |

---

## FILE STRUCTURE FOR PoC

```
packages/
├── common/
│   ├── core-interfaces/
│   │   ├── BUILD                (new)
│   │   ├── src/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── ...
│   ├── driver-definitions/
│   │   ├── BUILD                (new)
│   │   └── ...
│   └── container-definitions/
│       ├── BUILD                (new)
│       └── ...
│
└── WORKSPACE.bazel            (new - root workspace)
```

### WORKSPACE.bazel (root)
```bazel
workspace(name = "fluidframework")

# Load Bazel rules
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Node.js rules
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "...",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/..."],
)

load("@build_bazel_rules_nodejs//:repositories.bzl", "rules_nodejs_dependencies")
rules_nodejs_dependencies()

# TypeScript rules
http_archive(
    name = "aspect_rules_ts",
    sha256 = "...",
    urls = ["https://github.com/aspect-build/rules_ts/releases/download/..."],
)

load("@aspect_rules_ts//ts:repositories.bzl", "rules_ts_dependencies")
rules_ts_dependencies(ts_version = "5.4.5")

# pnpm for node_modules
load("@aspect_rules_js//js:repositories.bzl", "rules_js_dependencies")
rules_js_dependencies()

# Register pnpm toolchain
bazel_dep(name = "rules_nodejs", version = "...")
```

---

## NEXT STEPS

1. **Environment Setup** (1 hour)
   - Install Bazel
   - Set up VS Code Bazel extension
   - Clone Fluid repo with bazel-init branch

2. **Package 1: core-interfaces** (2-3 hours)
   - Create BUILD file
   - Configure TypeScript rules
   - Validate outputs
   - Run first tests

3. **Package 2: driver-definitions** (2-3 hours)
   - Create BUILD file
   - Test workspace dependencies
   - Validate transitive types

4. **Package 3: container-definitions** (3-4 hours)
   - Create BUILD file
   - Multi-dependency validation
   - API extraction testing

5. **Documentation** (2 hours)
   - Document Bazel patterns
   - Create build guide
   - Record learnings

**Total PoC Time**: 12-16 hours (~2 days)

---

**Last Updated**: October 27, 2025
**Status**: Ready for PoC Implementation
**Recommended Start**: Phase 1 with core-interfaces

