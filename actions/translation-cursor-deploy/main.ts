/**
 * Custom Cursor Deploy GitHub action
 * @see {@link https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action}
 *
 * Updates the 'latest' and 'previous' translation cursor files with the latest and previous hash
 */

import * as core from '@actions/core'

import {writeLineToFile, runAction, fileExistsInS3, copyFileToS3, removeFileFromS3} from '../utils'

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

const modes = ['default', 'previous'] as const
type Mode = typeof modes[number]

interface CursorDeployActionArgs {
    bucket: string
    hash?: string
    modeInput: string
}

export const previousKey = `translation-deploy/previous`
export const latestKey = `translation-deploy/latest`

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
            key: 'translation-deploy/previous'
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

    const isLatestFileExists = await fileExistsInS3({bucket, key: 'translation-deploy/latest'})
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
 * - previous - an emergency deployment, updateing latest cursor with the previous cursor & removing previous
 * @param Mode - Deployment mode
 * @returns mode
 */
function getMode(mode: string) {
    function assertDeployMode(value: any): asserts value is Mode {
        if (!modes.includes(value)) {
            throw new Error(`Incorrect deploy mode (${value})`)
        }
    }
    assertDeployMode(mode)
    return mode
}
