import {defineConfig} from 'vite'
import {inlineDevelopmentConfig} from '@pleo-io/spa-config-inject/dist/vite'

export default defineConfig((config) => {
    return {
        plugins: [inlineDevelopmentConfig(config)]
    }
})
