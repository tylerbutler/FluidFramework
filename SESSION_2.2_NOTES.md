# Session 2.2 Notes - npm Dependency Investigation

**Date**: 2025-10-27
**Status**: Investigation Complete - Pattern Identified
**Decision**: Defer client-utils, establish simpler npm dependency pattern first

## Investigation Summary

Attempted to migrate `@fluid-internal/client-utils` as first package with npm dependencies in Phase 2. Discovered that client-utils has **two independent complexities**:

1. **npm package dependencies** (base64-js, sha.js, buffer, events)
2. **`.cts` file compilation** (eventEmitter.cjs imports)

## Key Findings

### npm Package Resolution in Bazel

**Discovery**: aspect_rules_js generates Bazel targets for npm packages via `npm_translate_lock`, but the target naming is non-obvious:

```python
# ❌ Incorrect (doesn't work):
"@npm//base64-js"
"//:node_modules/base64-js"

# ✅ Correct format:
"//:.aspect_rules_js/node_modules/base64-js@1.5.1"
"//:.aspect_rules_js/node_modules/@types+base64-js@1.3.2"
```

**Pattern discovered**:
- Packages: `//:.aspect_rules_js/node_modules/<package-name>@<version>`
- Scoped packages: `//:.aspect_rules_js/node_modules/<scope>+<package>@<version>`
- Always include `@types` packages: `//:.aspect_rules_js/node_modules/@types+<package>@<version>`

**How to find targets**:
```bash
bazel query '//:all' | grep "node_modules/<package-name>"
```

### TypeScript Module Resolution Issue

**Problem**: Even with correct Bazel deps, TypeScript can't resolve npm modules:

```
error TS2307: Cannot find module 'base64-js' or its corresponding type declarations.
```

**Root cause**: `ts_project` from aspect_rules_ts doesn't automatically configure TypeScript module resolution for npm dependencies in the Bazel sandbox. The node_modules aren't physically present in the sandbox.

**Potential solutions** (not yet tested):
1. Use `node_modules` attribute on `ts_project`
2. Configure TypeScript `paths` in tsconfig to map to Bazel outputs
3. Use `js_library` wrapper with different module resolution
4. Investigate aspect_rules_ts documentation for npm dependency handling

### `.cts` File Complexity

Separate issue: `./eventEmitter.cjs` imports require:
- Understanding how `.cts` → `.cjs` compilation works in Bazel
- Potentially separate `ts_project` for CommonJS-only files
- Module resolution for local `.cjs` file imports

## Strategic Decision

**Defer client-utils** to later session for two reasons:

1. **Complexity**: Combines npm deps + .cts files (two hard problems)
2. **Pattern First**: Need to establish npm dependency pattern with simpler package first
3. **Efficiency**: Don't want to spend entire session on one complex package

## Next Steps for Session 2.2

1. ✅ Document client-utils complexity (this file)
2. ✅ Clean up uncommitted client-utils files
3. Find package with:
   - Simple npm dependencies (no .cts files)
   - Few workspace dependencies (preferably only migrated packages)
   - Straightforward structure
4. Establish npm dependency resolution pattern
5. Return to client-utils in Session 2.3 or 2.4

## Candidates for Simple npm Dependency Pattern

Need to find packages that:
- Have 1-3 npm dependencies
- Depend only on: core-interfaces, driver-definitions, container-definitions, core-utils
- No .cts files
- No complex build configurations

## Lessons Learned

1. **aspect_rules_js target naming** is non-intuitive - need to query to discover
2. **TypeScript module resolution** in Bazel sandbox is a separate problem from Bazel deps
3. **Separate complexities** should be tackled independently - don't combine two hard problems
4. **Investigation time is valuable** - document findings even when deferring work

## References

- aspect_rules_js docs: https://github.com/aspect-build/rules_js
- aspect_rules_ts docs: https://github.com/aspect-build/rules_ts
- npm_translate_lock: https://docs.aspect.build/rulesets/aspect_rules_js/docs/npm_translate_lock

---

**Time Spent**: 1 hour (investigation + documentation)
**Next Session**: Continue Session 2.2 with simpler npm dependency package
