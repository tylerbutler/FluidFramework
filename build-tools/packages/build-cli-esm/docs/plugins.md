`flub plugins`
==============

List installed plugins.

* [`flub plugins`](#flub-plugins)
* [`flub plugins:install PLUGIN...`](#flub-pluginsinstall-plugin)
* [`flub plugins:inspect PLUGIN...`](#flub-pluginsinspect-plugin)
* [`flub plugins:install PLUGIN...`](#flub-pluginsinstall-plugin-1)
* [`flub plugins:link PLUGIN`](#flub-pluginslink-plugin)
* [`flub plugins:uninstall PLUGIN...`](#flub-pluginsuninstall-plugin)
* [`flub plugins reset`](#flub-plugins-reset)
* [`flub plugins:uninstall PLUGIN...`](#flub-pluginsuninstall-plugin-1)
* [`flub plugins:uninstall PLUGIN...`](#flub-pluginsuninstall-plugin-2)
* [`flub plugins update`](#flub-plugins-update)

## `flub plugins`

List installed plugins.

```
USAGE
  $ flub plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ flub plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.3.8/src/commands/plugins/index.ts)_

## `flub plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ flub plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -s, --silent   Silences yarn output.
  -v, --verbose  Show verbose yarn output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ flub plugins add

EXAMPLES
  $ flub plugins add myplugin 

  $ flub plugins add https://github.com/someuser/someplugin

  $ flub plugins add someuser/someplugin
```

## `flub plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ flub plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ flub plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.3.8/src/commands/plugins/inspect.ts)_

## `flub plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ flub plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -s, --silent   Silences yarn output.
  -v, --verbose  Show verbose yarn output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ flub plugins add

EXAMPLES
  $ flub plugins install myplugin 

  $ flub plugins install https://github.com/someuser/someplugin

  $ flub plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.3.8/src/commands/plugins/install.ts)_

## `flub plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ flub plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help      Show CLI help.
  -v, --verbose
  --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ flub plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.3.8/src/commands/plugins/link.ts)_

## `flub plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ flub plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ flub plugins unlink
  $ flub plugins remove

EXAMPLES
  $ flub plugins remove myplugin
```

## `flub plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ flub plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.3.8/src/commands/plugins/reset.ts)_

## `flub plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ flub plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ flub plugins unlink
  $ flub plugins remove

EXAMPLES
  $ flub plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.3.8/src/commands/plugins/uninstall.ts)_

## `flub plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ flub plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ flub plugins unlink
  $ flub plugins remove

EXAMPLES
  $ flub plugins unlink myplugin
```

## `flub plugins update`

Update installed plugins.

```
USAGE
  $ flub plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.3.8/src/commands/plugins/update.ts)_
