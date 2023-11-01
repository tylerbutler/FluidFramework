/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import fs from "fs";

/**
 * each handler has a name for filtering and a match regex for matching which files it should resolve
 * the handler function returns an error message or undefined/null for success
 * the resolver function (optional) can attempt to resolve the failed validation
 */
export interface Handler {
    /**
     * The name of the handler.
     */
    name: string;
    /**
     * A RegExp that will be applied to the file path. Only files matching the RegExp will be passed to the handler
     * functions.
     */
    match: RegExp;
    /**
     * A function that receives the path to the file and the path to the root of the repo. If the file passes the policy
     * check, the function should return `undefined`. If a string is returned it is assumed to be an error message.
     */
    handler: (file: string, root: string) => string | undefined;
    resolver?: (file: string, root: string) => { resolved: boolean; message?: string };
    final?: (root: string, resolve: boolean) => { error?: string } | undefined;
}

export function readFile(file: string) {
	return fs.readFileSync(file, { encoding: "utf8" });
}

export function writeFile(file: string, data: string) {
	fs.writeFileSync(file, data, { encoding: "utf8" });
}
