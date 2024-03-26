/**
 * Post the feature branch preview links to PR description
 */

import * as core from '@actions/core'
import * as github from '@actions/github'

import {runAction} from '../utils'

runAction(async () => {
    const token = core.getInput('token', {required: true})
    const linksJSON = core.getInput('links', {required: true})
    const appName = core.getInput('app_name', {required: true})
    const asLabels = core.getInput('as_labels') === 'true'
    const repo = github.context.repo
    const prNumber = github.context.payload.pull_request?.number

    await postPreviewUrls({linksJSON, token, prNumber, repo, appName, asLabels})
})

interface PostPreviewUrlsActionArgs {
    token: string
    prNumber?: number
    repo: typeof github.context.repo
    appName: string
    linksJSON: string
    asLabels?: boolean
}

export async function postPreviewUrls({
    token,
    linksJSON,
    repo,
    prNumber,
    appName,
    asLabels
}: PostPreviewUrlsActionArgs) {
    if (!prNumber) {
        throw new Error('Called outside of a PR context.')
    }
    const octokit = github.getOctokit(token)
    const links = parseLinks(linksJSON)
    const prDescription = await getPRDescription(octokit, prNumber, repo)

    const appLabel = appName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    const markerStart = `<!--${appLabel}-preview-urls-do-not-change-below-->`
    const markerEnd = `<!--${appLabel}-preview-urls-do-not-change-above-->`

    const isFreshPR = !prDescription?.includes(markerStart)

    const prDescriptionAbove = prDescription?.split(markerStart)[0]?.trim() ?? ''
    const prDescriptionBelow = prDescription?.split(markerEnd).pop()?.trim() ?? ''

    const anyMarkerStart = new RegExp(`<!--.+-preview-urls-do-not-change-below-->`)
    const prDescriptionAboveIncludesOtherApp = !!prDescriptionAbove.match(anyMarkerStart)
    const descriptionAppendage = prDescriptionAboveIncludesOtherApp ? '' : '\n'

    const linksMessages = links
        .map((link) => {
            if (asLabels) {
                return `[${link.name}](${link.url})`
            }
            return `_${link.name}_: ${link.url}`
        })
        .join(asLabels ? ', ' : '\n')
    const heading = `**${appName} preview links**`

    const body = [
        prDescriptionAbove + descriptionAppendage,
        markerStart,
        '---',
        heading,
        linksMessages,
        markerEnd,
        isFreshPR ? '' : prDescriptionBelow
    ]
        .join('\n')
        .trimEnd()

    await octokit.request('PATCH /repos/{owner}/{repo}/pulls/{pull_number}', {
        ...repo,
        pull_number: prNumber,
        body
    })
}

function parseLinks(linksJSON: string) {
    let links: Array<{url: string; name: string}>

    try {
        links = JSON.parse(linksJSON)
    } catch (error) {
        throw new Error('Links must be valid JSON')
    }

    if (!Array.isArray(links)) {
        throw new Error('Links must be an array of links')
    }

    for (const link of links) {
        if (
            !link.name ||
            !link.url ||
            typeof link.name !== 'string' ||
            typeof link.url !== 'string'
        ) {
            throw new Error('Each link must be an object with name and url string props')
        }
    }

    return links
}

async function getPRDescription(
    octokit: ReturnType<typeof github.getOctokit>,
    prNumber: number,
    repo: typeof github.context.repo
) {
    const pullRequest = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
        ...repo,
        pull_number: prNumber
    })

    return pullRequest.data.body
}
