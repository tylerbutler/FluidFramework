# Bazel Migration Planning - FluidFramework Monorepo

Complete migration plan for switching FluidFramework from fluid-build to Bazel.

## Quick Start

**Ready to begin?** Start with [BAZEL_MIGRATION_PLAN.md](./BAZEL_MIGRATION_PLAN.md) → Session 0.1

## Documents Overview

### Primary Documents

1. **[BAZEL_MIGRATION_PLAN.md](./BAZEL_MIGRATION_PLAN.md)** ⭐ **START HERE**
   - Complete step-by-step migration plan
   - 5 phases, 46-66 sessions (8-12 weeks)
   - Each session: 1-2 hours with clear deliverables
   - PoC → Expansion → Core Migration → Integration → Cleanup

2. **[CLARIFICATIONS_SUMMARY.md](./CLARIFICATIONS_SUMMARY.md)**
   - Configuration decisions and rationale
   - Q&A: API extraction, lockfiles, caching, versioning
   - Applied changes to migration plan

3. **[BAZEL_VS_BAZELISK.md](./BAZEL_VS_BAZELISK.md)**
   - Version management comparison
   - Why use Bazelisk over direct Bazel
   - Installation and team consistency benefits

### Analysis Documents

4. **[MONOREPO_ANALYSIS.md](./MONOREPO_ANALYSIS.md)**
   - Deep technical analysis of FluidFramework
   - Build system architecture
   - TypeScript configuration
   - Dependency graph analysis

5. **[POC_PACKAGES.md](./POC_PACKAGES.md)**
   - PoC package selection strategy
   - 3-package progression for validation
   - Success criteria and validation matrix

6. **[EXPLORATION_SUMMARY.txt](./EXPLORATION_SUMMARY.txt)**
   - Quick reference for project structure
   - Package organization
   - Build patterns

## Migration Timeline

```
Phase 0: Setup (2 sessions, 2-4h)
├─ Session 0.1: Bazelisk installation
└─ Session 0.2: Workspace & remote cache setup

Phase 1: PoC (6 sessions, 8-12h)
├─ Session 1.1: BUILD generation scripts
├─ Session 1.2: core-interfaces (zero deps)
├─ Session 1.3: driver-definitions (1 dep)
├─ Session 1.4: container-definitions (multi-deps)
├─ Session 1.5: API extraction integration
└─ Session 1.6: PoC documentation

Phase 2: Expansion (10-15 sessions, 15-25h)
└─ Migrate common/, utils/, test/ packages

Phase 3: Core Migration (20-30 sessions, 30-50h)
└─ Migrate all remaining packages by category

Phase 4-5: Integration & Cleanup (8-13 sessions, 12-20h)
└─ CI, optimization, remove fluid-build, docs

Total: 46-66 sessions, 8-12 weeks
```

## Key Configuration Decisions

### 1. Version Management
- **Use Bazelisk** (not direct Bazel)
- Pin version via `.bazelversion` file (7.4.1)
- Automatic team consistency

### 2. API Extraction
- **Integrated into build** (not separate step)
- API reports as mandatory build targets
- Breaking changes detected during build

### 3. Dependency Management
- **Use existing `pnpm-lock.yaml`**
- `npm_translate_lock` reads it directly
- Single source of truth

### 4. Remote Caching
- **Configured from start** (Phase 0)
- Local `bazel-remote` for PoC
- Cloud cache upgrade in Phase 4

## PoC Strategy

**3-package progression to validate all capabilities**:

1. **@fluidframework/core-interfaces** (2-3h)
   - Zero dependencies (foundation)
   - Validates basic Bazel setup

2. **@fluidframework/driver-definitions** (2-3h)
   - Single dependency on core-interfaces
   - Validates workspace dependencies

3. **@fluidframework/container-definitions** (3-4h)
   - Multi-dependency chain
   - Validates transitive dependencies

**Total PoC time**: 12-16 hours (~2 days)

