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
import {Command} from '@commander-js/extra-typings'
import {loadConfig} from './shared/load-config'
import {assertExists} from './shared/assert-exists'
import {getMinifiedConfig} from './shared/get-minified-config'
import {STRING_TO_REPLACE} from './shared/constants'

const config = loadConfig()

/**
Initializes the command-line interface for the program.
*/
const program = new Command()
    .name('spa-config-inject')
    .description('Apply configuration to an SPA HTML template file')
    .requiredOption('--env <env>', 'The environment of the config to inject', process.env.SPA_ENV)
    .option(
        '--dynamic-config <dynamicConfig>',
        'Dynamic config override',
        process.env.SPA_CONFIG_OVERRIDE
    )
    .option(
        '--build-dir <buildDir>',
        'The location of the HTML template file',
        config.buildDir ?? process.env.SPA_BUNDLE_DIR
    )
    .option(
        '--config-dir <configDir>',
        'Location of the configuration files',
        config.configDir ?? process.env.SPA_CONFIG_DIR
    )
    .option(
        '--template <template>',
        'The name of the template HTML file (relative to build dir)',
        config.templateFileName ?? process.env.SPA_TEMPLATE_FILE_NAME
    )
    .option(
        '--output <output>',
        'The name of the output HTML file (relative to build dir)',
        config.outputFileName ?? process.env.SPA_OUTPUT_FILE_NAME
    )

/**
Main function that parses the command-line options and injects the config
into the HTML template file.
*/
async function run() {
    const {
        buildDir,
        template: templateFileName,
        output: outputFileName,
        configDir,
        env,
        dynamicConfig: dynamicConfigJSON
    } = program.parse().opts()

    try {
        await injectConfig({
            buildDir,
            templateFileName,
            outputFileName,
            configDir,
            env,
            dynamicConfigJSON
        })
    } catch (e: any) {
        console.error(`🛑 An error occurred: ${e.message}`)
        process.exit(1)
    }
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
    dynamicConfigJSON: string
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
            console.log(opts.dynamicConfigJSON)
            dynamicConfig = JSON.parse(opts.dynamicConfigJSON)
        } catch (e) {
            throw new Error(`Dynamic config cannot be parsed as JSON`)
        }
    }

    const config = merge(staticConfig, dynamicConfig)
    const configString = getMinifiedConfig(config)

    const htmlTemplate = await fs.promises.readFile(templatePath, {encoding: 'utf8'})
    const htmlWithConfig = htmlTemplate.replace(STRING_TO_REPLACE, configString)

    const outputPath = path.resolve(opts.buildDir, opts.outputFileName)
    await fs.promises.writeFile(outputPath, htmlWithConfig)
}

run()
