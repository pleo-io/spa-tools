// @ts-check

import {config as stagingConfig} from './config.staging.mjs'

/**
 * @type {import("./config").AppConfig}
 */
export const config = {
    ...stagingConfig,
    env: 'dev',
    version: '_DEV_'
}
