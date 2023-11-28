`flub release`
==============

Release commands are used to manage the Fluid release process.

* [`flub release`](#flub-release)
* [`flub release report-unreleased`](#flub-release-report-unreleased)
* [`flub release setPackageTypesField`](#flub-release-setpackagetypesfield)

## `flub release`

Releases a package or release group.

```
USAGE
  $ flub release [-v | --quiet] [-g client|server|azure|build-tools|gitrest|historian | -p <value>] [-t
    major|minor|patch] [-x | --install | --commit | --branchCheck | --updateCheck | --policyCheck]

FLAGS
  -g, --releaseGroup=<option>  Name of a release group.
                               <options: client|server|azure|build-tools|gitrest|historian>
  -p, --package=<value>        Name of package. You can use scoped or unscoped package names. For example, both
                               @fluid-tools/markdown-magic and markdown-magic are valid.
  -t, --bumpType=<option>      Version bump type.
                               <options: major|minor|patch>
  -x, --skipChecks             Skip all checks.
  --[no-]branchCheck           Check that the current branch is correct.
  --[no-]commit                Commit changes to a new branch.
  --[no-]install               Update lockfiles by running 'npm install' automatically.
  --[no-]policyCheck           Check that the local repo complies with all policy.
  --[no-]updateCheck           Check that the local repo is up to date with the remote.

LOGGING FLAGS
  -v, --verbose  Enable verbose logging.
  --quiet        Disable all logging.

DESCRIPTION
  Releases a package or release group.

  The release command ensures that a release branch is in good condition, then walks the user through releasing a
  package or release group.

  The command runs a number of checks automatically to make sure the branch is in a good state for a release. If any of
  the dependencies are also in the repo, then they're checked for the latest release version. If the dependencies have
  not yet been released, then the command prompts to perform the release of the dependency, then run the release command
  again.

  This process is continued until all the dependencies have been released, after which the release group itself is
  released.
```

_See code: [src/commands/release.ts](https://github.com/microsoft/FluidFramework/blob/main/build-tools/packages/build-cli/src/commands/release.ts)_

## `flub release report-unreleased`

Creates a release report for the most recent build of the client release group published to an internal ADO feed. It does this by finding the most recent build in ADO produced from a provided branch, and creates a report using that version. The report is a combination of the "simple" and "caret" report formats. Packages released as part of the client release group will have an exact version range, while other packages, such as server packages or independent packages, will have a caret-equivalent version range.

```
USAGE
  $ flub release report-unreleased --repo <value> --ado_pat <value> --sourceBranch <value> --output <value> [-v |
  --quiet]

FLAGS
  --ado_pat=<value>       (required) ADO Personal Access Token. This flag should be provided via the ADO_PAT environment
                          variable for security reasons.
  --output=<value>        (required) Output manifest file path
  --repo=<value>          (required) Repository name
  --sourceBranch=<value>  (required) Branch name across which the dev release manifest should be generated.

LOGGING FLAGS
  -v, --verbose  Enable verbose logging.
  --quiet        Disable all logging.

DESCRIPTION
  Creates a release report for the most recent build of the client release group published to an internal ADO feed. It
  does this by finding the most recent build in ADO produced from a provided branch, and creates a report using that
  version. The report is a combination of the "simple" and "caret" report formats. Packages released as part of the
  client release group will have an exact version range, while other packages, such as server packages or independent
  packages, will have a caret-equivalent version range.
```

_See code: [src/commands/release/report-unreleased.ts](https://github.com/microsoft/FluidFramework/blob/main/build-tools/packages/build-cli/src/commands/release/report-unreleased.ts)_

## `flub release setPackageTypesField`

Updates which .d.ts file is referenced by the `types` field in package.json. This command is used during package publishing (by CI) to select the d.ts file which corresponds to the selected API-Extractor release tag.

```
USAGE
  $ flub release setPackageTypesField --types <value> [--json] [-v | --quiet] [--checkFileExists] [--concurrency <value>] [--all |
    --dir <value> | --packages | -g client|server|azure|build-tools|gitrest|historian|all | --releaseGroupRoot
    client|server|azure|build-tools|gitrest|historian|all] [--private] [--scope <value> | --skipScope <value>]

FLAGS
  --[no-]checkFileExists  Check if the file path exists
  --concurrency=<value>   [default: 25] The number of tasks to execute concurrently.
  --types=<value>         (required) Which .d.ts types to include in the published package.

PACKAGE SELECTION FLAGS
  -g, --releaseGroup=<option>...  Run on all child packages within the specified release groups. This does not include
                                  release group root packages. To include those, use the --releaseGroupRoot argument.
                                  Cannot be used with --all, --dir, or --packages.
                                  <options: client|server|azure|build-tools|gitrest|historian|all>
  --all                           Run on all packages and release groups. Cannot be used with --all, --dir,
                                  --releaseGroup, or --releaseGroupRoot.
  --dir=<value>                   Run on the package in this directory. Cannot be used with --all, --dir,
                                  --releaseGroup, or --releaseGroupRoot.
  --packages                      Run on all independent packages in the repo. Cannot be used with --all, --dir,
                                  --releaseGroup, or --releaseGroupRoot.
  --releaseGroupRoot=<option>...  Run on the root package of the specified release groups. This does not include any
                                  child packages within the release group. To include those, use the --releaseGroup
                                  argument. Cannot be used with --all, --dir, or --packages.
                                  <options: client|server|azure|build-tools|gitrest|historian|all>

LOGGING FLAGS
  -v, --verbose  Enable verbose logging.
  --quiet        Disable all logging.

GLOBAL FLAGS
  --json  Format output as json.

PACKAGE FILTER FLAGS
  --[no-]private          Only include private packages. Use --no-private to exclude private packages instead.
  --scope=<value>...      Package scopes to filter to. If provided, only packages whose scope matches the flag will be
                          included. Cannot be used with --skipScope.
  --skipScope=<value>...  Package scopes to filter out. If provided, packages whose scope matches the flag will be
                          excluded. Cannot be used with --scope.

DESCRIPTION
  Updates which .d.ts file is referenced by the `types` field in package.json. This command is used during package
  publishing (by CI) to select the d.ts file which corresponds to the selected API-Extractor release tag.
```

_See code: [src/commands/release/setPackageTypesField.ts](https://github.com/microsoft/FluidFramework/blob/main/build-tools/packages/build-cli/src/commands/release/setPackageTypesField.ts)_
