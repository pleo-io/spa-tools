/**
 * Custom Cursor Deploy GitHub action
 * @see {@link https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action}
 *
 * Updates the deployment cursor file in the S3 bucket and optionally updates
 * the rollback file (in the rollback and unblock deployment modes).
 */

import * as core from '@actions/core'
import * as github from '@actions/github'

import {
    writeLineToFile,
    copyFileToS3,
    fileExistsInS3,
    removeFileFromS3,
    runAction,
    isHeadAncestor,
    readFileFromS3,
    getCommitHashFromRef
} from '../utils'

const deployModes = ['default', 'rollback', 'unblock'] as const
type DeployMode = (typeof deployModes)[number]

runAction(async () => {
    const bucket = core.getInput('bucket_name', {required: true})
    const deployModeInput = core.getInput('deploy_mode', {required: true})
    const rollbackCommitHash = core.getInput('rollback_commit_hash')

    const output = await cursorDeploy({
        bucket,
        deployModeInput,
        rollbackCommitHash,
        ref: github.context.payload?.pull_request?.head.ref ?? github.context.ref
    })

    core.setOutput('deploy_hash', output.deployHash)
    core.setOutput('branch_label', output.branchLabel)
})

interface CursorDeployActionArgs {
    bucket: string
    deployModeInput: string
    rollbackCommitHash: string
    ref: string
}

export async function cursorDeploy({
    ref,
    bucket,
    deployModeInput,
    rollbackCommitHash
}: CursorDeployActionArgs) {
    const deployMode = getDeployMode(deployModeInput)
    const branchLabel = branchNameToHostnameLabel(ref)
    const commitHash = await getDeployCommitHash(deployMode, rollbackCommitHash)
    const deployHash = await getDeploymentHashFromCommitHash(bucket, commitHash)

    const rollbackKey = `rollbacks/${branchLabel}`
    const deployKey = `deploys/${branchLabel}`

    if (deployMode === 'default' || deployMode === 'unblock') {
        const rollbackFileExists = await fileExistsInS3({bucket, key: rollbackKey})

        // If we're doing a regular deployment, we need to make sure there isn't an active
        // rollback for the branch we're deploying. Active rollback prevents automatic
        // deployments and requires an explicit unblocking deployment to resume them.
        if (deployMode === 'default' && rollbackFileExists) {
            throw new Error(`${branchLabel} is currently blocked due to an active rollback.`)
        }

        // If we're unblocking a branch after a rollback, it only makes sense if there is an
        // active rollback
        if (deployMode === 'unblock' && !rollbackFileExists) {
            throw new Error(`${branchLabel} does not have an active rollback, you can't unblock.`)
        }
    }

    // Perform the deployment by updating the cursor file for the current branch to point
    // to the desired deploy hash
    await writeLineToFile({text: deployHash, path: branchLabel})
    await copyFileToS3({path: branchLabel, bucket, key: deployKey})
    core.info(`Deploy hash ${deployHash} is now the active deployment for ${branchLabel}.`)

    // If we're doing a rollback deployment we create a rollback file that blocks any following
    // deployments from going through.
    if (deployMode === 'rollback') {
        await copyFileToS3({path: branchLabel, bucket, key: rollbackKey})
        core.info(`${branchLabel} marked as rolled back, automatic deploys paused.`)
    }

    // If we're doing an unblock deployment, we delete the rollback file to allow the following
    // deployments to go through
    if (deployMode === 'unblock') {
        await removeFileFromS3({bucket, key: rollbackKey})
        core.info(`${branchLabel} has automatic deploys resumed.`)
    }

    return {deployHash, branchLabel}
}

/**
 * Retrieve the deploy mode from action input, and set a correct enum type
 * Deploy mode can one of the following:
 * - default - a regular deployment, releasing the latest code on the branch
 * - rollback - an emergency deployment, releasing an older version of the code and preventing following default deployments
 * - unblock - releasing the latest code on the branch and removing the default deployment block
 * @param deployMode - Deployment mode
 * @returns deployMode
 */
function getDeployMode(deployMode: string) {
    function assertDeployMode(value: any): asserts value is DeployMode {
        if (!deployModes.includes(value)) {
            throw new Error(`Incorrect deploy mode (${value})`)
        }
    }
    assertDeployMode(deployMode)
    return deployMode
}

async function getDeployCommitHash(deployMode: DeployMode, rollbackCommitHash?: string) {
    if (deployMode === 'rollback') {
        //  Validate if the input commit hash is a commit from
        //  the current branch, to make sure we can only rollback within the branch.
        if (!!rollbackCommitHash && !(await isHeadAncestor(rollbackCommitHash))) {
            throw new Error('The selected rollback commit is not present on the branch')
        }
        // If no rollback commit is provided, we default to the previous commit on the branch
        return getCommitHashFromRef(rollbackCommitHash || 'HEAD^')
    }
    return getCommitHashFromRef('HEAD')
}

// Get deploy hash for the provided commit hash
async function getDeploymentHashFromCommitHash(bucket: string, commitHash: string) {
    const commitKey = `deploys/commits/${commitHash}`
    const deployHash = await readFileFromS3({
        bucket: bucket,
        key: commitKey
    })
    if (!deployHash) {
        throw Error(`Deploy hash for commit ${commitHash} not found.`)
    }
    core.info(`Using deploy hash ${deployHash} (commit ${commitHash})`)
    return deployHash
}

export function branchNameToHostnameLabel(ref: string) {
    const hostnameLabel = ref
        ?.split('refs/heads/')
        .pop()
        ?.replace(/[^\w]/gi, '-') // replace all non-word characters with a "-"
        .replace(/-{2,}/gi, '-') // get rid of multiple consecutive "-"
        .toLowerCase()
        .slice(0, 60)
        ?.replace(/(-|_)$/gi, '') // get rid of trailing "-" and "_"
        .trim()

    if (!hostnameLabel) {
        throw new Error('Could not get a valid hostname label from branch name')
    }

    return hostnameLabel
}
