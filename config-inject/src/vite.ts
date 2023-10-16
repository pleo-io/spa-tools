/**
@fileoverview A Vite plugin that inlines runtime configuration during local development.
*/

import type {PluginOption} from 'vite'
import fs from 'fs'
import path from 'path'
import merge from 'lodash.merge'
import {loadConfig} from './shared/load-config'
import {assertExists} from './shared/assert-exists'
import {getMinifiedConfig} from './shared/get-minified-config'
import {STRING_TO_REPLACE} from './shared/constants'

const DEFAULT_ENV = 'local'

/**
Inline runtime configuration during local development.
Inspiration: https://github.com/vitejs/vite/issues/3105
@see https://vitejs.dev/guide/api-plugin.html#transformindexhtml
@param config
@param env - The name of the environment of the config inlined (defaults to "local")
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
selected config file and the overrides from local overrides file.
@param env - The name of the environment of the config inlined
@returns Returns a promise that resolves to a string containing the merged local runtime config.
*/
async function getLocalConfig(env: string) {
    const config = await loadConfig()

    const configPath = path.resolve(config.configDir, `config.${env}.mjs`)
    assertExists(configPath)
    const localConfigPath = path.resolve(configPath)
    let localRuntimeConfig = (await import(localConfigPath)).config as unknown

    // We don't use the overrides unless we're using the the default "local" env
    if (env !== DEFAULT_ENV) {
        return getMinifiedConfig(localRuntimeConfig)
    }

    try {
        const localConfigOverridePath = path.resolve(config.localConfigOverrideFile)
        if (fs.existsSync(localConfigOverridePath)) {
            const localConfigOverrideFile = fs.readFileSync(localConfigOverridePath, {
                encoding: 'utf-8'
            })
            const localConfigOverride = JSON.parse(localConfigOverrideFile)
            localRuntimeConfig = merge(localRuntimeConfig, localConfigOverride)
            if (Object.keys(localConfigOverride).length > 0) {
                console.log(`🎉 Overriding ${env} config with ${config.localConfigOverrideFile}`)
            }
        } else {
            fs.writeFileSync(localConfigOverridePath, `{}`)
        }
    } catch (e) {
        console.error(`🛑 Configuration override failed: ${e}`)
    }

    return getMinifiedConfig(localRuntimeConfig)
}
