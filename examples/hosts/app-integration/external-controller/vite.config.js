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