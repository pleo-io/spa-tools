import crypto from 'crypto'
import {CloudFrontResponseEvent} from 'aws-lambda'
import {getHandler} from './viewer-response'

const originConfig = {
    originBucketName: 'test-cursor-bucket',
    originBucketRegion: 'eu-west-1'
}
const mockContext = {} as any
const mockCallback = () => {}

describe(`Viewer response Lambda@Edge`, () => {
    test(`
        When processing a response for the default branch
        Then it adds security custom header to the response
        And it adds cache control custom header to the response
    `, async () => {
        const event = mockResponseEvent({host: 'app.example.com'})

        const handler = getHandler(originConfig)
        const response = await handler(event, mockContext, mockCallback)

        expect(response).toEqual({
            headers: {
                ...securityHeaders,
                ...cacheControlHeaders,
                ...defaultHeaders
            },
            status: '200',
            statusDescription: 'OK'
        })
    })

    test(`
        When blocking robots is turned on
        Then it adds robots custom header to the response
    `, async () => {
        const event = mockResponseEvent({host: 'app.staging.example.com'})

        const handler = getHandler({
            ...originConfig,
            previewDeploymentPostfix: '.app.staging.example.com',
            blockRobots: 'true'
        })
        const response = await handler(event, mockContext, mockCallback)

        expect(response).toEqual({
            headers: {
                ...securityHeaders,
                ...defaultHeaders,
                ...cacheControlHeaders,
                'x-robots-tag': [{key: 'X-Robots-Tag', value: 'noindex, nofollow'}]
            },
            status: '200',
            statusDescription: 'OK'
        })
    })

    test(`
        When blocking iFrames is turned on
        Then it adds frame blocking custom header to the response
    `, async () => {
        const event = mockResponseEvent({host: 'app.staging.example.com'})

        const handler = getHandler({
            ...originConfig,
            previewDeploymentPostfix: '.app.example.com',
            blockIframes: 'true'
        })
        const response = await handler(event, mockContext, mockCallback)

        expect(response).toEqual({
            headers: {
                ...securityHeaders,
                'x-frame-options': [{key: 'X-Frame-Options', value: 'DENY'}],
                ...defaultHeaders,
                ...cacheControlHeaders
            },
            status: '200',
            statusDescription: 'OK'
        })
    })

    test(`
        When the translations addon is on
        And there is no language cookie or param
        Then it adds a preload header using the app version and default language
        And it adds a translation cookie using the translation version
    `, async () => {
        const appVersion = getRandomSha()
        const translationVersion = getRandomInt()
        const event = mockResponseEvent({
            host: 'app.staging.example.com',
            translations: {appVersion, translationVersion}
        })

        const handler = getHandler({
            ...originConfig,
            previewDeploymentPostfix: '.app.example.com',
            isLocalised: 'true'
        })
        const response = await handler(event, mockContext, mockCallback)

        expect(response).toEqual({
            headers: {
                ...securityHeaders,
                ...defaultHeaders,
                ...cacheControlHeaders,
                ...getTranslationHeaders({
                    cookieHash: translationVersion,
                    preloadHash: appVersion,
                    language: 'en'
                })
            },
            status: '200',
            statusDescription: 'OK'
        })
    })

    test(`
        When the translation module is off
        Then it does not add a preload header 
        And it does not add a translation cookie
    `, async () => {
        const event = mockResponseEvent({host: 'app.staging.example.com'})

        const handler = getHandler({
            ...originConfig,
            previewDeploymentPostfix: '.app.example.com',
            isLocalised: 'false'
        })
        const response = await handler(event, mockContext, mockCallback)

        expect(response).toEqual({
            headers: {
                ...securityHeaders,
                ...defaultHeaders,
                ...cacheControlHeaders
            },
            status: '200',
            statusDescription: 'OK'
        })
    })

    test(`
        When a custom language is set via a cookie
        Then it adds a preload header using the translation version
        And the custom language is used for the preload header
        And it adds a translation cookie using the translation version
    `, async () => {
        const appVersion = getRandomSha()
        const translationVersion = getRandomInt()
        const event = mockResponseEvent({
            host: 'app.staging.example.com',
            translations: {appVersion, translationVersion},
            languageForCookie: 'da'
        })

        const handler = getHandler({
            ...originConfig,
            previewDeploymentPostfix: '.app.example.com',
            isLocalised: 'true'
        })
        const response = await handler(event, mockContext, mockCallback)

        expect(response).toEqual({
            headers: {
                ...securityHeaders,
                ...defaultHeaders,
                ...cacheControlHeaders,
                ...getTranslationHeaders({
                    cookieHash: translationVersion,
                    preloadHash: translationVersion,
                    language: 'da'
                })
            },
            status: '200',
            statusDescription: 'OK'
        })
    })

    test(`
        When a default language is set via a cookie
        Then it adds a preload header using the app version
        And it adds a translation cookie using the translation version
    `, async () => {
        const appVersion = getRandomSha()
        const translationVersion = getRandomInt()
        const event = mockResponseEvent({
            host: 'app.staging.example.com',
            translations: {appVersion, translationVersion},
            languageForCookie: 'en'
        })

        const handler = getHandler({
            ...originConfig,
            previewDeploymentPostfix: '.app.example.com',
            isLocalised: 'true'
        })
        const response = await handler(event, mockContext, mockCallback)

        expect(response).toEqual({
            headers: {
                ...securityHeaders,
                ...defaultHeaders,
                ...cacheControlHeaders,
                ...getTranslationHeaders({
                    cookieHash: translationVersion,
                    preloadHash: appVersion,
                    language: 'en'
                })
            },
            status: '200',
            statusDescription: 'OK'
        })
    })

    test(`
        When a custom language is selected via a query parameter
        Then it adds a preload header for that language
    `, async () => {
        const appVersion = getRandomSha()
        const translationVersion = getRandomInt()
        const event = mockResponseEvent({
            host: 'app.staging.example.com',
            translations: {appVersion, translationVersion},
            languageForParam: 'da'
        })

        const handler = getHandler({
            ...originConfig,
            previewDeploymentPostfix: '.app.example.com',
            blockIframes: 'true',
            isLocalised: 'true'
        })
        const response = await handler(event, mockContext, mockCallback)

        expect(response).toEqual({
            headers: {
                ...securityHeaders,
                'x-frame-options': [{key: 'X-Frame-Options', value: 'DENY'}],
                ...defaultHeaders,
                ...cacheControlHeaders,
                ...getTranslationHeaders({
                    cookieHash: translationVersion,
                    preloadHash: translationVersion,
                    language: 'da'
                })
            },
            status: '200',
            statusDescription: 'OK'
        })
    })

    test(`
        When a custom language is selected via a query parameter
        And a custom language is selected via a cookie
        Then it adds a preload header for the query param language
    `, async () => {
        const appVersion = getRandomSha()
        const translationVersion = getRandomInt()
        const event = mockResponseEvent({
            host: 'app.staging.example.com',
            translations: {appVersion, translationVersion},
            languageForParam: 'da',
            languageForCookie: 'fr'
        })

        const handler = getHandler({
            ...originConfig,
            previewDeploymentPostfix: '.app.example.com',
            blockIframes: 'true',
            isLocalised: 'true'
        })
        const response = await handler(event, mockContext, mockCallback)

        expect(response).toEqual({
            headers: {
                ...securityHeaders,
                'x-frame-options': [{key: 'X-Frame-Options', value: 'DENY'}],
                ...defaultHeaders,
                ...cacheControlHeaders,
                ...getTranslationHeaders({
                    cookieHash: translationVersion,
                    preloadHash: translationVersion,
                    language: 'da'
                })
            },
            status: '200',
            statusDescription: 'OK'
        })
    })
})

