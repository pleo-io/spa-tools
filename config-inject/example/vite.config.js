import {defineConfig} from 'vite'
import {inlineLocalConfig} from '@pleo-io/spa-config-inject/vite'

export default defineConfig((config) => {
    return {
        plugins: [inlineLocalConfig(config)]
    }
})
