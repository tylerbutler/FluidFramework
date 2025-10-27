# FluidFramework Monorepo Analysis - Bazel Migration PoC

## Executive Summary

The FluidFramework is a sophisticated TypeScript monorepo with 80+ packages organized into logical categories (common, dds, drivers, framework, loader, runtime, service-clients, test, tools, utils). Currently uses **fluid-build** (custom build system) with pnpm workspaces.

**Key Insight**: This is a mature, well-structured monorepo with clear architectural boundaries - an excellent candidate for Bazel migration using the "strangler" pattern (gradual package-by-package migration).

---

## 1. PROJECT STRUCTURE

### Monorepo Layout
```
FluidWorkspace/main/
├── packages/
│   ├── common/           (5 packages) - Core interfaces & utilities
│   ├── dds/              (16 packages) - Distributed Data Structures
│   ├── drivers/          (4 packages) - Storage/connectivity drivers
│   ├── framework/        (15+ packages) - Framework implementations
│   ├── loader/           (5 packages) - Loading infrastructure
│   ├── runtime/          (10+ packages) - Runtime components
│   ├── service-clients/  (3+ packages) - Service client libraries
│   ├── test/             (2 packages) - Testing utilities
│   ├── tools/            (5 packages) - Build & development tools
│   └── utils/            (8+ packages) - Utility packages
├── azure/                - Azure-specific packages
├── examples/             - Example applications
├── experimental/         - Experimental features
├── build-tools/          - Build infrastructure (separate workspace)
├── server/               - Server-side code (routerlicious)
└── docs/                 - Documentation
```

### Package Count
- **Total Packages**: ~80+ (across all workspaces)
- **Main Client Packages**: ~65
- **Build Tools Packages**: ~15
- **Organization**: By functional domain (clean separation)

---

## 2. BUILD SYSTEM ARCHITECTURE

### Current System: fluid-build
**Location**: `fluidBuild.config.cjs` (root) + per-package configs

**Build Tasks** (task-based system):
```
Root tasks chain to package-level tasks:
├── ci:build
│   ├── compile (tsc + build:esnext + build:test + build:copy)
│   ├── lint (eslint + good-fences + depcruise + check:exports)
│   └── build:api-reports & build:docs
├── build (same as ci:build but with checks)
├── clean, test:mocha, test:jest, webpack, etc.
└── Custom tasks per-package (fluidBuild.tasks in package.json)
```

**Key Build Patterns**:
- **CommonJS + ESM**: Dual-output compilation
  - tsc: Produces CommonJS (./dist)
  - tsc --project ./tsconfig.json: Produces ESM (./lib)
  - Both required for type validation & export checking

- **API Extraction**: Microsoft API-extractor generates .d.ts files
  - Multiple api-extractor configs per package (public, legacy, internal)
  - Generates API reports for breaking change detection

- **Type Tests**: flub generate typetests
  - Type-level testing for backwards compatibility

### Package.json Script Patterns
Every package includes these standard scripts:
```json
{
  "scripts": {
    "build": "fluid-build . --task build",
    "build:esnext": "tsc --project ./tsconfig.json",
    "build:commonjs": "fluid-build . --task commonjs",  // tsc + test
    "tsc": "fluid-tsc commonjs ...",
    "test:mocha": "mocha ...",
    "test:jest": "jest --ci",
    "lint": "fluid-build . --task lint",
    "eslint": "eslint --format stylish src",
    "clean": "rimraf --glob dist lib *.d.ts ..."
  }
}
```

### Build Outputs
```
package/
├── src/                  - TypeScript sources
├── dist/                 - CommonJS output (Node.js)
├── lib/                  - ESM output (browsers & bundlers)
├── *.d.ts                - Type definition files
├── api-report/           - API documentation
└── api-extractor/        - API extraction configs
```

---

## 3. TYPESCRIPT CONFIGURATION

### Standard tsconfig Setup
**Base Config**: Extends `../../../common/build/build-common/tsconfig.node16.json`

```json
// tsconfig.json (ESM)
{
  "extends": "../../../common/build/build-common/tsconfig.node16.json",
  "include": ["src/**/*"],
  "exclude": ["src/test/**/*"],
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./lib"  // ESM output
  }
}

// tsconfig.cjs.json (CommonJS)
{
  "extends": "../../../common/build/build-common/tsconfig.node16.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist"  // CommonJS output
  }
}
```

