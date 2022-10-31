# Policy handlers and `check policy`

The `check policy` command is used to apply policies to the repo, ensuring that we have license files in the right
place, our README files follow a common format, etc. The tools works by enumerating all files in the repo and passing
each file to a set of "policy handlers," which detect individual violations.

Handlers can also define a "resolver," which can be run to automatically fix policy violations.

## Location

Policy handlers are all defined here in the repo: `build-tools/packages/build-tools/src/repoPolicyCheck/handlers`

## Adding new policy handlers to `check policy`

To add a new policy handler, you first define the handler and ensure it's exported.

The policy `Handler` interface looks like this:

```ts
export interface Handler {
    name: string;
    match: RegExp;
    handler: (file: string, root: string) => string | undefined;
    resolver?: (file: string, root: string) => { resolved: boolean; message?: string };
    final?: (root: string, resolve: boolean) => { error?: string } | undefined;
}
```

Each `Handler` must define a RegExp (the `match` property) that filters the file list. The `handler` function itself
receives the path to the file, and the path to the root of the repo. If the file passes the policy check, the function
should return `undefined`. If a string is returned it is assumed to be an error message.

## Implementing resolvers
