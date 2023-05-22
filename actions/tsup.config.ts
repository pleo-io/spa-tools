import {defineConfig} from 'tsup'

export default defineConfig({
    noExternal: [/(.*)/],
    splitting: false,
    sourcemap: false,
    dts: false,
    target: 'node16',
    format: 'cjs',
    clean: true
})
