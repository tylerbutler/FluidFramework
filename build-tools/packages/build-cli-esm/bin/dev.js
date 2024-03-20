/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

#
!/usr/bin / env - S;
node--;
loader;
ts - node / esm--;
no-warnings = ExperimentalWarning;

import { execute } from "@oclif/core";

await execute({ development: true, dir: import.meta.url });
