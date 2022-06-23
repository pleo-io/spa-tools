/**
 * Custom Cursor Deploy GitHub action
 * @see {@link https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action}
 *
 * Updates the deployment translation cursor file in the S3 bucket.
 */

import * as core from '@actions/core'
import {exec} from '@actions/exec'

import {writeLineToFile, runAction, fileExistsInS3} from '../utils'

runAction(async () => {
    const bucket = core.getInput('bucket_name', {required: true})
    const hash = core.getInput('hash', {required: true})

    await cursorDeploy({
        bucket,
        hash
    })
})

const PREVIOUS_HASH_COMMAND = 'previous'

interface CursorDeployActionArgs {
    bucket: string
    hash: string
}

export async function cursorDeploy({bucket, hash}: CursorDeployActionArgs) {
    const previousPath = `s3://${bucket}/translation-deploy/previous`
    const latestPath = `s3://${bucket}/translation-deploy/latest`

    if (hash === PREVIOUS_HASH_COMMAND) {
        const isPreviosFileExists = await fileExistsInS3({
            bucket,
            key: 'translation-deploy/previous'
        })
        if (!isPreviosFileExists) {
            core.setFailed('Previous cursor is empty')
            return
        }

        const isLatestFileExists = await fileExistsInS3({bucket, key: 'translation-deploy/latest'})
        if (isLatestFileExists) {
            await exec('aws s3 rm ', [latestPath])
        }
        await exec('aws s3 cp ', [previousPath, latestPath])
    } else {
        const isPreviosFileExists = await fileExistsInS3({
            bucket,
            key: 'translation-deploy/previous'
        })
        if (isPreviosFileExists) {
            await exec('aws s3 rm ', [previousPath])
        }
        const isLatestFileExists = await fileExistsInS3({bucket, key: 'translation-deploy/latest'})
        if (isLatestFileExists) {
            await exec('aws s3 cp ', [latestPath, previousPath])
        }
        await writeLineToFile({text: hash, path: 'latest'})
        await exec('aws s3 cp ', ['latest', latestPath])
    }
}
