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
    const repo = github.context.repo
    const pr = github.context.payload.pull_request

    await postPreviewUrls({domain, permalink, token, pr, repo})
})

interface PostPreviewUrlsActionArgs {
    token: string
    domain: string
    pr: typeof github.context.payload.pull_request
    repo: typeof github.context.repo
    permalink?: string
}

export async function postPreviewUrls({
    token,
    domain,
    repo,
    pr,
    permalink
}: PostPreviewUrlsActionArgs) {
    if (!pr) {
        throw new Error('Called outside of a PR context.')
    }

    const octokit = github.getOctokit(token)
    const branchName = getSanitizedBranchName(pr.head.ref)

    const markerStart = `<!--${domain}-preview-urls-do-not-change-below-->`
    const markerEnd = `<!--${domain}-preview-urls-do-not-change-above-->`
    const freshPR = !pr.body?.includes(markerStart)
    const prDescriptionAbove = pr.body?.split(markerStart)[0]?.trim() ?? ''
    const prDescriptionBelow = pr.body?.split(markerEnd).pop()?.trim() ?? ''

    const body = `${prDescriptionAbove}
${markerStart}
---
🤖 **${domain} preview links**
_Latest_: https://${branchName}.${domain}${!permalink && freshPR ? ' (Deploying... 🚧)' : ''}
_Current permalink_: ${permalink ?? '(Deploying... 🚧)'}
${markerEnd}
${freshPR ? '' : prDescriptionBelow}`

    await octokit.request('PATCH /repos/{owner}/{repo}/pulls/{pull_number}', {
        ...repo,
        pull_number: pr.number,
        body
    })
}
