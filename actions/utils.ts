import {exec} from '@actions/exec'
import * as core from '@actions/core'

/**
 * Checks if a file with a given key exists in the specified S3 bucket
 * Uses "aws s3api head-object"
 * @param options.key - The key of a file in the S3 bucket
 * @param options.bucket - The name of the S3 bucket
 * @returns fileExists - boolean indicating if the file exists
 */
export async function fileExistsInS3({key, bucket}: {key: string; bucket: string}) {
    return execIsSuccessful('aws s3api head-object', [`--bucket=${bucket}`, `--key=${key}`])
}

/**
 * Creates a file with provided content and uploads it to the provided S3 bucket at the provided key
 * @param options.text The content of the uploaded file
 * @param options.key - The key of the file in the S3 bucket
 * @param options.bucket - The name of the S3 bucket
 */
export async function saveTextAsFileInS3({
    text,
    key,
    bucket
}: {
    text: string
    key: string
    bucket: string
}) {
    const tempPath = '.temp'
    await writeTextToFile({text, path: tempPath})
    await copyFileToS3({path: tempPath, bucket, key})
    await exec('rm', [tempPath])
}

/**
 *
 * @param options.key - The key of a file to remove in the S3 bucket
 * @param options.bucket - The name of the S3 bucket
 * @returns Content of the file from S3 as a string
 */
export async function getFileFromS3({key, bucket}: {key: string; bucket: string}) {
    const tempPath = '.temp'
    await exec('aws s3 cp', [`s3://${bucket}/${key}`, tempPath])
    const output = await execReadOutput('cat', [tempPath])
    await exec('rm', [tempPath])
    return output
}

/**
 * Deletes a file at a specified key from a given S3 bucket
 * Executes "aws s3 rm"
 * @param options.key - The key of a file to remove in the S3 bucket
 * @param options.bucket - The name of the S3 bucket
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
        return action()
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
 * Retrieve and convert the current git branch name to a string that is safe
 * for use as a S3 file key and a URL segment
 * @param ref Git ref name (e.g. "refs/heads/my-branch")
 * @returns Sanitized branch name as a string
 */
export function getSanitizedBranchName(ref: string) {
    const branchName = ref
        .split('refs/heads/')
        .pop()
        ?.replace(/[^\w]/gi, '-') // replace all non-word characters with a "-"
        .replace(/-{2,}/gi, '-') // get rid of multiple consecutive "-"
        .toLowerCase()
        .slice(0, 60)
        .trim()

    if (!branchName) {
        throw new Error('Invalid context, could not calculate sanitized branch name')
    }

    return branchName
}

/**
 * Retrieves the current root tree hash of the git repository
 * Tree hash captures the state of the whole directory tree
 * of all the files in the repository.
 * @returns treeHash - SHA-1 root tree hash
 */
export async function getCurrentRepoTreeHash() {
    return execReadOutput('git rev-parse', ['HEAD:'])
}

/**
 * Uploads a local file at a specified path to a S3 bucket at a given given
 * Executes "aws s3 cp"
 */
async function copyFileToS3({path, key, bucket}: {path: string; key: string; bucket: string}) {
    await exec('aws s3 cp', [path, `s3://${bucket}/${key}`])
}

/**
 * Writes a line of text into a file at a specified path, replacing any existing content
 * Executes "echo "my text" > ./some/file"
 */
async function writeTextToFile({text, path}: {text: string; path: string}) {
    await exec(`/bin/bash -c "echo ${text} > ${path}"`)
}

/**
 * Wraps "@actions/exec" exec method to return the stdout output as a string string
 */
async function execReadOutput(commandLine: string, args?: string[]) {
    let output = ''
    await exec(commandLine, args, {
        listeners: {stdout: (data) => (output += data.toString())}
    })
    return output.trim()
}

/**
 * Wraps "@actions/exec" exec method to return a boolean indicating if the
 * command exited successfully
 */
async function execIsSuccessful(commandLine: string, args?: string[]) {
    try {
        await exec(commandLine, args)
        return true
    } catch (e) {
        return false
    }
}
