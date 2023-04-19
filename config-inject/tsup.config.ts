import {defineConfig} from 'tsup'

export default defineConfig({
    entry: ['src/cli.ts', 'src/runtime.ts', 'src/vite.ts'],
    splitting: false,
    sourcemap: false,
    dts: true,
    target: 'node16',
    format: ['esm', 'cjs'],
    clean: true
})
