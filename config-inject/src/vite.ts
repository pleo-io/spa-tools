/**
@fileoverview A Vite plugin that inlines runtime configuration during development.
*/

import type {PluginOption} from 'vite'
import fs from 'fs'
import path from 'path'
import merge from 'lodash.merge'
import {loadConfig} from './shared/load-config'
import {assertExists} from './shared/assert-exists'
import {getMinifiedConfig} from './shared/get-minified-config'
import {STRING_TO_REPLACE} from './shared/constants'

const DEFAULT_ENV = 'dev'

/**
Inline runtime configuration during development.
Inspiration: https://github.com/vitejs/vite/issues/3105
@see https://vitejs.dev/guide/api-plugin.html#transformindexhtml
@param config - The Vite config environment.
@param env - The name of the environment of the config inlined (defaults to "dev")
@returns Returns a Vite plugin definition or null if in production mode.
*/
export const inlineLocalConfig = (config: {isDisabled?: boolean; env?: string} = {}) => {
    if (config.isDisabled) {
        return null
    }

    return {
        name: 'inline-config',
        transformIndexHtml: {
            enforce: 'pre' as const,
            transform: async (html: string) => {
                const runtimeConfig = await getLocalConfig(config.env ?? DEFAULT_ENV)
                if (!html.includes(STRING_TO_REPLACE)) {
                    throw new Error(
                        `🛑 Could not inject runtime configuration: ${STRING_TO_REPLACE} not found`
                    )
                }
                return html.replace(new RegExp(STRING_TO_REPLACE, 'g'), runtimeConfig)
            }
        }
    } satisfies PluginOption
}

/**
Generates local runtime config as a string by merging the
selected config file and the overrides from dev overrides file.
@param env - The name of the environment of the config inlined
@returns Returns a promise that resolves to a string containing the merged local runtime config.
*/
async function getLocalConfig(env: string) {
    const config = await loadConfig()

    const configPath = path.resolve(config.configDir, `config.${env}.mjs`)
    assertExists(configPath)
    const devConfigPath = path.resolve(configPath)
    let devRuntimeConfig = (await import(devConfigPath)).config as unknown

    // We don't use the overrides unless we're using the the default "dev" env
    if (env !== DEFAULT_ENV) {
        return getMinifiedConfig(devRuntimeConfig)
    }

    try {
        const devConfigOverridePath = path.resolve(config.devConfigOverrideFile)
        if (fs.existsSync(devConfigOverridePath)) {
            const devConfigOverrideFile = fs.readFileSync(devConfigOverridePath, {
                encoding: 'utf-8'
            })
            const devConfigOverride = JSON.parse(devConfigOverrideFile)
            devRuntimeConfig = merge(devRuntimeConfig, devConfigOverride)
            if (Object.keys(devConfigOverride).length > 0) {
                console.log(
                    `🎉 Overriding ${env} config locally with ${config.devConfigOverrideFile}`
                )
            }
        } else {
            fs.writeFileSync(devConfigOverridePath, `{}`)
        }
    } catch (e) {
        console.error(`🛑 Configuration override failed: ${e}`)
    }

    return getMinifiedConfig(devRuntimeConfig)
}
