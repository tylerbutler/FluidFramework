# Nx Overlay Scripts

This directory contains scripts to apply the nx build system configuration to the FluidFramework repository. These scripts are designed to be run multiple times as the repository evolves until the full migration to nx is complete.

## Overview

The overlay system modifies the repository to use nx for build orchestration while maintaining compatibility with the existing build system. Changes include:

- Adding `nx.json` configuration
- Updating root `package.json` with nx dependencies
- Removing `fluidBuild` configurations from package.json files
- Removing `fluid-build` script references
- Updating `.gitignore` with nx-related entries

## Prerequisites

1. Install dependencies from the repo root:
   ```bash
   pnpm install
   ```

2. Install overlay script dependencies:
   ```bash
   cd scripts/repo-overlays
   pnpm install
   ```

## Usage

### Dry Run (Recommended First Step)

Check what changes would be made without actually modifying files:

```bash
pnpm tsx scripts/repo-overlays/src/index.ts --dry-run
```

Or from within the overlay directory:

```bash
cd scripts/repo-overlays
pnpm run apply:dry-run
```

### Apply Changes

Apply the nx overlay to the repository:

```bash
pnpm tsx scripts/repo-overlays/src/index.ts
```

Or from within the overlay directory:

```bash
cd scripts/repo-overlays
pnpm run apply
```

### Post-Apply Steps

After applying the overlay:

1. Install updated dependencies:
   ```bash
   pnpm install
   ```

2. Test the nx build:
   ```bash
   nx run-many -t build
   ```

3. Commit the changes:
   ```bash
   git add -A
   git commit -m "chore: apply nx overlay"
   ```

## What Gets Changed

### Configuration Files

- **nx.json**: Complete nx configuration with task definitions, caching, and dependency management
- **.gitignore**: Added nx cache directories and related files

### Root package.json

- Adds `nx` and `@nx/workspace` to `devDependencies`
- Adds `nx` to `pnpm.onlyBuiltDependencies` list

### Individual package.json Files

For all packages in `azure/`, `examples/`, `experimental/`, and `packages/`:

- Removes `fluidBuild` configuration section
- Removes scripts that invoke `fluid-build`:
  - `build`
  - `build:commonjs`
  - `build:compile`
  - `lint`
  - `lint:fix`

## Maintaining the Overlay

As the repository evolves, you can update the scripts in this directory:

### Adding New Configuration

1. Update template files in `templates/` directory
2. Modify corresponding modules in `src/`:
   - `config-files.ts` - Configuration file management
   - `package-json.ts` - Package.json updates
   - `gitignore.ts` - Gitignore updates

### Testing Changes

Always test with `--dry-run` first to see what would change:

```bash
pnpm run apply:dry-run
```

## Architecture

```
scripts/repo-overlays/
├── src/
│   ├── index.ts         # Main entry point with CLI
│   ├── config-files.ts  # Nx config file management
│   ├── package-json.ts  # Package.json updates
│   └── gitignore.ts     # Gitignore updates
├── templates/
│   └── nx.json          # Complete nx.json template
├── package.json         # Script dependencies
├── tsconfig.json        # TypeScript configuration
└── README.md            # This file
```

## Troubleshooting

### Script doesn't recognize changes

The script tracks which changes have been applied. If you manually modify files, the script may not detect that changes are needed. Use `--dry-run` to see the current state.

### pnpm install fails after applying

Make sure you're running `pnpm install` from the repository root, not from the overlay scripts directory.

### Nx commands don't work

After applying the overlay and running `pnpm install`, nx should be available. Try:

```bash
# Check nx is installed
npx nx --version

# Run a simple task
nx run-many -t build --parallel=1
```
