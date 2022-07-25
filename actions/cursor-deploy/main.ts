/**
 * Custom Cursor Deploy GitHub action
 * @see {@link https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action}
 *
 * Updates the deployment cursor file in an S3 bucket with the currently deployed version
 * Optionally creates or deletes a rollback file to indicate getting in and out of a rollback.
 */

import * as path from 'path'
import * as core from '@actions/core'
import * as github from '@actions/github'

import {
    fileExistsInS3,
    removeFileFromS3,
    runAction,
    getCurrentRepoTreeHash,
    getSanitizedBranchName,
    getFileFromS3,
    saveTextAsFileInS3
} from '../utils'

const DEFAULT_HISTORY_COUNT = 20

// Dependency injection which helps with testing. Takes input from GitHub Actions SDK
// and passes to the function that executes the action logic. Takes function's output and uses
// GitHub Actions SDK to set it as the action's output
runAction(async () => {
    const output = await cursorDeploy({
        bucket: core.getInput('bucket-name', {required: true}),
        deployMode: core.getInput('deploy-mode', {required: true}),
        appName: core.getInput('app-name', {required: true}),
        featureBranches: core.getInput('use-branches') === 'true',
        requestedVersion: core.getInput('deploy-version'),
        rollbackJump: parseInt(core.getInput('rollback-jump'), 10),
        historyCount: parseInt(core.getInput('history-count'), 10),
        ref: github.context.payload?.pull_request?.head.ref ?? github.context.ref
    })

    core.setOutput('deployed-version', output.deployedVersion)
})

interface CursorDeployActionArgs {
    bucket: string
    deployMode: string
    appName?: string
    requestedVersion?: string
    featureBranches: boolean
    rollbackJump?: number
    historyCount?: number
    ref: string
}

export async function cursorDeploy(input: CursorDeployActionArgs) {
    const {appName, ref, bucket, rollbackJump, requestedVersion, featureBranches} = input
    const historyCount = input.historyCount ?? DEFAULT_HISTORY_COUNT

    // Get the deployment name which is used for
    const deploymentKeys = getDeploymentKeys({appName, ref, featureBranches})
    const deployMode = getDeployMode(input.deployMode)

    const cursorHistory = (await getFileFromS3({key: deploymentKeys.deploy, bucket})).split('\n')

    const deployedVersion = await getDeployedVersion({
        deployMode,
        requestedVersion,
        cursorHistory,
        rollbackJump,
        historyCount
    })

    if (deployMode === 'default' || deployMode === 'unblock') {
        const rollbackFileExists = await fileExistsInS3({bucket, key: deploymentKeys.rollback})

        // If we're doing a regular deployment, we need to make sure there isn't an active
        // rollback for the branch we're deploying. Active rollback prevents automatic
        // deployments and requires an explicit unblocking deployment to resume them.
        if (deployMode === 'default' && rollbackFileExists) {
            throw new Error(
                `${deploymentKeys.deploy} is currently blocked due to an active rollback.`
            )
        }

        // If we're unblocking a branch after a rollback, it only makes sense if there is an
        // active rollback
        if (deployMode === 'unblock' && !rollbackFileExists) {
            throw new Error(
                `${deploymentKeys.deploy} does not have an active rollback, you can't unblock.`
            )
        }
    }

    // Perform the deployment by updating the cursor file for the current branch to point
    // to the desired tree hash
    const updatedCursorFile = [deployedVersion, ...cursorHistory].slice(0, historyCount).join('\n')
    await saveTextAsFileInS3({text: updatedCursorFile, bucket, key: deploymentKeys.deploy})
    core.info(`${deploymentKeys.deploy} is now deployed with version ${deployedVersion}`)

    // If we're doing a rollback deployment we create a rollback file that blocks any following
    // deployments from going through.
    if (deployMode === 'rollback') {
        await saveTextAsFileInS3({text: deployedVersion, bucket, key: deploymentKeys.rollback})
        core.info(`${deploymentKeys.deploy} marked as rolled back, automatic deploys paused.`)
    }

    // If we're doing an unblock deployment, we delete the rollback file to allow the following
    // deployments to go through
    if (deployMode === 'unblock') {
        await removeFileFromS3({bucket, key: deploymentKeys.rollback})
        core.info(`${deploymentKeys.deploy} has automatic deploys resumed.`)
    }

    return {deployedVersion}
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
            throw new Error(`Incorrect deploy mode provided (${value})`)
        }
    }
    assertDeployMode(deployMode)
    return deployMode
}
const deployModes = ['default', 'rollback', 'unblock'] as const
type DeployMode = typeof deployModes[number]

