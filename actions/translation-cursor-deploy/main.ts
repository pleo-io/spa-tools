/**
 * Custom Cursor Deploy GitHub action
 * @see {@link https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action}
 *
 * Updates the 'latest' and 'previous' translation cursor files with the latest and previous hash
 */

import * as core from '@actions/core'

import {
    writeLineToFile,
    runAction,
    fileExistsInS3,
    copyFileToS3,
    removeFileFromS3,
    previousKey,
    latestKey
} from '../utils'

runAction(async () => {
    const bucket = core.getInput('bucket_name', {required: true})
    const hash = core.getInput('hash', {required: false})
    const modeInput = core.getInput('mode', {required: true})

    await cursorDeploy({
        bucket,
        hash,
        modeInput
    })
})

interface CursorDeployActionArgs {
    bucket: string
    hash?: string
    modeInput: string
}

export async function cursorDeploy({
    bucket,
    hash,
    modeInput
}: CursorDeployActionArgs): Promise<{success: boolean}> {
    const mode = getMode(modeInput)
    const previousPath = `s3://${bucket}/${previousKey}`
    const latestPath = `s3://${bucket}/${latestKey}`

    if (mode === 'previous' && Boolean(hash)) {
        throw new Error(
            'Previous mode should be run without specified hash, otherwise it is ambiouty what should be used hash from param or hash from previous.'
        )
    }

    if (mode === 'previous') {
        const isPreviosFileExists = await fileExistsInS3({
            bucket,
            key: previousKey
        })
        if (!isPreviosFileExists) {
            throw new Error('Previous cursor is empty, please specify the hash')
        }
        await copyFileToS3({path: previousPath, bucket, key: latestKey})
        await removeFileFromS3({bucket, key: previousKey})
        return {success: true}
    }

    if (!hash) {
        throw new Error('Hash should be speficied with the default mode')
    }

    const isLatestFileExists = await fileExistsInS3({bucket, key: latestKey})
    if (isLatestFileExists) {
        await copyFileToS3({path: latestPath, bucket, key: previousKey})
    }
    await writeLineToFile({text: hash, path: 'latest'})
    await copyFileToS3({path: 'latest', bucket, key: latestKey})
    return {success: true}
}

/**
 * Retrieve the deploy mode from action input, and set a correct enum type
 * Deploy mode can one of the following:
 * - default - a regular deployment, updating latest cursor with hash from params & previous cursor with the value from latest if latest exists
 * - rollback - an emergency deployment restoring the previous version as the current one. It updates the "latest" cursor file with the value of the "previous" cursor & removes the "previous" cursor file
 * @param mode - Deployment mode
 * @returns mode
 */
function getMode(mode: string) {
    const modes = ['default', 'previous']
    function assertDeployMode(value: any) {
        if (!modes.includes(value)) {
            throw new Error(`Incorrect deploy mode (${value})`)
        }
    }
    assertDeployMode(mode)
    return mode
}
