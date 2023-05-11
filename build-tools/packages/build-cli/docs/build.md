`flub build`
============



* [`flub build`](#flub-build)

## `flub build`

```
USAGE
  $ flub build [-v] [-c] [-d] [--depCheck] [-f] [--force] [--hoist] [--install] [--lint] [-r] [--reinstall]
    [-g client|server|azure|build-tools|gitrest|historian] [--samples] [-s <value>] [--services] [--showExec] [--symlink
    isolated|full] [--uninstall] [--vscode] [--workerThreads --worker] [--workerMemoryLimitMB <value> ] [--logtime]

FLAGS
  -c, --clean
      Runs the 'clean' script on matched packages.

  -d, --dep
      Apply actions (clean/force/rebuild) to matched packages and their dependent packages.

  -f, --fix
      Auto fix warning from package check if possible.

  -g, --releaseGroup=<option>
      Operate only on this release group.
      <options: client|server|azure|build-tools|gitrest|historian>

  -r, --rebuild
      Clean and build all matched packages.

  -s, --script=<value>...
      [default: build] npm script to execute.

  -v, --verbose
      Verbose logging.

  --depCheck
      DepCheck.

  --force
      Force build and ignore dependency check on matched packages.

  --hoist
      Hoist.

  --install
      Run 'npm install' for all packages and release groups. This skips a package if node_modules already exists; it can
      not be used to update in response to changes to the package.json.

  --lint
      Lint.

  --logtime
      Display the current time on every status message for logging.

  --reinstall
      Same as --uninstall --install.

  --[no-]samples
      Samples.

  --services
      Services.

  --showExec
      showExec

  --symlink=<option>
      [default: isolated] Fix symlinks between packages within release groups. The 'isolate' mode configures the symlinks
      to only connect within each release group. This is the configuration tested by CI and should be kept working.

      The 'full' mode symlinks everything in the repo together. CI does not ensure this configuration is functional, so it
      may or may not work.
      <options: isolated|full>

  --uninstall
      Clean all node_modules. This errors if some node_modules folders do not exist; if you hit this limitation you can do
      an --install first to work around it.

  --vscode
      Output error messages to work with the default problem matcher in vscode.

  --worker
      Enable workers.

  --workerMemoryLimitMB=<value>
      Set worker memory limit.

  --workerThreads
      Enable worker threads.

EXAMPLES


    $ flub build
```

_See code: [src/commands/build.ts](https://github.com/microsoft/FluidFramework/blob/main/build-tools/packages/build-cli/src/commands/build.ts)_
