# Plan: Converting Commands to VNext Style

This document provides guidance on converting commands from the legacy `PackageCommand` pattern to the newer
vnext style that uses the APIs in the `@fluid-tools/build-infrastructure` package.

## Background

The build-tools project has two styles of building commands that operate on packages:

1. **Legacy Style (PackageCommand)**: Uses the `Context` class from `@fluidframework/build-tools` and the
   `PackageCommand` base class defined in `BasePackageCommand.ts`. This style relies on the older package
   infrastructure.

2. **VNext Style (BuildProjectPackageCommand)**: Uses the `IBuildProject` and related types from
   `@fluid-tools/build-infrastructure`. This newer pattern provides better typing, more flexible filtering,
   and a cleaner separation of concerns. For commands that operate on packages, use `BuildProjectPackageCommand`
   which mirrors the `PackageCommand` pattern and allows subclasses to only implement per-package handling.

## Key Differences

### Base Classes

| Aspect | Legacy (PackageCommand) | VNext (BuildProjectPackageCommand) |
|--------|------------------------|-------------------------------------|
| Base Class | `PackageCommand<T>` | `BuildProjectPackageCommand<T>` |
| Package Type | `Package` from `@fluidframework/build-tools` | `IPackage` from `@fluid-tools/build-infrastructure` |
| Context | `Context` from `library/context.js` | `IBuildProject` from `build-infrastructure` |
| Get Context | `this.getContext()` | `this.getBuildProject()` |

### Package Selection and Filtering

| Aspect | Legacy | VNext |
|--------|--------|-------|
| Selection | `selectionFlags` defined in `flags.ts` | `releaseGroupNameFlag` from `flags.ts` + custom `--all` flag |
| Filter | `filterFlags` defined in `flags.ts` | Uses `filterFlags` from `flags.ts` |
| Default Selection | `defaultSelection` abstract property | `defaultSelection` abstract property |

**Note:** The vnext pattern reuses the existing `filterFlags` and `releaseGroupNameFlag` from `flags.ts` where possible.
Only custom flags specific to the vnext pattern (like `--all`) are defined in `BuildProjectPackageCommand`.

### Processing Packages

| Aspect | Legacy | VNext |
|--------|--------|-------|
| Iteration | `processPackage(pkg, kind)` called per package | `processPackage(pkg)` called per package |
| Concurrency | Built-in with `async.mapLimit` | Built-in with `async.mapLimit` |
| Error Handling | Built-in error collection | Built-in error collection |

**Note on PackageKind:** The legacy `PackageKind` parameter has been removed in the vnext pattern. If you need to 
determine the kind of package, use the `IPackage` properties instead:
- `pkg.isReleaseGroupRoot` - true if this is a release group root package
- `pkg.isWorkspaceRoot` - true if this is a workspace root package
- Check `pkg.releaseGroup` to determine if the package belongs to a release group

Most commands do not rely on the `kind` parameter, so this change should not affect them.

## Commands to Convert

The following commands currently extend `PackageCommand` and could be converted to the vnext style:

### Easy to Convert (Low Complexity)

1. **`exec.ts`** - Runs shell commands per package
   - **Complexity**: Low
   - **Reason**: Simple implementation, good starting point for demonstrating the pattern

2. **`generate/packlist.ts`** - Generates pack list for packages
   - **Complexity**: Low
   - **Reason**: Straightforward file generation

3. **`check/buildVersion.ts`** - Checks package versions match
   - **Complexity**: Low-Medium
   - **Reason**: Simple validation logic with optional fix mode

### Medium Complexity

4. **`typetests.ts`** - Prepares type test configuration
   - **Complexity**: Medium
   - **Reason**: Configuration manipulation and dependency updates

5. **`generate/compatLayerGeneration.ts`** - Updates compatibility layer generation
   - **Complexity**: Medium
   - **Reason**: Complex versioning logic and file generation

6. **`release/setPackageTypesField.ts`** - Updates types field in package.json
   - **Complexity**: Medium
   - **Reason**: API-extractor integration and package.json updates

### Higher Complexity

7. **`generate/typetests.ts`** - Generates type tests for packages
   - **Complexity**: High
   - **Reason**: Complex TS-morph usage, file generation, type analysis

8. **`generate/assertTags.ts`** - Tags assert calls with shortcodes
   - **Complexity**: High
   - **Reason**: Complex TS-morph analysis, multi-pass processing, custom filtering

9. **`test-only-filter.ts`** - Testing command for filter logic
   - **Complexity**: Special
   - **Reason**: Internal testing command, may not need conversion

## Conversion Recipe

### Step 1: Update Imports

Change:
```typescript
import { PackageCommand } from "../../BasePackageCommand.js";
import type { PackageSelectionDefault } from "../../flags.js";
```

To:
```typescript
import type { IPackage } from "@fluid-tools/build-infrastructure";
import type { PackageSelectionDefault } from "../../flags.js";
import { BuildProjectPackageCommand } from "../../library/index.js";
```

### Step 2: Change Base Class

Change:
```typescript
export default class MyCommand extends PackageCommand<typeof MyCommand> {
  protected defaultSelection = "all" as PackageSelectionDefault;
  // ...
}
```