const defaultHeaders = {
    'last-modified': [{key: 'Last-Modified', value: '2016-11-25'}],
    'x-amz-meta-last-modified': [{key: 'X-Amz-Meta-Last-Modified', value: '2016-01-01'}]
}

const securityHeaders = {
    'x-content-type-options': [{key: 'X-Content-Type-Options', value: 'nosniff'}],
    'referrer-policy': [{key: 'Referrer-Policy', value: 'same-origin'}],
    'x-xss-protection': [{key: 'X-XSS-Protection', value: '1; mode=block'}]
}

const cacheControlHeaders = {
    'cache-control': [
        {
            key: 'Cache-Control',
            value: 'max-age=0,no-cache,no-store,must-revalidate'
        }
    ]
}

const getTranslationHeaders = ({
    cookieHash,
    preloadHash,
    language
}: {
    cookieHash: string
    preloadHash: string
    language: string
}) => {
    return {
        'set-cookie': [
            {
                key: 'Set-Cookie',
                value: `translation-version=${cookieHash}`
            }
        ],
        link: Boolean(preloadHash)
            ? [
                  {
                      key: 'Link',
                      value: `</static/translations/${language}/messages.${preloadHash}.js>; rel="preload"; as="script"; crossorigin`
                  }
              ]
            : undefined
    }
}

/**
 * Returns a mock Cloudfront viewer response event with the specified host and URI
 * For more info on the shape of the response events for Edge Lambdas
 * @see https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-event-structure.html#lambda-event-structure-response-viewer
 */
export const mockResponseEvent = ({
    host,
    translations,
    uri = '/',
    languageForCookie,
    languageForParam
}: {
    host: string
    translations?: {
        appVersion: string
        translationVersion?: string
    }
    uri?: string
    languageForCookie?: string
    languageForParam?: string
}): CloudFrontResponseEvent => ({
    Records: [
        {
            cf: {
                config: {
                    distributionDomainName: 'd111111abcdef8.cloudfront.net',
                    distributionId: 'EDFDVBD6EXAMPLE',
                    eventType: 'viewer-response' as const,
                    requestId: '4TyzHTaYWb1GX1qTfsHhEqV6HUDd_BzoBZnwfnvQc_1oF26ClkoUSEQ=='
                },
                request: {
                    uri,
                    headers: {
                        host: [
                            {
                                key: 'Host',
                                value: host
                            }
                        ],
                        ...(translations
                            ? {
                                  'x-translation-version': [
                                      {
                                          key: 'X-Translation-Version',
                                          value: translations.translationVersion
                                      }
                                  ],
                                  'x-app-version': [
                                      {
                                          key: 'X-App-Version',
                                          value: translations.appVersion
                                      }
                                  ]
                              }
                            : {}),
                        cookie: languageForCookie
                            ? [
                                  {
                                      key: 'Cookie',
                                      value: `x-pleo-language=${languageForCookie}`
                                  }
                              ]
                            : undefined
                    },
                    querystring: languageForParam ? `?lang=${languageForParam}` : '',
                    clientIp: '203.0.113.178',
                    method: 'GET'
                },
                response: {
                    status: '200',
                    statusDescription: 'OK',
                    headers: defaultHeaders
                }
            }
        }
    ]
})

const getRandomSha = () => crypto.randomBytes(20).toString('hex')
const getRandomInt = () => crypto.randomInt(100000, 199999).toString()
