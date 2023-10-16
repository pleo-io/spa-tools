import path from 'node:path'
import {z} from 'zod'
import {readFileSync} from 'node:fs'

const clientConfigSchema = z.object({
    configDir: z.string(),
    buildDir: z.string(),
    templateFileName: z.string().default('_index.html'),
    outputFileName: z.string().default('index.html'),
    localConfigOverrideFile: z.string().default('config.local.json')
})

/**
Loads and validates the configuration from package.json.
If the configuration is invalid, it logs the error and exits the process.
@returns Returns the parsed and validated configuration object.
*/
export async function loadConfig() {
    const rawConfig = await getRawConfig()
    return parseConfig(rawConfig)
}

async function getRawConfig() {
    const pkgJSON = readFileSync(path.resolve('package.json'), 'utf-8')
    return JSON.parse(pkgJSON).spaConfig
}

export function parseConfig(rawConfig: unknown) {
    try {
        return clientConfigSchema.parse(rawConfig)
    } catch (err) {
        console.error(`🛑 Configuration error: ${err}`)
        process.exit(1)
    }
}
