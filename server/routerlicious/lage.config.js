/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

module.exports = {
    "pipeline": {
        "build": [
            "build:compile"
        ],
        "build:compile": [
            "^build:compile"
        ],
        "test": [
            "build"
        ],
        "lint": [
            "eslint"
        ]
    },
    "npmClient": "pnpm"
};
