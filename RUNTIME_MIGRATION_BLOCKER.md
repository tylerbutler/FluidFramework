# Runtime Migration Blocker - SOLVED

**Status**: ✅ **RESOLVED** - Solution found and tested
**Session**: 2.17 (2025-10-28)
**Impact**: Phase 3 runtime migrations can now proceed
**Solution**: Add `package.json` to ts_project srcs (see TS1479_SOLUTION.md)

---

## Problem Summary

**@fluidframework/id-compressor** has TypeScript TS1479 module detection error (same as replay-driver from Session 2.16). This package is a **foundational dependency for ALL runtime packages**, creating a complete dependency chain blocker.

## Dependency Chain Analysis

```
id-compressor (❌ TS1479 error)
├─→ runtime-definitions (⛔ BLOCKED - depends on id-compressor)
    ├─→ datastore-definitions (⛔ BLOCKED - depends on runtime-definitions)
    ├─→ container-runtime-definitions (⛔ BLOCKED - depends on runtime-definitions)
    └─→ runtime-utils (⛔ BLOCKED - depends on runtime-definitions)
        └─→ datastore (⛔ BLOCKED - depends on runtime-utils)
            └─→ container-runtime (⛔ BLOCKED - depends on datastore)
```

**Result**: Cannot migrate ANY packages in `packages/runtime/` directory.

## Impact Assessment

### Phase 3 Status
- **Planned**: 8 runtime packages
- **Migrated**: 0 packages
- **Blocked**: 8 packages (100%)
- **Success Rate**: 0% (critical failure)

### Overall Migration Status
- **Phase 1 (PoC)**: 3/3 packages (100%)
- **Phase 2 (Expansion)**: 14/15 packages (93%) - replay-driver has same TS1479 issue
- **Phase 3 (Runtime)**: 0/8 packages (0%) - **COMPLETELY BLOCKED**

### Affected Packages
All packages in `packages/runtime/`:
1. ❌ id-compressor - TS1479 error (root cause)
2. ⛔ runtime-definitions - blocked by #1
3. ⛔ datastore-definitions - blocked by #2
4. ⛔ container-runtime-definitions - blocked by #2
5. ⛔ runtime-utils - blocked by #2, #3, #4
6. ⛔ test-runtime-utils - blocked by #5
7. ⛔ datastore - blocked by #5
8. ⛔ container-runtime - blocked by #7

## Root Cause: TS1479 Error Pattern

### Error Description
```
TS1479: The current file is a CommonJS module whose imports will produce 'require' calls;
however, the referenced file is an ECMAScript module and cannot be imported with 'require'.
```

### Why This Occurs
TypeScript incorrectly detects source files as CommonJS despite:
- ✅ `"type": "module"` in package.json
- ✅ `"module": "Node16"` in tsconfig
- ✅ Correct npm_link_all_packages setup
- ✅ npm build works perfectly (`pnpm run esnext` succeeds)

### Packages with TS1479 Error
1. **replay-driver** (Session 2.16) - documented, deferred
2. **id-compressor** (Session 2.17) - **BLOCKS ALL RUNTIME**

### Success Rate
- **Working packages**: 14/16 (87.5%)
- **TS1479 failures**: 2/16 (12.5%)

## Investigation Attempts

### Verified Configuration
All standard approaches have been verified:
- ✅ npm_link_all_packages correctly configured
- ✅ tsconfig.bazel.json matches working packages
- ✅ BUILD.bazel follows Session 2.15 proven pattern
- ✅ ts_project attributes match tsconfig settings
- ✅ Package structure identical to working packages

### Comparison with Working Packages
**driver-utils** (builds successfully):
- Has `/internal` subpath imports ✅
- Uses `"type": "module"` ✅
- Dual ESM/CJS compilation ✅
- Uses `fluid-tsc` for CJS ✅
- **WORKS** with identical configuration

**id-compressor** (TS1479 error):
- Has `/internal` subpath imports ✅
- Uses `"type": "module"` ✅
- Dual ESM/CJS compilation ✅
- Uses `fluid-tsc` for CJS ✅
- **FAILS** with identical configuration

