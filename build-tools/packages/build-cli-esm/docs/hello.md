`flub hello`
============

Say hello to the world and others

* [`flub hello PERSON`](#flub-hello-person)
* [`flub hello world`](#flub-hello-world)

## `flub hello PERSON`

Say hello

```
USAGE
  $ flub hello PERSON -f <value>

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

_See code: [src/commands/hello/index.ts](https://github.com/microsoft/FluidFramework/blob/v0.4.24/src/commands/hello/index.ts)_

## `flub hello world`

Say hello world

```
USAGE
  $ flub hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ flub hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/microsoft/FluidFramework/blob/v0.4.24/src/commands/hello/world.ts)_