### Test tscconfigs
```
src/test/tsconfig.json        - ESM test compilation
src/test/tsconfig.cjs.json    - CommonJS test compilation
src/test/tsconfig.no-exactOptionalPropertyTypes.json  - Type compat testing
```

---

## 4. DEPENDENCY GRAPH ANALYSIS

### Core Dependency Layers (Bottom-Up)

#### Layer 1: NO DEPENDENCIES (Foundation)
These packages have ONLY devDependencies, making them ideal PoC candidates:
- `@fluidframework/core-interfaces` - Core type definitions
- NO OTHER packages in common have zero dependencies

#### Layer 2: BASE UTILITIES (Minimal Dependencies)
- `@fluidframework/driver-definitions` - Depends on: core-interfaces
- `@fluidframework/container-definitions` - Depends on: core-interfaces, driver-definitions
- `@fluid-internal/client-utils` - Depends on: core-interfaces, core-utils + external (base64-js, buffer, sha.js)

#### Layer 3: CORE UTILITIES
- `@fluidframework/core-utils` - Depends on: external utilities only

### Interdependency Ranges
All interdependencies use: `"workspace:~"` format
- Resolved to exact/patched versions within workspace
- Enables tight version coupling required by framework

### External Dependencies (Sample)
Common external deps across packages:
- TypeScript compilation: @types/*, typescript (~5.4.5)
- Testing: mocha, jest, c8 (coverage)
- Build tools: api-extractor, biome, eslint
- Utilities: uuid, events, buffer, base64-js, sha.js

---

## 5. TEST INFRASTRUCTURE

### Testing Frameworks
- **Mocha** - Primary test runner (CJS & ESM variants)
- **Jest** - Browser/UI testing
- **c8** - Code coverage (replaces NYC)
- **Puppeteer** - Browser automation testing

### Test Commands
```bash
# Per-package
npm run test                    # Both mocha + jest
npm run test:mocha              # ESM + CJS variants
npm run test:jest              # Jest tests
npm run test:coverage          # c8 coverage report

# Root workspace
npm run build-and-test          # Build + all tests
npm run build-and-test:jest    # Build + jest only
npm run test:jest:report       # CI-grade jest reporting
npm run ci:test:mocha:coverage # CI with coverage
```

### Test Output Structure
```
package/
├── src/test/
│   ├── mocha/                 - Mocha tests
│   ├── jest/                  - Jest tests
│   └── types/                 - Type validation tests
├── dist/test/
├── lib/test/
└── nyc/                       - Coverage reports
```

---

## 6. LINTING & CODE QUALITY

### Tools
- **ESLint** - JavaScript/TypeScript linting (~8.57.1)
- **Biome** - Fast formatter/linter (@biomejs/biome ~1.9.3)
- **good-fences** - Architecture constraint checking
- **depcruise** - Dependency validation
- **api-extractor** - API report generation & validation

### Lint Commands
```bash
npm run eslint              # Run eslint
npm run eslint:fix         # Auto-fix issues
npm run check:biome        # Biome format check
npm run format:biome       # Auto-format with biome
npm run lint               # fluid-build lint task
npm run lint:fix           # All lint fixes
```

### Architecture Validation
- `.dependency-cruiser.cjs` - Dependency constraint rules
- `.dependency-cruiser-known-violations.json` - Approved exceptions
- Check exports validation (multiple configs per package)

---

## 7. CONFIGURATION FILES OVERVIEW

### Root Configurations
| File | Purpose |
|------|---------|
| `package.json` | Root workspace metadata (65+ scripts) |
| `pnpm-workspace.yaml` | Workspace package definitions |
| `fluidBuild.config.cjs` | fluid-build task definitions |
| `_buildProject.config.cjs` | Build infrastructure layout |
| `biome.jsonc` | Code formatting rules |
| `tsconfig.json` | TypeScript configuration reference |
| `syncpack.config.cjs` | Dependency version synchronization |
| `.pnpmfile.cjs` | pnpm hooks & dependency patches |
| `layerInfo.json` | Package layering definitions |

### Per-Package Configurations
| File | Purpose |
|------|---------|
| `package.json` | Scripts + dependencies + fluidBuild.tasks |
| `tsconfig.json` | ESM compilation |
| `tsconfig.cjs.json` | CommonJS compilation |
| `src/test/tsconfig.json` | Test compilation configs |
| `api-extractor/*.json` | API extraction configurations |
| `.eslintrc.cjs` | ESLint configuration |
| `biome.jsonc` | Biome configuration override |
| `.mocharc.cjs` | Mocha test configuration |
| `jest.config.js` | Jest test configuration |

---

## 8. PoC CANDIDATE PACKAGES

### Recommendation: 3-Package PoC Strategy

#### PoC Phase 1: Foundation Layer (Zero Dependencies)

**1. `@fluidframework/core-interfaces`** ⭐ BEST FIRST CHOICE
- **Path**: `packages/common/core-interfaces`
- **Dependencies**: NONE (only devDependencies)
- **Lines of Code**: ~500-1000 (type definitions only)
- **Scope**: Interface definitions, type utilities
- **Build Complexity**: Low
  - Dual output: ESM (lib/) + CJS (dist/)
  - API extraction (public, legacy, internal)
  - Type validation tests
- **Why First**: Perfect for validating Bazel configuration without dependency complications
- **Migration Effort**: 2-3 hours (basic Bazel setup, dual compilation)

**2. `@fluidframework/driver-definitions`** 
- **Path**: `packages/common/driver-definitions`
- **Dependencies**: `@fluidframework/core-interfaces` (workspace:~)
- **Lines of Code**: ~800-1200
- **Scope**: Driver interfaces & types
- **Build Complexity**: Low-Medium
  - Same dual-output pattern as core-interfaces
  - Introduces first inter-package dependency
- **Why Second**: Tests Bazel workspace dependency handling
- **Migration Effort**: 2-3 hours (build pattern proven, adds workspace dep)

#### PoC Phase 2: Real-World Complexity Layer

**3. `@fluidframework/container-definitions`**
- **Path**: `packages/common/container-definitions`
- **Dependencies**: 
  - core-interfaces (workspace:~)
  - driver-definitions (workspace:~)
- **Lines of Code**: ~1200-1800
- **Scope**: Container interfaces & definitions
- **Build Complexity**: Medium
  - Multi-dependency graph
  - API extraction with breaking change tracking
  - Type validation across dependency chain
- **Why Third**: Tests dependency chains and transitive dependency handling
- **Migration Effort**: 3-4 hours (validates complete stack)

### Why NOT These Packages (Harder PoCs):

- `@fluid-internal/client-utils` - TOO MANY external deps (base64-js, buffer, sha.js, events)
- `@fluidframework/core-utils` - Benchmark suites complicate build
- Any DDS package - Complex internal dependencies, 10+ deps each
- Framework packages - Deep dependency chains (5+ levels)

---

## 9. BUILD SYSTEM CHARACTERISTICS

### fluid-build Features
1. **Task Orchestration**: Directed task graph execution
2. **Workspace Awareness**: Understands inter-package dependencies
3. **Parallel Execution**: Multi-core parallelization support
4. **Incremental Building**: Rebuilds only changed packages
5. **Dependency Tracking**: Automatic dep graph traversal

### Bazel Equivalents
| fluid-build Feature | Bazel Equivalent |
|-------------------|-----------------|
| Tasks | Build targets (ts_library, tsc, jest_test, etc.) |
| Script execution | sh_cmd, genrule |
| Workspace deps | workspace() + local_repository() |
| Dep graph | transitive_deps through BUILD rules |
| Parallel execution | Native - no special config needed |

---

## 10. KEY INSIGHTS FOR BAZEL MIGRATION

### Strengths to Leverage
1. **Clean Package Boundaries**: Each package is self-contained with clear exports
2. **Consistent Build Patterns**: Every package follows same TypeScript→ESM/CJS→API-extract flow
3. **Minimal Runtime Dependencies**: Most deps are devDependencies; runtime deps are well-defined
4. **Type-Safe**: Heavy use of TypeScript with strict type checking
5. **Well-Tested**: Comprehensive test coverage with multiple test frameworks

### Challenges to Address
1. **Dual Output Compilation**: Must produce both lib/ (ESM) and dist/ (CJS) simultaneously
2. **API Extraction Complexity**: Multiple API-extractor configs per package
3. **Complex Dependency Chains**: Deep transitive dependency graph
4. **Mixed Test Frameworks**: Mocha + Jest + c8 coverage
5. **Large Node Dependency Tree**: 1.5MB+ pnpm-lock.yaml

### Architectural Insights
- **Layered Architecture**: Clear separation between core-interfaces → definitions → implementations
- **Type-First Design**: Extensive use of interfaces before implementations
- **Workspace Convention**: "workspace:~" pattern enables tight version coupling
- **Testing as First-Class**: Type tests, unit tests, integration tests all part of build
- **Breaking Change Tracking**: API extraction designed for semantic versioning

---

## 11. BUILD COMMANDS CHEAT SHEET

### Local Development
```bash
# Install dependencies
pnpm install

# Build everything
npm run build                   # Full build with checks
npm run build:fast             # Fast build (worker mode)

# Selective building
npm run build:compile          # Compile only
npm run build:esnext           # ESM only
npm run tsc                    # CommonJS only

# Testing
npm run build-and-test        # Build + all tests
npm run test:mocha            # Mocha tests
npm run test:jest             # Jest tests

# Linting
npm run lint                  # All checks
npm run lint:fix              # Auto-fix all
npm run check:format:repo     # Format check
```

### CI/Build Pipeline
```bash
npm run ci:build              # CI-specific build
npm run ci:build:docs         # Documentation build
npm run ci:test:jest          # Jest with reporting
npm run ci:test:mocha         # Mocha with reporting
npm run ci:test:mocha:coverage # Mocha with coverage
```

### Single Package
```bash
cd packages/common/core-interfaces
npm run build                 # Build this package
npm run test                  # Test this package
npm run clean                 # Clean build artifacts
```

---

## 12. MIGRATION STRATEGY RECOMMENDATION

### Phase 1: Proof of Concept (Weeks 1-2)
**Objective**: Establish Bazel build pattern for foundation packages

**Packages to Migrate**:
1. @fluidframework/core-interfaces (foundation)
2. @fluidframework/driver-definitions (single dep)
3. @fluidframework/container-definitions (multi dep)

**Deliverables**:
- BUILD files for 3 packages
- Bazel rules for TypeScript compilation (ESM + CJS)
- API extraction integration
- Type validation tests
- Test execution (mocha/jest)

**Success Metrics**:
- Bazel builds produce identical output to fluid-build
- Tests pass with same results
- Build time ≤ fluid-build time
- No manual intervention needed

### Phase 2: Expansion (Weeks 3-6)
**Objective**: Migrate 10-15 packages across different categories

**Packages**:
- All common/ packages (5 total)
- Select utils/ packages (3-5)
- Select test/ packages (2-3)

### Phase 3: Integration (Weeks 7+)
**Objective**: Full monorepo migration

**Approach**: Strangler pattern - gradual replacement, parallel execution until complete

---

## 13. TECHNICAL PREREQUISITES

### Tools & Languages
- **TypeScript** ~5.4.5 (strict mode, 100+ packages)
- **pnpm** 10.18.3 (workspace package manager)
- **Node.js** ≥20.15.1 (runtime)
- **ESLint** ~8.57.1 (linting)
- **Biome** ~1.9.3 (formatting)
- **Jest/Mocha** (testing)

### Available Build Tools
- **fluid-build** - Current orchestrator (can be replaced)
- **@fluid-tools/build-cli (flub)** - Utility CLI
- **@microsoft/api-extractor** - API documentation
- **tsc** - TypeScript compiler

### External Build Dependencies
- All npm registry dependencies available
- Locked versions via pnpm-lock.yaml
- Patchable via .patchedDependencies in .pnpmrc

---

## APPENDIX: Package Categories Quick Reference

| Category | Count | Purpose |
|----------|-------|---------|
| **common** | 5 | Core interfaces, utilities, definitions |
| **dds** | 16 | Distributed Data Structures (Map, Tree, Sequence, etc.) |
| **drivers** | 4 | Storage & connectivity drivers |
| **framework** | 15+ | Framework implementations |
| **loader** | 5 | Container loading infrastructure |
| **runtime** | 10+ | Runtime components & storage |
| **service-clients** | 3+ | Service communication clients |
| **test** | 2 | Test utilities & helpers |
| **tools** | 5 | Build & development tools |
| **utils** | 8+ | General utilities & helpers |

---

**Document Generated**: October 27, 2025
**Analysis Scope**: FluidFramework main branch (v2.70.0)
**Build System**: fluid-build → Bazel Migration PoC
