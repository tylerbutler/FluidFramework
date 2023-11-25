`flub-esm hello`
================

Say hello

* [`flub-esm hello PERSON`](#flub-esm-hello-person)
* [`flub-esm hello world`](#flub-esm-hello-world)

## `flub-esm hello PERSON`

Say hello

```
USAGE
  $ flub-esm hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/microsoft/FluidFramework/blob/main/build-tools/packages/build-cli-esm/src/commands/hello/index.ts)_

## `flub-esm hello world`

Say hello world

```
USAGE
  $ flub-esm hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ flub-esm hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/microsoft/FluidFramework/blob/main/build-tools/packages/build-cli-esm/src/commands/hello/world.ts)_
