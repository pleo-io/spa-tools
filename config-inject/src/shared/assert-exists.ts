import * as fs from 'node:fs'

/**
Asserts that a given path exists, and optionally that it is a directory.
Throws an error if the path does not meet the specified conditions.
@param path - The path to check for existence.
@param [options] - Optional configuration object.
@param [options.dir=false] - If true, also assert that the path is a directory.
@throws Throws an error if the path does not exist or is not a directory when options.dir is true.
*/
export function assertExists(path: string, options?: {dir: boolean}) {
    if (!fs.existsSync(path) || (options?.dir && !fs.lstatSync(path).isDirectory())) {
        throw new Error(options?.dir ? `${path} is not a directory` : `${path} does not exist`)
    }
}
