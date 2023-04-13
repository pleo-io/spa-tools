import {CONFIG_GLOBAL_VAR} from './shared/constants'

/**
Extracts the injected configuration from the global variable.
@returns The configuration object to use in the app
*/
export function getConfig<AppConfig>(): AppConfig {
    const config = window[CONFIG_GLOBAL_VAR as any] as AppConfig
    delete window[CONFIG_GLOBAL_VAR as any]

    if (!config) {
        throw new Error('Configuration not found!')
    }

    return config
}
