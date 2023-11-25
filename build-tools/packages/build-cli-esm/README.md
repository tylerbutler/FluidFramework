# @fluid-tools/build-cli-esm

This package is an eventual "replacement" for the [main @fluid-tools/build-cli package](../build-cli/README.md). This
package is ESM-only, but exposes all the commands from the build-cli package using oclif's plugin's capabilities.
Because of this, any new commands that don't rely on a lot of internals in build-cli should live in this package. Some
commands may make sense to migrate from build-cli to this package, but that is very rare. Most can stay where they are,
in the CommonJS build-cli package.

However, if you want to use a command that uses ESM-only dependencies, then they can live in this package. If shared
code needs to be exposed from build-cli, that's OK -- it serves as both a CLI and houses the shared CLI infrastructure
like base command classes and whatnot.

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
$ flubx COMMAND
running command...
$ flubx (--version)
@fluid-tools/build-cli-esm/1.0.0
$ flubx --help [COMMAND]
USAGE
  $ flubx COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
# Command Topics

* [`flubx autocomplete`](docs/autocomplete.md) - display autocomplete installation instructions
* [`flubx bump`](docs/bump.md) - Bump the version of packages, release groups, and their dependencies.
* [`flubx check`](docs/check.md) - Check commands are used to verify repo state, apply policy, etc.
* [`flubx commands`](docs/commands.md) - list all the commands
* [`flubx doctor`](docs/doctor.md) - Checks a project for common dependency and configuration problems when using the Fluid Framework.
* [`flubx exec`](docs/exec.md) - Run a shell command in the context of a package or release group.
* [`flubx generate`](docs/generate.md) - Generate commands are used to create/update code, docs, readmes, etc.
* [`flubx help`](docs/help.md) - Display help for flubx.
* [`flubx info`](docs/info.md) - Get info about the repo, release groups, and packages.
* [`flubx list`](docs/list.md) - List packages in a release group in topological order.
* [`flubx merge`](docs/merge.md) - Sync branches depending on the batch size passed
* [`flubx release`](docs/release.md) - Release commands are used to manage the Fluid release process.
* [`flubx run`](docs/run.md) - Generate a report from input bundle stats collected through the collect bundleStats command.
* [`flubx typetests`](docs/typetests.md) - Updates configuration for type tests in package.json files. If the previous version changes after running preparation, then npm install must be run before building.

<!-- commandsstop -->
