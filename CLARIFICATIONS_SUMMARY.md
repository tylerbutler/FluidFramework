# Migration Plan Clarifications - Applied Changes

**Date**: 2025-10-27
**Context**: User questions answered and migration plan updated accordingly

---

## Questions & Answers

### 1. Should API extraction be part of the Bazel build, or run separately?

**Answer**: Part of build

**Applied Changes**:
- ✅ Session 1.5 updated to emphasize API extraction as mandatory build target
- ✅ API reports included in default package build targets
- ✅ BUILD file template updated to include `:api_report` in filegroup
- ✅ Validation updated to verify API extraction runs on every build

**Implementation**:
```python
# Default package target now includes API reports
filegroup(
    name = "core_interfaces",
    srcs = [
        ":core_interfaces_esm",
        ":core_interfaces_cjs",
        ":api_report",  # Mandatory part of build
    ],
)
```

**Impact**:
- Build command `bazel build //packages/...` automatically generates API reports
- Breaking changes detected during build, not as separate step
- Faster feedback loop for API changes

---

### 2. How should we handle pnpm-lock.yaml with Bazel?

**Answer**: Treat it the same as npm lockfile

**Applied Changes**:
- ✅ WORKSPACE.bazel uses `npm_translate_lock` with `pnpm_lock = "//:pnpm-lock.yaml"`
- ✅ No separate lock file needed
- ✅ Bazel reads pnpm-lock.yaml directly

**Implementation**:
```python
# WORKSPACE.bazel
load("@aspect_rules_js//npm:repositories.bzl", "npm_translate_lock")
npm_translate_lock(
    name = "npm",
    pnpm_lock = "//:pnpm-lock.yaml",  # Use existing pnpm lockfile
    verify_node_modules_ignored = "//:.bazelignore",
)
```

**Impact**:
- No need to maintain separate Bazel npm lockfile
- Single source of truth for dependencies
- `pnpm install` and Bazel use same locked versions

---

### 3. Remote caching - from the start or add later?

**Answer**: From the start, even for PoC

**Applied Changes**:
- ✅ Session 0.2 updated to include remote cache setup
- ✅ `.bazelrc` includes remote cache configuration from day one
- ✅ Docker-based `bazel-remote` for local testing/PoC
- ✅ Cache validation added to Session 0.2 deliverables
- ✅ PoC capabilities updated to include remote caching

**Implementation**:
```bash
# Docker command for local cache (PoC)
docker run -d \
  --name bazel-remote \
  -p 8080:8080 \
  -v $(pwd)/.bazel-cache:/data \
  buchgr/bazel-remote-cache:latest

# .bazelrc configuration
build --remote_cache=http://localhost:8080
```

**Impact**:
- Fast builds even during PoC phase
- Proves caching concept early
- Team members can share cache on local network
- Easy upgrade path to cloud cache (Phase 4)

---

### 4. Bazel vs Bazelisk - explain differences

**Answer**: Use Bazelisk (see BAZEL_VS_BAZELISK.md)

**Applied Changes**:
- ✅ Created comprehensive comparison document: `BAZEL_VS_BAZELISK.md`
- ✅ Session 0.1 updated to install Bazelisk (not Bazel directly)
- ✅ `.bazelversion` file creation added to Session 0.1
- ✅ Validation updated to check for correct version
- ✅ Configuration Decisions section added with Bazelisk rationale

**Key Points**:
- **Bazelisk** = Version manager (like nvm for Node.js)
- **Bazel** = The actual build tool
- `.bazelversion` file pins version (7.4.1) for team consistency
- Everyone automatically uses same version via Bazelisk

**Implementation**:
```bash
# Install Bazelisk once
npm install -g @bazel/bazelisk

# Pin version in repository
echo "7.4.1" > .bazelversion

# Use 'bazel' commands normally (Bazelisk intercepts)
bazel build //...
```

**Impact**:
- Team version consistency automatic
- Easy version upgrades (change one file)
- CI automatically uses correct version
- No manual coordination needed

---

## Configuration Decisions Summary

Added new section to migration plan documenting key decisions:

### 1. Version Management
- **Tool**: Bazelisk (not direct Bazel)
- **Version**: Bazel 7.4.1
- **Rationale**: Automatic team consistency, easy upgrades

### 2. API Extraction
- **Integration**: Part of build (not separate)
- **Validation**: Breaking changes detected during build
- **Target**: Included in default package builds

### 3. Dependency Management
- **Lockfile**: Use existing `pnpm-lock.yaml`
- **Integration**: `npm_translate_lock` reads it directly
- **Maintenance**: Single source of truth

### 4. Remote Caching
- **Timeline**: Configured from start (Phase 0)
- **PoC**: Local `bazel-remote` via Docker
- **Production**: Upgrade to cloud cache in Phase 4

---

## Files Modified

1. **BAZEL_MIGRATION_PLAN.md**
   - Added "Configuration Decisions" section
   - Updated Session 0.1: Bazelisk installation
   - Updated Session 0.2: Remote cache setup
   - Updated Session 1.5: API extraction mandatory
   - Updated PoC capabilities list

2. **BAZEL_VS_BAZELISK.md** (new)
   - Comprehensive comparison
   - Installation instructions
   - Team consistency benefits
   - Analogy to nvm/pyenv

3. **CLARIFICATIONS_SUMMARY.md** (this file)
   - Documents all Q&A
   - Applied changes
   - Implementation details

---

## Impact on Timeline

**No change to overall timeline** (8-12 weeks, 46-66 sessions)

Session time adjustments:
- Session 0.1: +10 minutes (create .bazelversion file)
- Session 0.2: +15 minutes (remote cache setup)
- Session 1.5: No change (API extraction was already planned)

**Total added time**: ~25 minutes across Phase 0
**Benefit**: Faster builds throughout entire migration due to early caching

---

## Next Steps

**Ready to begin**: Session 0.1 - Bazelisk Installation & Project Structure Setup

All clarifications applied. Migration plan is complete and ready for execution.

---

## Quick Reference

### Commands for Session 0.1
```bash
# Install Bazelisk
npm install -g @bazel/bazelisk

# Create version file
echo "7.4.1" > .bazelversion

# Verify
bazel version  # Should show: "Build label: 7.4.1"
```

### Commands for Session 0.2
```bash
# Start remote cache
docker run -d --name bazel-remote -p 8080:8080 \
  -v $(pwd)/.bazel-cache:/data buchgr/bazel-remote-cache:latest

# Verify cache
curl http://localhost:8080/status
```

### Build Commands (After PoC Complete)
```bash
# Build package (includes ESM + CJS + API reports)
bazel build //packages/common/core-interfaces:core_interfaces

# Build all packages
bazel build //packages/...

# Run tests
bazel test //packages/...
```

---

**Status**: ✅ All clarifications applied, plan ready for execution
