# Plan: Converting Commands to VNext Style

This document provides guidance on converting commands from the legacy `PackageCommand` pattern to the newer
`BaseCommandWithBuildProject` pattern (vnext style) that uses the APIs in the `@fluid-tools/build-infrastructure`
package.

## Background

The build-tools project has two styles of building commands that operate on packages:

1. **Legacy Style (PackageCommand)**: Uses the `Context` class from `@fluidframework/build-tools` and the
   `PackageCommand` base class defined in `BasePackageCommand.ts`. This style relies on the older package
   infrastructure.

2. **VNext Style (BaseCommandWithBuildProject)**: Uses the `IBuildProject` and related types from
   `@fluid-tools/build-infrastructure`. This newer pattern provides better typing, more flexible filtering,
   and a cleaner separation of concerns.

## Key Differences

### Base Classes

| Aspect | Legacy (PackageCommand) | VNext (BaseCommandWithBuildProject) |
|--------|------------------------|-------------------------------------|
| Base Class | `PackageCommand<T>` | `BaseCommandWithBuildProject<T>` |
| Package Type | `Package` from `@fluidframework/build-tools` | `IPackage` from `@fluid-tools/build-infrastructure` |
| Context | `Context` from `library/context.js` | `IBuildProject` from `build-infrastructure` |
| Get Context | `this.getContext()` | `this.getBuildProject()` |

### Package Selection and Filtering

| Aspect | Legacy | VNext |
|--------|--------|-------|
| Selection | `selectionFlags` defined in `flags.ts` | Can use `build-infrastructure` filter types |
| Filter | `filterFlags` defined in `flags.ts` | `PackageFilterOptions` from `build-infrastructure` |
| Default Selection | `defaultSelection` abstract property | Can define custom defaults |

### Processing Packages

| Aspect | Legacy | VNext |
|--------|--------|-------|
| Iteration | `processPackage(pkg, kind)` called per package | Manual iteration over packages |
| Concurrency | Built-in with `async.mapLimit` | Manual implementation |
| Error Handling | Built-in error collection | Manual implementation |

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
import { BaseCommandWithBuildProject } from "../../library/index.js";
import type { IPackage } from "@fluid-tools/build-infrastructure";
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
export default class MyCommand extends BaseCommandWithBuildProject<typeof MyCommand> {
  // ...
}
```

### Step 3: Define Flags

If you need package selection/filtering:
```typescript
static readonly flags = {
  releaseGroup: releaseGroupNameFlag({ required: false }),
  // Add other selection flags as needed
  ...BaseCommandWithBuildProject.flags,
} as const;
```

### Step 4: Replace processPackage with run Logic

Change:
```typescript
protected async processPackage(pkg: Package): Promise<void> {
  // per-package logic
}
```

To:
```typescript
public async run(): Promise<void> {
  const buildProject = this.getBuildProject();

  // Get packages based on flags/criteria
  const releaseGroup = buildProject.releaseGroups.get(this.flags.releaseGroup);
  const packages = releaseGroup?.packages ?? [...buildProject.packages.values()];

  // Process packages
  for (const pkg of packages) {
    // per-package logic using IPackage interface
  }
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

### Step 6: Handle Concurrency (Optional)

If parallel processing is needed:
```typescript
import async from "async";

const errors: string[] = [];
await async.mapLimit(packages, concurrency, async (pkg) => {
  try {
    // process package
  } catch (error) {
    errors.push(`Error processing ${pkg.name}: ${error}`);
  }
});
```

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
export default class ExecCommand extends BaseCommandWithBuildProject<typeof ExecCommand> {
  static readonly args = {
    cmd: Args.string({ required: true }),
  };

  static readonly flags = {
    releaseGroup: releaseGroupNameFlag({ required: false }),
    all: Flags.boolean({ description: "Run on all packages" }),
    ...BaseCommandWithBuildProject.flags,
  };

  public async run(): Promise<void> {
    const { cmd } = this.args;
    const buildProject = this.getBuildProject();

    let packages: IPackage[];
    if (this.flags.all) {
      packages = [...buildProject.packages.values()];
    } else if (this.flags.releaseGroup) {
      const rg = buildProject.releaseGroups.get(this.flags.releaseGroup);
      if (!rg) {
        this.error(`Release group not found: ${this.flags.releaseGroup}`);
      }
      packages = rg.packages;
    } else {
      this.error("Specify --all or --releaseGroup");
    }

    for (const pkg of packages) {
      this.info(`Running in ${pkg.name}...`);
      await execa.command(cmd, {
        cwd: pkg.directory,
        stdio: "inherit",
        shell: true,
      });
    }
  }
}
```

## Notes and Considerations

1. **Location**: VNext commands should be placed in the `commands/vnext/` directory to distinguish them from
   legacy commands.

2. **Backward Compatibility**: The legacy commands can remain in place while vnext versions are developed.
   Eventually, the vnext versions can replace the legacy ones.

3. **Testing**: When converting a command, ensure that existing tests still pass or are updated accordingly.

4. **Flags**: Consider using the `releaseGroupNameFlag` from `flags.ts` for consistent release group selection.

5. **Error Handling**: VNext commands should handle errors explicitly rather than relying on the built-in
   error collection from `PackageCommand`.

6. **Progress Reporting**: Consider using `ux.action.start/stop` from `@oclif/core` for progress indication.

## Recommendations

1. Start with **`exec.ts`** as it's the simplest command and demonstrates the core pattern.

2. Next, convert **`check/buildVersion.ts`** and **`generate/packlist.ts`** as they are also relatively simple.

3. Leave the more complex commands (`generate/typetests.ts`, `generate/assertTags.ts`) for later as they have
   significant additional logic that may require more careful conversion.

4. Consider whether `test-only-filter.ts` needs conversion at all, since it's specifically designed to test
   the legacy filtering infrastructure.
