/**
 * Post the feature branch preview links to PR description
 */

import * as core from '@actions/core'
import * as github from '@actions/github'

import {getSanitizedBranchName, runAction} from '../utils'

runAction(async () => {
    const token = core.getInput('token', {required: true})
    const domain = core.getInput('domain', {required: true})
    const permalink = core.getInput('permalink')
    const appName = core.getInput('app-name', {required: true})
    const repo = github.context.repo
    const prNumber = github.context.payload.pull_request?.number

    await postPreviewUrls({domain, permalink, token, prNumber, repo, appName})
})

interface PostPreviewUrlsActionArgs {
    token: string
    domain: string
    prNumber?: number
    repo: typeof github.context.repo
    permalink?: string
    appName: string
}

export async function postPreviewUrls({
    token,
    domain,
    repo,
    prNumber,
    permalink,
    appName
}: PostPreviewUrlsActionArgs) {
    if (!prNumber) {
        throw new Error('Called outside of a PR context.')
    }

    const octokit = github.getOctokit(token)

    const latestPR = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
        ...repo,
        pull_number: prNumber
    })
    const branchName = getSanitizedBranchName(latestPR.data.head.ref)
    const prBody = latestPR.data.body

    const markerStart = `<!--${domain}-preview-urls-do-not-change-below-->`
    const markerEnd = `<!--${domain}-preview-urls-do-not-change-above-->`
    const isFreshPR = !prBody?.includes(markerStart)
    const isDeploying = !permalink && isFreshPR
    const prDescriptionAbove = prBody?.split(markerStart)[0]?.trim() ?? ''
    const prDescriptionBelow = prBody?.split(markerEnd).pop()?.trim() ?? ''

    const body = `${prDescriptionAbove}
${markerStart}
---
**${appName} preview links**
_Latest_: https://${branchName}.${domain}${isDeploying ? ' (Deploying... 🚧)' : ''}
_Current permalink_: ${permalink ?? '(Deploying... 🚧)'}
${markerEnd}
${isFreshPR ? '' : prDescriptionBelow}`.trimEnd()

    await octokit.request('PATCH /repos/{owner}/{repo}/pulls/{pull_number}', {
        ...repo,
        pull_number: prNumber,
        body
    })
}