## Success Criteria

### PoC Success
- ✅ 3 packages build with Bazel
- ✅ Outputs identical to fluid-build
- ✅ All tests pass
- ✅ API extraction working
- ✅ Remote caching functional
- ✅ Scripts repeatable

### Complete Migration Success
- ✅ All 80+ packages build with Bazel
- ✅ CI using Bazel
- ✅ Build performance ≥ fluid-build
- ✅ fluid-build removed
- ✅ Team trained

## File Organization

```
bazel-init/
├── MIGRATION_README.md            ← You are here
├── BAZEL_MIGRATION_PLAN.md        ← Start here (main plan)
├── CLARIFICATIONS_SUMMARY.md      ← Configuration decisions
├── BAZEL_VS_BAZELISK.md           ← Version management guide
├── MONOREPO_ANALYSIS.md           ← Technical analysis
├── POC_PACKAGES.md                ← PoC strategy
└── EXPLORATION_SUMMARY.txt        ← Quick reference
```

## Next Steps

### For Immediate Start

1. Read [BAZEL_MIGRATION_PLAN.md](./BAZEL_MIGRATION_PLAN.md)
2. Begin **Session 0.1**: Bazelisk Installation
   ```bash
   npm install -g @bazel/bazelisk
   echo "7.4.1" > .bazelversion
   bazel version  # Verify installation
   ```

### For Planning Review

1. Read [CLARIFICATIONS_SUMMARY.md](./CLARIFICATIONS_SUMMARY.md) for configuration decisions
2. Review [BAZEL_VS_BAZELISK.md](./BAZEL_VS_BAZELISK.md) for version management
3. Study [POC_PACKAGES.md](./POC_PACKAGES.md) for PoC strategy

### For Technical Context

1. Read [MONOREPO_ANALYSIS.md](./MONOREPO_ANALYSIS.md) for deep technical analysis
2. Reference [EXPLORATION_SUMMARY.txt](./EXPLORATION_SUMMARY.txt) for quick lookup

## Tools & Resources

### Required Tools
- **Bazelisk**: `npm install -g @bazel/bazelisk`
- **Docker**: For local remote cache (bazel-remote)
- **TypeScript**: For migration scripts (~5.4.5)
- **pnpm**: Package manager (10.18.3)

### Bazel Rules
- `aspect_rules_js`: JavaScript/npm integration
- `aspect_rules_ts`: TypeScript compilation
- Version specs in WORKSPACE.bazel

### Documentation Links
- Bazel: https://bazel.build/
- Bazelisk: https://github.com/bazelbuild/bazelisk
- aspect_rules_js: https://github.com/aspect-build/rules_js
- aspect_rules_ts: https://github.com/aspect-build/rules_ts
- bazel-remote: https://github.com/buchgr/bazel-remote

## Session-Based Execution

Each session is designed for **1-2 hours** with:
- Clear prerequisites
- Specific tasks
- Validation steps
- Deliverables
- Git commit message template

**Different Claude sessions can pick up where previous left off.**

## Questions?

- Configuration questions? See [CLARIFICATIONS_SUMMARY.md](./CLARIFICATIONS_SUMMARY.md)
- Technical questions? See [MONOREPO_ANALYSIS.md](./MONOREPO_ANALYSIS.md)
- Bazel vs Bazelisk? See [BAZEL_VS_BAZELISK.md](./BAZEL_VS_BAZELISK.md)
- Execution questions? See [BAZEL_MIGRATION_PLAN.md](./BAZEL_MIGRATION_PLAN.md)

## Contact & Feedback

This is a comprehensive plan. Execute sessions one at a time, validate thoroughly, and adjust as needed based on discoveries during implementation.

---

**Status**: ✅ Planning Complete - Ready for Execution

**Next Session**: Session 0.1 - Bazelisk Installation & Project Structure Setup

**Estimated Completion**: 8-12 weeks from start