To:
```typescript
export default class MyCommand extends BuildProjectPackageCommand<typeof MyCommand> {
  protected defaultSelection: PackageSelectionDefault = "all";
  // ...
}
```

### Step 3: Define Flags (Optional)

The `BuildProjectPackageCommand` already includes all necessary flags. If you need additional flags:
```typescript
static readonly flags = {
  myCustomFlag: Flags.boolean({ description: "My custom flag" }),
  ...BuildProjectPackageCommand.flags,
} as const;
```

### Step 4: Implement processPackage

Change:
```typescript
protected async processPackage(pkg: Package, kind: PackageKind): Promise<void> {
  // per-package logic
}
```

To:
```typescript
protected async processPackage(pkg: IPackage): Promise<void> {
  // per-package logic using IPackage interface
}
```

### Step 5: Update Package-Specific Code

Replace usage of `Package` properties with `IPackage` properties:

| Legacy (Package) | VNext (IPackage) |
|------------------|------------------|
| `pkg.directory` | `pkg.directory` |
| `pkg.name` | `pkg.name` |
| `pkg.version` | `pkg.version` |
| `pkg.packageJson` | `pkg.packageJson` |
| `pkg.private` | `pkg.private` |
| `pkg.savePackageJson()` | `pkg.savePackageJson()` |

## Example Conversion: exec Command

### Before (Legacy)
```typescript
export default class ExecCommand extends PackageCommand<typeof ExecCommand> {
  static readonly args = {
    cmd: Args.string({ required: true }),
  };

  protected defaultSelection = "all" as PackageSelectionDefault;

  protected async processPackage(pkg: Package): Promise<void> {
    await execa.command(this.args.cmd, {
      cwd: pkg.directory,
      stdio: "inherit",
      shell: true,
    });
  }
}
```

### After (VNext)
```typescript
export default class ExecCommand extends BuildProjectPackageCommand<typeof ExecCommand> {
  static readonly args = {
    cmd: Args.string({ required: true }),
  };

  static readonly flags = {
    ...BuildProjectPackageCommand.flags,
  } as const;

  protected defaultSelection: PackageSelectionDefault = "all";

  protected async processPackage(pkg: IPackage): Promise<void> {
    await execa.command(this.args.cmd, {
      cwd: pkg.directory,
      stdio: "inherit",
      shell: true,
    });
  }
}
```

## Command Migration Process

When a vnext command is ready to replace a legacy command, follow this process:

1. **Move the legacy command to `commands/legacy/`** and mark it as deprecated with appropriate JSDoc.

2. **Move the vnext command** from `commands/vnext/` to the original command location (e.g., `commands/exec.ts`).

3. **Add aliases for the vnext command location** so that users who were using `vnext:exec` can still use it:
   ```typescript
   static readonly aliases = ["vnext:exec"];
   ```

4. **Set deprecateAliases** to true so the vnext aliases are deprecated:
   ```typescript
   static readonly deprecateAliases = true;
   ```

5. **Once all legacy commands are converted**, delete the legacy commands and remove the vnext aliases.

## Other Commands (Non-PackageCommand Based)

Some commands don't extend `PackageCommand` but still interact with packages or release groups. These commands 
may need different migration approaches:

- **`release`** - Release management commands
- **`release:prep`** - Release preparation  
- **`bump`** - Version bumping commands
- **`check/policy`** - Policy checking

These commands often use the `Context` class directly and may need to be migrated to use `IBuildProject` instead.
The migration approach for these will be documented separately as they are worked on.

## Notes and Considerations

1. **Location**: VNext commands should be placed in the `commands/vnext/` directory during development.

2. **Backward Compatibility**: The legacy commands can remain in place while vnext versions are developed.
   Eventually, the vnext versions can replace the legacy ones using the migration process above.

3. **Testing**: When converting a command, ensure that existing tests still pass or are updated accordingly.

4. **PackageKind Removed**: The vnext pattern removes the `PackageKind` parameter from `processPackage`. If you
   need to know the kind of package, you can check `pkg.isReleaseGroupRoot`, `pkg.isWorkspaceRoot`, etc.

5. **Built-in Features**: `BuildProjectPackageCommand` includes built-in:
   - Package selection via `--all` and `--releaseGroup` flags
   - Package filtering via `--private`, `--scope`, and `--skipScope` flags (uses existing `filterFlags`)
   - Concurrent processing with `--concurrency` flag
   - Progress reporting with spinner
   - Error collection and reporting

6. **Reuse Existing Flags**: Use flags from `flags.ts` where possible. Only define new flags when the existing
   ones don't meet the requirements.

## Recommendations

1. Start with **`exec.ts`** as it's the simplest command and demonstrates the core pattern.

2. Next, convert **`check/buildVersion.ts`** and **`generate/packlist.ts`** as they are also relatively simple.

3. Leave the more complex commands (`generate/typetests.ts`, `generate/assertTags.ts`) for later as they have
   significant additional logic that may require more careful conversion.

4. Consider whether `test-only-filter.ts` needs conversion at all, since it's specifically designed to test
   the legacy filtering infrastructure.