/**
 * Establish the version of the code to be deployed.
 * If we're doing a rollback,
 * we figure out the tree hash from the explicitly passed commit hash or the previous
 * commit on the branch. We additionally validate if the input commit hash is a commit from
 * the current branch, to make sure we can only rollback within the branch.
 * Otherwise we use the head root tree hash on the current branch.
 * @param deployMode - Deployment mode
 * @param rollbackCommitHash - In rollback deploy mode, optional explicit commit hash to roll back to
 * @returns treeHash
 */
async function getDeployedVersion({
    deployMode,
    requestedVersion,
    cursorHistory,
    rollbackJump,
    historyCount
}: {
    deployMode: DeployMode
    cursorHistory: string[]
    requestedVersion?: string
    rollbackJump?: number
    historyCount: number
}) {
    if (deployMode === 'rollback') {
        if (requestedVersion) {
            if (!cursorHistory.includes(requestedVersion)) {
                throw new Error(
                    `The requested version ${requestedVersion} has not been deployed in the last ${historyCount} deploys. Preventing rollback to avoid serving invalid version.`
                )
            }
            core.info(`Rolling back to requested version ${requestedVersion}`)
            return requestedVersion
        }

        if (!rollbackJump) {
            throw new Error('Expected a rollback jump or version for rollback deployment mode.')
        }

        const rollbackVersion = cursorHistory[rollbackJump]
        if (!rollbackVersion) {
            throw new Error(
                `The is no deployment history for ${rollbackJump} versions back. Cannot roll back.`
            )
        }
        core.info(`Rolling back to version ${rollbackVersion}`)
        return rollbackVersion
    }

    if (requestedVersion) {
        core.info(`Deploying requested version ${requestedVersion}`)
        return requestedVersion
    }

    // Defaulting to the version being the current tree hash of the root of the repo
    const treeHash = await getCurrentRepoTreeHash()
    core.info(`Using current root tree hash ${treeHash}`)
    return treeHash
}

/**
 * Get the location of the cursor and rollback files in S3, based on the
 * configuration passed to the action. Two options matter here:
 *      - app name: for project where there are multiple separately deployed pieces
 *      we need a way to store more than one set of rollback/deploy cursors. The app
 *      name can be used to namespace those. If app name is omitted, we fall back to
 *      the original behavior of using keys with "deploys" and "rollbacks" prefixes. If
 *      it's provided, we use the app name as the prefix, i.e. "my-app/deploys" and
 *      "my-app/rollbacks"
 *      - use feature branches: for deployments tied to the data in the repository, we enable
 *      feature branch support by having a rollback and deploy cursor files per git repo
 *      branch name. If this behavior is turned off, we only use a cursor called "master"
 * @param options.ref Git ref name (e.g. "refs/heads/my-branch")
 * @param options.featureBranches Switch for using current branch name (based on ref) to scope cursors
 * @param options.appName Name of the app for namespacing cursor files (e.g. "my-app")
 * @returns An object containing "rollback" and "deploy" S3 keys as strings
 */
function getDeploymentKeys({
    ref,
    appName,
    featureBranches
}: {
    ref: string
    appName?: string
    featureBranches: boolean
}) {
    let deployKeySegments = ['deploys']
    let rollbackKeySegments = ['rollbacks']

    if (featureBranches) {
        const deploymentName = getSanitizedBranchName(ref)
        deployKeySegments.push(deploymentName)
        rollbackKeySegments.push(deploymentName)
    } else {
        deployKeySegments.push('master')
        rollbackKeySegments.push('master')
    }

    if (appName) {
        deployKeySegments.unshift(appName)
        rollbackKeySegments.unshift(appName)
    }

    return {
        deploy: path.join(...deployKeySegments),
        rollback: path.join(...rollbackKeySegments)
    }
}
