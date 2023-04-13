import jsesc from 'jsesc'
import {CONFIG_GLOBAL_VAR} from './constants'

/**
Converts a typed config object to a JSON string var declaration prepared for
inlining in an HTML document.
@param config - The config object to be minified.
@returns Returns the minified config string for inlining in an HTML document.
*/

export function getMinifiedConfig(config: unknown): string {
    const configString = jsesc(JSON.stringify(config), {
        json: true,
        isScriptContext: true
    })
    return `window.${CONFIG_GLOBAL_VAR}=JSON.parse(${configString});`
}
