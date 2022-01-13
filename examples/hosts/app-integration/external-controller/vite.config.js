/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import nodePolyfills from 'rollup-plugin-polyfill-node';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        {
            ...nodePolyfills(),
            enforce: 'pre',
            apply: 'build'
        }
    ]
})