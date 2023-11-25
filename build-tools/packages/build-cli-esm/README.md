# @fluid-tools/build-cli-esm

This package is not typically used alone, but rather through the [main @fluid-tools/build-cli package](../build-cli/README.md).

<!-- toc -->
* [@fluid-tools/build-cli-esm](#fluid-toolsbuild-cli-esm)
* [Usage](#usage)
* [Commands](#commands)
* [Command Topics](#command-topics)
<!-- tocstop -->

# Usage

<!-- usage -->
```sh-session
$ npm install -g @fluid-tools/build-cli-esm
$ flub-esm COMMAND
running command...
$ flub-esm (--version)
@fluid-tools/build-cli-esm/1.0.0
$ flub-esm --help [COMMAND]
USAGE
  $ flub-esm COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
# Command Topics

* [`flub-esm autocomplete`](docs/autocomplete.md) - display autocomplete installation instructions
* [`flub-esm bump`](docs/bump.md) - Bump the version of packages, release groups, and their dependencies.
* [`flub-esm check`](docs/check.md) - Check commands are used to verify repo state, apply policy, etc.
* [`flub-esm commands`](docs/commands.md) - list all the commands
* [`flub-esm doctor`](docs/doctor.md) - Checks a project for common dependency and configuration problems when using the Fluid Framework.
* [`flub-esm exec`](docs/exec.md) - Run a shell command in the context of a package or release group.
* [`flub-esm generate`](docs/generate.md) - Generate commands are used to create/update code, docs, readmes, etc.
* [`flub-esm help`](docs/help.md) - Display help for flub-esm.
* [`flub-esm info`](docs/info.md) - Get info about the repo, release groups, and packages.
* [`flub-esm list`](docs/list.md) - List packages in a release group in topological order.
* [`flub-esm merge`](docs/merge.md) - Sync branches depending on the batch size passed
* [`flub-esm release`](docs/release.md) - Release commands are used to manage the Fluid release process.
* [`flub-esm run`](docs/run.md) - Generate a report from input bundle stats collected through the collect bundleStats command.
* [`flub-esm typetests`](docs/typetests.md) - Updates configuration for type tests in package.json files. If the previous version changes after running preparation, then npm install must be run before building.

<!-- commandsstop -->
