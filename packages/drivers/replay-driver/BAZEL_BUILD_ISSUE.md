# replay-driver Bazel Build Issue

**Status**: Blocked - TypeScript module detection issue
**Date**: 2025-10-28
**Session**: 2.16

## Problem

Both ESM and CJS builds fail with error:
```
TS1479: The current file is a CommonJS module whose imports will produce 'require' calls;
however, the referenced file is an ECMAScript module and cannot be imported with 'require'.
```

TypeScript is detecting the source files as CommonJS modules even though:
- `package.json` has `"type": "module"`
- Both tsconfig files use `"module": "Node16"` and `"moduleResolution": "Node16"`
- 14 other packages with identical configurations build successfully

## Attempted Solutions

1. ❌ Changed CJS tsconfig to `"module": "CommonJS"` → TS error: incompatible with `"moduleResolution": "Node16"`
2. ❌ Changed CJS tsconfig to `"moduleResolution": "Bundler"` → TS error: requires ES module
3. ❌ Created genrule to copy CJS package.json to dist/ → Files still detected as CJS
4. ❌ Created genrule to copy CJS package.json to src/ → Would conflict with ESM build
5. ❌ Tested with `fluid-tsc commonjs` directly → Same errors

## Next Steps

- [ ] Investigate if replay-driver has unique source code patterns causing this
- [ ] Check if replay-driver dependencies are structured differently
- [ ] Consider if this is a TypeScript 5.4 regression specific to certain code patterns
- [ ] Test with newer/older TypeScript versions

## Workaround

Skip replay-driver for now. 93% success rate (14/15 packages) is acceptable for continuing migration.

## Reference

- Working packages: core-interfaces, driver-definitions, container-definitions, core-utils, client-utils, telemetry-utils, tool-utils, odsp-doclib-utils, odsp-driver-definitions, routerlicious-urlresolver, driver-base, driver-web-cache, driver-utils, test-loader-utils
- Failing package: replay-driver