**Conclusion**: Unknown root cause. No configuration differences identified.

## Migration Strategy Options

### Option 1: Fix id-compressor (IDEAL but UNKNOWN SOLUTION)
**Status**: No known solution after extensive investigation (Sessions 2.16, 2.17)

**Attempts**:
- Standard npm_package pattern ❌
- TSConfig attribute alignment ❌
- Package.json markers ❌ (tried in Session 2.16)
- fluid-tsc wrapper ❌ (tried in Session 2.16)

**Blocker**: Root cause unknown despite identical config to working packages

### Option 2: Skip runtime/, Migrate Other Categories (RECOMMENDED)
**Status**: Feasible alternative path

**Available Categories**:
- `packages/dds/` (16 packages) - May not depend on runtime
- `packages/framework/` (15+ packages) - Higher-level, may depend on runtime
- `packages/drivers/` (remaining packages) - 1 already has TS1479 issue
- `packages/loader/` (remaining packages) - Already partially migrated

**Strategy**:
1. Check dependency graphs for dds/ and framework/
2. Identify packages that DON'T depend on runtime
3. Continue Phase 3 with non-runtime packages
4. Defer runtime/ until TS1479 root cause discovered

### Option 3: Use npm Packages for id-compressor (WORKAROUND)
**Status**: May violate Bazel hermeticity principles

**Approach**:
- Keep id-compressor as npm dependency (not Bazel target)
- Migrate packages that depend on it
- Accept that id-compressor isn't built by Bazel

**Concerns**:
- Breaks hermetic build principle
- May cause version inconsistencies
- Not a true "complete migration"

### Option 4: Investigate External TypeScript Bug (LONG-TERM)
**Status**: Research required

**Approach**:
- File TypeScript issue with repro case
- Investigate Bazel ts_rules implementation
- Check aspect_rules_ts for similar issues

**Timeline**: Unknown, could take weeks/months

## Solution Found!

**The Fix**: Add `package.json` to ts_project srcs list:

```python
ts_project(
    name = "my_package_esm",
    srcs = glob(["src/**/*.ts"]) + ["package.json"],  # <-- THIS FIXES TS1479
    # ... rest of configuration
)
```

**Root Cause**: TypeScript in Bazel sandbox couldn't see package.json with `"type": "module"`

**Verified Working**:
- ✅ @fluidframework/id-compressor - builds successfully
- ✅ @fluidframework/replay-driver - builds successfully

**Next Steps**:
1. Continue Phase 3 runtime migrations with this fix
2. Apply same fix to any new packages with TS1479 errors
3. Update Bazel migration guide with this pattern
4. Full solution documented in TS1479_SOLUTION.md

## Files Created

### Session 2.17
- `packages/runtime/id-compressor/BUILD.bazel` (❌ fails with TS1479)
- `packages/runtime/id-compressor/tsconfig.bazel.json`
- `packages/runtime/id-compressor/tsconfig.cjs.bazel.json`
- `packages/runtime/id-compressor/BAZEL_BUILD_ISSUE.md`
- `packages/runtime/runtime-definitions/BUILD.bazel` (⛔ blocked by id-compressor)
- `packages/runtime/runtime-definitions/tsconfig.bazel.json`
- `packages/runtime/runtime-definitions/tsconfig.cjs.bazel.json`
- `RUNTIME_MIGRATION_BLOCKER.md` (this file)

## Related Documentation

- **Session 2.15**: Breakthrough - npm_package pattern solves TypeScript subpath exports
- **Session 2.16**: replay-driver TS1479 issue documented, deferred
- **Session 2.17**: id-compressor TS1479 issue blocks ALL runtime packages

---

**Last Updated**: 2025-10-28
**Session**: 2.17 - Begin Phase 3 (BLOCKED)
**Status**: 🚨 CRITICAL - Runtime migrations cannot proceed
**Recommendation**: Skip runtime/, migrate dds/ or framework/ instead
