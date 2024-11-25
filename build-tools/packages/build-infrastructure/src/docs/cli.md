---
title: repo-layout -- the build-infrastructure CLI
---

# repo-layout -- the build-infrastructure CLI

# Table of contents

<!-- toc -->
* [repo-layout -- the build-infrastructure CLI](#repo-layout----the-build-infrastructure-cli)
* [Table of contents](#table-of-contents)
* [Commands](#commands)
<!-- tocstop -->

# Commands

<!-- commands -->
<<<<<<< HEAD
* [`repo-layout list`](#repo-layout-list)

## `repo-layout list`

List objects in the Fluid repo, like release groups, workspaces, and packages.

```
USAGE
  $ repo-layout list [--path <value>] [--full]

FLAGS
  --full          Output the full report.
  --path=<value>  [default: .] Path to start searching for the Fluid repo.

DESCRIPTION
  List objects in the Fluid repo, like release groups, workspaces, and packages.
=======
* [`buildProject list`](#buildproject-list)

## `buildProject list`

List objects in the build project, like release groups, workspaces, and packages. USED FOR TESTING ONLY.

```
USAGE
  $ buildProject list [--path <value>] [--full]

FLAGS
  --full          Output the full report.
  --path=<value>  [default: .] Path to start searching for the Build project configuration.

DESCRIPTION
  List objects in the build project, like release groups, workspaces, and packages. USED FOR TESTING ONLY.
>>>>>>> main
```

_See code: [src/commands/list.ts](https://github.com/microsoft/FluidFramework/blob/main/build-tools/packages/build-infrastructure/src/commands/list.ts)_
<!-- commandsstop -->
