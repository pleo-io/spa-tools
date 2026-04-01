import crypto from 'crypto'
import {CloudFrontResponse, CloudFrontResponseEvent} from 'aws-lambda'
import {getHandler} from './viewer-response'

const originConfig = {
    originBucketName: 'test-cursor-bucket',
    originBucketRegion: 'eu-west-1'
}
const mockContext = {} as any
const mockCallback = () => {}

describe(`Viewer response Lambda@Edge`, () => {
    test(`
        When the translation module is off
        Then it does not add a preload header
        And it does not add a translation cookie
    `, async () => {
        const appVersion = getRandomSha()
        const event = mockResponseEvent({host: 'app.staging.example.com', appVersion})

        const handler = getHandler({
            ...originConfig,
            previewDeploymentPostfix: '.app.example.com'
        })
        const response = await handler(event, mockContext, mockCallback)

        expect(response).toEqual({
            headers: defaultHeaders(appVersion),
            status: '200',
            statusDescription: 'OK'
        })
    })

    test(`
        When the request has an X-Partner-Slug header
        Then it adds a Link preload header and X-Partner-Theme header to the response
        And it strips the X-Partner-Slug header from the response
    `, async () => {
        const appVersion = getRandomSha()
        const event = mockResponseEvent({
            host: 'xero.app.example.com',
            appVersion,
            partnerSlug: 'xero'
        })

        const handler = getHandler({...originConfig})
        const response = await handler(event, mockContext, mockCallback) as CloudFrontResponse

        expect(response.headers['link']).toEqual([
            {key: 'Link', value: '</static/partner-themes/xero.css>; rel=preload; as=style'}
        ])
        expect(response.headers['x-partner-theme']).toEqual([
            {key: 'X-Partner-Theme', value: 'xero'}
        ])
        expect(response.headers['x-partner-slug']).toBeUndefined()
    })

    test(`
        When the request has no X-Partner-Slug header
        Then it does not add partner theme headers to the response
    `, async () => {
        const appVersion = getRandomSha()
        const event = mockResponseEvent({host: 'app.example.com', appVersion})

        const handler = getHandler({...originConfig})
        const response = await handler(event, mockContext, mockCallback) as CloudFrontResponse

        expect(response.headers['link']).toBeUndefined()
        expect(response.headers['x-partner-theme']).toBeUndefined()
    })
})

const defaultHeaders = (appVersion: string) => ({
    'last-modified': [{key: 'Last-Modified', value: '2016-11-25'}],
    'x-amz-meta-last-modified': [{key: 'X-Amz-Meta-Last-Modified', value: '2016-01-01'}],
    'x-pleo-spa-version': [{key: 'X-Pleo-SPA-Version', value: appVersion}]
})
/**
 * Returns a mock Cloudfront viewer response event with the specified host and URI
 * For more info on the shape of the response events for Edge Lambdas
 * @see https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-event-structure.html#lambda-event-structure-response-viewer
 */
export const mockResponseEvent = ({
    host,
    appVersion,
    uri = '/',
    languageForCookie,
    languageForParam,
    partnerSlug
}: {
    host: string
    appVersion: string
    uri?: string
    languageForCookie?: string
    languageForParam?: string
    partnerSlug?: string
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
                        'x-pleo-spa-version': [
                            {
                                key: 'X-Pleo-SPA-Version',
                                value: appVersion
                            }
                        ],
                        cookie: languageForCookie
                            ? [
                                  {
                                      key: 'Cookie',
                                      value: `x-pleo-language=${languageForCookie}`
                                  }
                              ]
                            : undefined,
                        'x-partner-slug': partnerSlug
                            ? [
                                  {
                                      key: 'X-Partner-Slug',
                                      value: partnerSlug
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
                    headers: defaultHeaders(appVersion)
                }
            }
        }
    ]
})

const getRandomSha = () => crypto.randomBytes(20).toString('hex')
const getRandomInt = () => crypto.randomInt(100000, 199999).toString()
