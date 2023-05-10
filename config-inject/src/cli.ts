#!/usr/bin/env node

/**
Given the location of the _index.html file and the environment,
this script reads the config file and the generated HTML file
and inlines the config as a string within the HTML file by replacing the
REPLACE_WITH_INLINE_CONFIG string. The interpolated file is saved as index.html
in the same location as the _index.html template.
*/

import * as fs from 'node:fs'
import * as path from 'node:path'

import merge from 'lodash.merge'
import {loadConfig} from './shared/load-config'
import {assertExists} from './shared/assert-exists'
import {getMinifiedConfig} from './shared/get-minified-config'
import {STRING_TO_REPLACE} from './shared/constants'
import assert from 'node:assert'

/**
Main function that parses the command-line options and injects the config
into the HTML template file.
@param cliEnv - The environment of the config to inject, passed via CLI argument
*/
async function run(cliEnv: string) {
    const config = await loadConfig()
    const dynamicConfigJSON = process.env.SPA_CONFIG_OVERRIDE
    const buildDir = process.env.SPA_BUILD_DIR ?? config.buildDir
    const templateFileName = process.env.SPA_TEMPLATE_FILE_NAME ?? config.templateFileName
    const outputFileName = process.env.SPA_OUTPUT_FILE_NAME ?? config.outputFileName
    const env = cliEnv ?? process.env.SPA_ENV

    assert(env, 'Provide the environment name as an option or via SPA_ENV env variable')

    await injectConfig({
        buildDir,
        templateFileName,
        outputFileName,
        configDir: config.configDir,
        env,
        dynamicConfigJSON
    })
}

/**
Injects the config into the HTML template file.
@param opts - Options object
@param opts.buildDir - The build directory containing the HTML template file
@param opts.templateFileName - The name of the template HTML file (relative to build dir)
@param opts.outputFileName - The name of the output HTML file (relative to build dir)
@param opts.configDir - The directory containing the config files
@param opts.env - The environment of the config to inject
@param opts.dynamicConfigJSON - The JSON string of the dynamic config override
*/
async function injectConfig(opts: {
    buildDir: string
    templateFileName: string
    outputFileName: string
    configDir: string
    env: string
    dynamicConfigJSON?: string
}) {
    assertExists(opts.buildDir, {dir: true})
    assertExists(opts.configDir, {dir: true})

    const templatePath = path.join(opts.buildDir, opts.templateFileName)
    assertExists(templatePath)

    const configPath = path.resolve(opts.configDir, `config.${opts.env}.mjs`)
    assertExists(configPath)

    const staticConfig = (await import(configPath)).config as unknown

    let dynamicConfig: null | object = null
    if (opts.dynamicConfigJSON) {
        try {
            dynamicConfig = JSON.parse(opts.dynamicConfigJSON)
        } catch (e) {
            throw new Error(`Dynamic config cannot be parsed as JSON`)
        }
    }

    const config = merge(staticConfig, dynamicConfig)
    const configString = getMinifiedConfig(config)

    const htmlTemplate = await fs.promises.readFile(templatePath, {encoding: 'utf8'})
    const htmlWithConfig = htmlTemplate.replace(STRING_TO_REPLACE, configString)
    if (htmlTemplate === htmlWithConfig) {
        throw new Error(`🛑 Could not inject runtime configuration: ${STRING_TO_REPLACE} not found`)
    }

    const outputPath = path.resolve(opts.buildDir, opts.outputFileName)
    await fs.promises.writeFile(outputPath, htmlWithConfig)
}

run(process.argv[2]).catch((error) => {
    console.error(`🛑 An error occurred: ${error.message}`)
    process.exit(1)
})
