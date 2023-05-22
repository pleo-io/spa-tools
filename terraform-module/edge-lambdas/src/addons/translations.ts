/**
 * This addon adds the translations functionality to the SPA served. It uses a secondary cursor deployment.
 * The latest version of translations is fetched when the HTML requested by the browser (at the same time as
 * the latest version of the app is served). Then that version is returned together with the HTML response
 * via a cookie header.
 * Additionally, to improve performance, a preload link header is added to the HTML response to trigger fetching
 * of the message catalog as soon as possible, without having to wait for the app JS to be downloaded, parsed
 * and executed before making a request for the message catalog.
 */

import {CloudFrontRequest, CloudFrontResponse} from 'aws-lambda'
import {S3Client} from '@aws-sdk/client-s3'
import {Config} from '../config'
import {APP_VERSION_HEADER, getCookie, getHeader, setHeader} from '../utils'
import {fetchFileFromS3Bucket} from '../s3'

const TRANSLATION_VERSION_HEADER = 'X-Translation-Version'
const DEFAULT_LANGUAGE = 'en'
const LANG_QUERY_PARAM = 'lang'
const LANG_COOKIE_NAME = 'x-pleo-language'
const TRANSLATION_VERSION_COOKIE_NAME = 'translation-version'

const SUPPORTED_LANGUAGE_LIST = [
    'da',
    'sv',
    'en',
    'de',
    'de-AT',
    'es',
    'fr',
    'fr-BE',
    'fi',
    'nl',
    'nl-BE',
    'pt',
    'it',
    'no'
] as const

/**
 * Modifies the response object to enrich it with headers used to serve translations for the app.
 */
export function addTranslationInfoToResponse(
    response: CloudFrontResponse,
    request: CloudFrontRequest,
    config: Config
) {
    if (config.isLocalised !== 'true') {
        return response
    }

    const translationVersion = getHeader(request, TRANSLATION_VERSION_HEADER)
    const appVersion = getHeader(request, APP_VERSION_HEADER)

    let modifiedResponse = setTranslationVersionCookie(response, translationVersion)

    if (Boolean(translationVersion)) {
        modifiedResponse = addPreloadHeader({
            response: modifiedResponse,
            request,
            translationVersion,
            appVersion
        })
    }

    return modifiedResponse
}

/**
 * Modifies the pass request object to add the app and translation version on the request
 * object as custom headers. This allows the viewer-response lambda to pick up this information
 * and use it enrich the response.
 */
export function addTranslationInfoToRequest({
    request,
    translationVersion,
    config
}: {
    request: CloudFrontRequest
    translationVersion: string
    config: Config
}) {
    if (!config.isLocalised) {
        return
    }

    if (translationVersion) {
        request.headers = setHeader(request.headers, TRANSLATION_VERSION_HEADER, translationVersion)
    }
}

/**
 * Adds a cookie with the current translation version. This value is used by the app to request
 * the translation catalog (for any language other than the default language)
 */
export const setTranslationVersionCookie = (
    response: CloudFrontResponse,
    translationVersion: string
) => {
    let headers = response.headers

    headers = setHeader(
        headers,
        'Set-Cookie',
        `${TRANSLATION_VERSION_COOKIE_NAME}=${translationVersion}`,
        {merge: true}
    )

    return {...response, headers}
}

/**
 * Adds preload header for translation file to speed up rendering of the app. It's crucial to fetch the
 * translations file as soon as possible, since we can't render anything without the translated messages.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/preload and https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Link
 *
 * The file we ask the browser to pre-fetch is our best guess based on:
 * - the language query param sometimes set on redirects to the app - this takes precedence
 * - the language stored in a cookie, which we set whenever the user selects a language in the app
 * - falling back to the default language when none of the above is set
 *
 * Note that this guess is not guaranteed to be the file that the app will actually request to fetch.
 * In that case, we will have pre-fetched the wrong file and a second translation file will need to be
 * fetched. The app will still work, alas slower.
 */
export const addPreloadHeader = ({
    response,
    request,
    translationVersion,
    appVersion
}: {
    response: CloudFrontResponse
    request: CloudFrontRequest
    translationVersion: string
    appVersion: string
}) => {
    let headers = response.headers
    const urlParams = new URLSearchParams(request.querystring)

    const language =
        urlParams.get(LANG_QUERY_PARAM) ??
        getCookie(request.headers, LANG_COOKIE_NAME) ??
        DEFAULT_LANGUAGE

    // Make sure that the language in the URL parameter is supported
    const validatedLanguage = SUPPORTED_LANGUAGE_LIST.map((supportedLanguage) =>
        supportedLanguage.toLowerCase()
    ).includes(language.toLowerCase())
        ? language
        : DEFAULT_LANGUAGE

    // If the language guessed is the default language, instead of using the translation version,
    // we use the version of the app. The default language is deployed together with the app, and not
    // separately, so it follows the app versioning and the translations versioning.
    const hash = validatedLanguage === DEFAULT_LANGUAGE ? appVersion : translationVersion

    headers = setHeader(
        headers,
        'Link',
        `</static/translations/${validatedLanguage}/messages.${hash}.js>; rel="preload"; as="script"; crossorigin`
    )

    return {...response, headers}
}

/**
 * Get the latest translation cursor file from S3 bucket
 */
export const getTranslationVersion = async (s3: S3Client, config: Config) => {
    try {
        if (!config.isLocalised) {
            return
        }
        const response = await fetchFileFromS3Bucket(
            'translation-deploy/latest',
            config.originBucketName,
            s3
        )
        return response
    } catch (error) {
        console.error('getTranslationVersion failed', error)
        // We never want this function to throw to avoid the app failing on any issues with the translations
        // deployments. We return an empty translation version here, which means the app will fall back to the
        // default language (which uses the app version instead of the translations version)
        return undefined
    }
}
