import path from 'node:path'
import {createRequire} from 'module'
import {z, ZodError} from 'zod'
import {fromZodError} from 'zod-validation-error'

const clientConfigSchema = z.object({
    configDir: z.string(),
    buildDir: z.string(),
    templateFileName: z.string().default('_index.html'),
    outputFileName: z.string().default('index.html'),
    devConfigOverrideFile: z.string().default('config.dev.json')
})

/**
Loads and validates the configuration from package.json.
If the configuration is invalid, it logs the error and exits the process.
@returns Returns the parsed and validated configuration object.
*/
export function loadConfig() {
    const rawConfig = getRawConfig()
    return parseConfig(rawConfig)
}

export function getRawConfig() {
    const require = createRequire(import.meta.url)
    const pkgJSON = require(path.resolve('package.json'))
    return pkgJSON.spaConfig
}

export function parseConfig(rawConfig: unknown) {
    try {
        return clientConfigSchema.parse(rawConfig)
    } catch (err) {
        if (err instanceof ZodError) {
            const validationError = fromZodError(err)
            console.error(`🛑 Configuration error: ${validationError}`)
        } else {
            console.error(`🛑 Configuration error: ${err}`)
        }
        process.exit(1)
    }
}
