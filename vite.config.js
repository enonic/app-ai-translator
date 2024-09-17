import {defineConfig} from 'vite';
import EnvironmentPlugin from 'vite-plugin-environment';

const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
    plugins: [EnvironmentPlugin(['NODE_ENV'])],
    build: {
        lib: {
            entry: 'src/main/resources/assets/index.ts',
            name: 'Enonic.AI.translator',
            formats: ['iife'],
        },
        rollupOptions: {
            input: 'src/main/resources/assets/index.ts',
            output: {
                entryFileNames: '[name].js',
                extend: true,
            },
        },
        outDir: 'build/resources/main/assets',
        sourcemap: isDev ? 'inline' : false,
        minify: !isDev,
    },
});
