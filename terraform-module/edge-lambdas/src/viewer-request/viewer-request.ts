import * as path from 'path'

import {CloudFrontRequest, CloudFrontRequestHandler} from 'aws-lambda'
import {S3Client} from '@aws-sdk/client-s3'

import {APP_VERSION_HEADER, getHeader, setHeader} from '../utils'
import {fetchFileFromS3Bucket} from '../s3'
import {Config} from '../config'

const DEFAULT_BRANCH_DEFAULT_NAME = 'master'

/**
 * Edge Lambda handler triggered on "viewer-request" event, on the default CF behavior of the web app
 * CF distribution. The default CF behavior only handles requests for HTML documents and requests for
 * static files (e.g. /, /bills, /settings/accounting etc.). Since our app is client side routed, all
 * these requests return the same HTML index file.
 *
 * This lambda runs for every request and modifies the request object before it's used to fetch the
 * resource from the origin (S3 bucket). It calculates which HTML file the request should respond with
 * based on the host name specified by the request, and sets that file as the URI of the request.
 * The options are:
 * - HTML for latest app version on the main branch
 *   e.g. app.dev.example.com and app.example.com
 * - HTML for latest app version on a feature branch (branch preview deployment)
 *   e.g. my-branch.dev.example.com
 * - HTML for a specific app version (hash preview deployment)
 *   e.g. preview-b104213fc39ecca4f237a7bd6544d428ad46ec7e.app.dev.example.com
 *
 * If the translations are enabled via configuration, this lambda will also fetch the current translation
 * version from S3 and pass it to the response lambda via custom headers on the request object.
 */
export function getHandler(config: Config, s3: S3Client) {
    const handler: CloudFrontRequestHandler = async (event) => {
        const request = event.Records[0].cf.request

        try {
            // Get app version and translation version in parallel to avoid the double network penalty.
            // Translation hash is only fetched if translations are enabled. Fetching translation cursor
            // can never throw here, as in case of a failure we're returning a default value.
            const appVersion = await getAppVersion(request, config, s3)

            // Set app version header on request, so it can be picked up by the viewer response lambda
            request.headers = setHeader(request.headers, APP_VERSION_HEADER, appVersion)

            // We instruct the CDN to return a file that corresponds to the app version calculated
            const uri = getUri(request, appVersion)
            request.uri = uri
        } catch (error) {
            console.error(error)
            // On failure, we're requesting a non-existent file on purpose, to allow CF to serve
            // the configured custom error page
            request.uri = '/404'
        }

        return request
    }

    return handler
}

/**
 * We respond with a requested file, but prefix it with the hash of the current active deployment
 */
function getUri(request: CloudFrontRequest, appVersion: string) {
    // If the
    // - request uri is for a specific file (e.g. "/iframe.html")
    // - or is a request on one of the .well-known paths (like .well-known/apple-app-site-association)
    // we serve the requested file.
    // Otherwise, for requests uris like "/" or "my-page" we serve the top-level index.html file,
    // which assumes the routing is handled client-side.
    const isFileRequest = request.uri.split('/').pop().includes('.')
    const isWellKnownRequest = request.uri.startsWith('/.well-known/')
    const filePath = isFileRequest || isWellKnownRequest ? request.uri : '/index.html'

    return path.join('/html', appVersion, filePath)
}

/**
 * Calculate the version of the app that should be served.
 * It can be either a specific version requested via preview link with a hash, or the latest
 * version for a branch requested (preview or main), which we fetch from cursor files stored in S3
 */
async function getAppVersion(request: CloudFrontRequest, config: Config, s3: S3Client) {
    const host = getHeader(request, 'host') ?? null

    // Preview name is the first segment of the url e.g. my-branch for my-branch.app.dev.example.com
    // Preview name is either a sanitized branch name or it follows the preview-[hash] pattern
    let previewName: string

    if (config.previewDeploymentPostfix && host && host.includes(config.previewDeploymentPostfix)) {
        previewName = host.split('.')[0]

        // If the request is for a specific hash of a preview deployment, we use that hash
        const previewHash = getPreviewHash(previewName)
        if (previewHash) {
            return previewHash
        }
    }

    const defaultBranchName = config.defaultBranchName ?? DEFAULT_BRANCH_DEFAULT_NAME

    // Otherwise we fetch the current app version for requested branch from S3
    const branchName = previewName || defaultBranchName
    return fetchAppVersion(branchName, config, s3)
}

/**
 * We serve a preview for each app version at e.g.preview-[hash].app.dev.example.com
 * If the preview name matches that pattern, we assume it's a hash preview link
 */
function getPreviewHash(previewName?: string) {
    const matchHash = /^preview-(?<hash>[a-z0-9]{16}|[a-z0-9]{40})$/.exec(previewName || '')
    return matchHash?.groups?.hash
}

/**
 * Fetch a cursor deploy file from the S3 bucket and returns its content, which is the current
 * active app version for that branch).
 */
async function fetchAppVersion(branch: string, config: Config, s3: S3Client) {
    try {
        return await fetchFileFromS3Bucket(`deploys/${branch}`, config.originBucketName, s3)
    } catch (error) {
        throw new Error(`Cursor file not found for branch=${branch}`)
    }
}
