import {exec} from '@actions/exec'
import * as core from '@actions/core'

/**
 * Wraps "@actions/exec" exec method to return the stdout output as a string string
 * @param commandLine - command to execute
 * @param command -  optional arguments for tool
 * @returns stdout
 */
export async function execReadOutput(commandLine: string, args?: string[]) {
    let output = ''
    await exec(commandLine, args, {
        listeners: {stdout: (data) => (output += data.toString())}
    })
    return output.trim()
}

/**
 * Wraps "@actions/exec" exec method to return a boolean indicating if the
 * command exited successfully
 * @param commandLine - command to execute
 * @param command -  optional arguments for tool
 * @returns isSuccessful
 */
export async function execIsSuccessful(commandLine: string, args?: string[]) {
    try {
        await exec(commandLine, args)
        return true
    } catch (e) {
        return false
    }
}

/**
 * Checks if a file with a given key exists in the specified S3 bucket
 * Uses "aws s3api head-object"
 * @param options.key - The key of a file in the S3 bucket
 * @param options.bucket - The name of the S3 bucket (globally unique)
 * @returns fileExists - boolean indicating if the file exists
 */
export async function fileExistsInS3({key, bucket}: {key: string; bucket: string}) {
    return execIsSuccessful('aws s3api head-object', [`--bucket=${bucket}`, `--key=${key}`])
}

/**
 * Writes a line of text into a file at a specified path, replacing any existing content
 * Executes "echo "my text" > ./some/file"
 * @param options.text - A string saved to the file
 * @param options.path - The local path of the file (relative to working dir)
 * @returns exitCode - shell command exit code
 */
export async function writeLineToFile({text, path}: {text: string; path: string}) {
    await exec(`/bin/bash -c "echo ${text} > ${path}"`)
}

/**
 * Uploads a local file at a specified path to a S3 bucket at a given given
 * Executes "aws s3 cp"
 * @param options.path - The local path of the file (relative to working dir)
 * @param options.key - The key of a file to create in the S3 bucket
 * @param options.bucket - The name of the S3 bucket (globally unique)
 * @returns exitCode - shell command exit code
 */
export async function copyFileToS3({
    path,
    key,
    bucket
}: {
    path: string
    key: string
    bucket: string
}) {
    await exec('aws s3 cp', [path, `s3://${bucket}/${key}`])
}

/**
 * Deletes a file at a specified key from a given S3 bucket
 * Executes "aws s3 rm"
 * @param options.key - The key of a file to remove in the S3 bucket
 * @param options.bucket - The name of the S3 bucket (globally unique)
 * @returns exitCode - shell command exit code
 */
export async function removeFileFromS3({key, bucket}: {key: string; bucket: string}) {
    await exec('aws s3 rm', [`s3://${bucket}/${key}`])
}

/**
 * Executes the action function and correctly handles any errors caught
 * @param action - The async function running the action script
 */
export async function runAction(action: () => Promise<unknown>) {
    try {
        return await action()
    } catch (error: unknown) {
        if (error instanceof Error) {
            core.error(error.stack ?? error.message)
            core.setFailed(error)
        } else {
            core.setFailed(String(error))
        }
    }
}

/**
 * Validate if the passed git commit hash is present on the current branch
 * @param commitHash - commit hash to validate
 * @returns isHeadAncestor
 */
export async function isHeadAncestor(commitHash: string) {
    return execIsSuccessful('git merge-base', [`--is-ancestor`, commitHash, `HEAD`])
}

/**
 * Retrieve the root tree hash for the provided commit identifier
 * @param commit - commit identifier to lookup
 * @returns treeHash
 */
export async function getTreeHashForCommitHash(commit: string) {
    return execReadOutput('git rev-parse', [`${commit}:`])
}

/**
 * Retrieves the current root tree hash of the git repository
 * Tree hash captures the state of the whole directory tree
 * of all the files in the repository.
 * @returns treeHash - SHA-1 root tree hash
 */
export async function getCurrentRepoTreeHash() {
    return getTreeHashForCommitHash('HEAD')
}
