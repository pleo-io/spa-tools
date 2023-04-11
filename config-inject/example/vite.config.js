import {defineConfig} from 'vite'
import {inlineDevelopmentConfig} from '@pleo-io/spa-config-inject/vite'

export default defineConfig((config) => {
    return {
        plugins: [inlineDevelopmentConfig(config)]
    }
})
