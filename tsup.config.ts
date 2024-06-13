import { defineConfig } from 'tsup';

export default defineConfig({
    clean: true,
    keepNames: true,
    dts: true,
    sourcemap: true,
    format: ['cjs', 'esm', 'cjs'],
    outDir: './dist',
    shims: true,
    entry: ['./src/index.ts']
})