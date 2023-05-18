import crypto from 'crypto'
import {CloudFrontRequestEvent} from 'aws-lambda'
import {getHandler} from './viewer-request'
import {fetchFileFromS3Bucket} from '../s3'
import {S3Client} from '@aws-sdk/client-s3'

jest.mock('../s3')
jest.mock('@aws-sdk/client-s3')

const mockedFetchFileFromS3Bucket = jest.mocked(fetchFileFromS3Bucket)
const mockS3 = new S3Client({})

beforeEach(() => {
    jest.resetAllMocks()
})

const originConfig = {
    originBucketName: 'test-origin-bucket',
    originBucketRegion: 'eu-west-1'
}
const mockContext = {} as any
const mockCallback = () => {}

describe(`Viewer request Lambda@Edge`, () => {
    test(`
        When requesting app.example.com
        Then the request is modified to fetch the latest master branch HTML
    `, async () => {
        const appVersion = getRandomSha()
        const host = 'app.example.com'
        const event = mockRequestEvent({host, appVersion})
        mockedFetchFileFromS3Bucket.mockResolvedValue(appVersion)

        const handler = getHandler({...originConfig}, mockS3)
        const request = await handler(event, mockContext, mockCallback)

        expectAppVersionFetched('deploys/master')
        const expectedEvent = mockRequestEvent({
            host,
            uri: `/html/${appVersion}/index.html`,
            appVersion
        })
        expect(request).toEqual(requestFromEvent(expectedEvent))
    })

    test(`
        When requesting app.example.com
        And a custom default branch name is configured
        Then it modifies the request to fetch the latest default branch HTML
    `, async () => {
        const appVersion = getRandomSha()
        const host = 'app.example.com'
        const event = mockRequestEvent({host, appVersion})
        mockedFetchFileFromS3Bucket.mockResolvedValue(appVersion)

        const handler = getHandler({...originConfig, defaultBranchName: 'main'}, mockS3)
        const request = await handler(event, mockContext, mockCallback)

        expectAppVersionFetched('deploys/main')
        const expectedEvent = mockRequestEvent({
            host,
            uri: `/html/${appVersion}/index.html`,
            appVersion
        })
        expect(request).toEqual(requestFromEvent(expectedEvent))
    })

    test(`
        When requesting app.staging.example.com
        And preview deployment postfix is set
        Then it modifies the request to fetch the latest default branch HTML
    `, async () => {
        const appVersion = getRandomSha()
        const host = 'app.staging.example.com'
        const handler = getHandler(
            {...originConfig, previewDeploymentPostfix: '.app.staging.example.com'},
            mockS3
        )
        const event = mockRequestEvent({host, appVersion})
        mockedFetchFileFromS3Bucket.mockResolvedValue(appVersion)

        const request = await handler(event, mockContext, mockCallback)

        expectAppVersionFetched('deploys/master')
        const expectedEvent = mockRequestEvent({
            host,
            uri: `/html/${appVersion}/index.html`,
            appVersion
        })
        expect(request).toEqual(requestFromEvent(expectedEvent))
    })

    test(`
        When requesting e.g. my-feature.app.staging.example.com
        it modifies the request to fetch the latest HTML for my-feature branch
    `, async () => {
        const appVersion = getRandomSha()
        const host = 'my-feature.app.staging.example.com'
        const event = mockRequestEvent({host, appVersion})
        mockedFetchFileFromS3Bucket.mockResolvedValue(appVersion)

        const handler = getHandler(
            {...originConfig, previewDeploymentPostfix: '.app.staging.example.com'},
            mockS3
        )
        const request = await handler(event, mockContext, mockCallback)

        expectAppVersionFetched('deploys/my-feature')
        const expectedEvent = mockRequestEvent({
            host,
            uri: `/html/${appVersion}/index.html`,
            appVersion
        })
        expect(request).toEqual(requestFromEvent(expectedEvent))
    })

    test(`Handles requests for specific html files`, async () => {
        const appVersion = getRandomSha()
        const host = 'my-feature.app.staging.example.com'
        const event = mockRequestEvent({host, uri: '/iframe.html', appVersion})
        mockedFetchFileFromS3Bucket.mockResolvedValue(appVersion)

        const handler = getHandler(
            {...originConfig, previewDeploymentPostfix: '.app.staging.example.com'},
            mockS3
        )
        const request = await handler(event, mockContext, mockCallback)

        expectAppVersionFetched('deploys/my-feature')
        const expectedEvent = mockRequestEvent({
            host,
            uri: `/html/${appVersion}/iframe.html`,
            appVersion
        })
        expect(request).toEqual(requestFromEvent(expectedEvent))
    })

    test(`Handles requests for well known files`, async () => {
        const appVersion = getRandomSha()
        const host = 'my-feature.app.staging.example.com'
        const event = mockRequestEvent({
            host,
            uri: '/.well-known/apple-app-site-association',
            appVersion
        })
        mockedFetchFileFromS3Bucket.mockResolvedValue(appVersion)

        const handler = getHandler(
            {
                ...originConfig,
                previewDeploymentPostfix: '.app.staging.example.com'
            },
            mockS3
        )
        const request = await handler(event, mockContext, mockCallback)

        expectAppVersionFetched('deploys/my-feature')
        const expectedEvent = mockRequestEvent({
            host,
            uri: `/html/${appVersion}/.well-known/apple-app-site-association`,
            appVersion
        })
        expect(request).toEqual(requestFromEvent(expectedEvent))
    })

    test(`
        When requesting a specific version i.e. preview-{appVersion}.app.staging.example.com
        it modifies the request to fetch the HTML for that app version
    `, async () => {
        const appVersion = getRandomSha()
        const requestedAppVersion = getRandomSha()
        const host = `preview-${requestedAppVersion}.app.staging.example.com`
        const event = mockRequestEvent({host, appVersion})
        mockedFetchFileFromS3Bucket.mockResolvedValue(appVersion)

        const handler = getHandler(
            {...originConfig, previewDeploymentPostfix: '.app.staging.example.com'},
            mockS3
        )
        const request = await handler(event, mockContext, mockCallback)

        expect(mockedFetchFileFromS3Bucket).not.toHaveBeenCalled()
        const expectedEvent = mockRequestEvent({
            host,
            uri: `/html/${requestedAppVersion}/index.html`,
            appVersion: requestedAppVersion
        })
        expect(request).toEqual(requestFromEvent(expectedEvent))
    })

    test(`
        When using the translation addon
        Then it fetches the translation version from S3
        And the translation version is set as a header on request
        And the app version is set as a header on request
    `, async () => {
        const appVersion = getRandomSha()
        const translationVersion = getRandomInt()
        const host = 'app.example.com'
        const event = mockRequestEvent({host, appVersion})

        mockedFetchFileFromS3Bucket.mockResolvedValueOnce(appVersion)
        mockedFetchFileFromS3Bucket.mockResolvedValueOnce(translationVersion)

        const handler = getHandler({...originConfig, isLocalised: 'true'}, mockS3)
        const request = await handler(event, mockContext, mockCallback)

        expectVersionsFetched('deploys/master', 'translation-deploy/latest')
        const expectedEvent = mockRequestEvent({
            host,
            translationVersion,
            appVersion,
            uri: `/html/${appVersion}/index.html`
        })
        expect(request).toEqual(requestFromEvent(expectedEvent))
    })

    test(`
        When fetching the translation version fails
        Then the translation version header is not set
        And the app version header is set
        And the request for the HTML goes through
    `, async () => {
        const appVersion = getRandomSha()
        const host = 'app.example.com'
        const event = mockRequestEvent({host, appVersion})
        jest.spyOn(console, 'error').mockImplementationOnce(() => {})

        mockedFetchFileFromS3Bucket.mockResolvedValueOnce(appVersion)
        mockedFetchFileFromS3Bucket.mockRejectedValueOnce(new Error('nope'))

        const handler = getHandler({...originConfig, isLocalised: 'true'}, mockS3)
        const request = await handler(event, mockContext, mockCallback)

        expectVersionsFetched('deploys/master', 'translation-deploy/latest')
        const expectedEvent = mockRequestEvent({
            host,
            translationVersion: undefined,
            appVersion,
            uri: `/html/${appVersion}/index.html`
        })
        expect(request).toEqual(requestFromEvent(expectedEvent))
        expect(console.error).toHaveBeenCalledTimes(1)
    })

    test(`
        When requesting a preview of an unknown branch,
        Then it requests the non-existing file to trigger a 404 error
    `, async () => {
        const host = 'what-is-this-branch.app.staging.example.com'
        jest.spyOn(console, 'error').mockImplementationOnce(() => {})
        const event = mockRequestEvent({host, appVersion: 'unknown'})

        mockedFetchFileFromS3Bucket.mockRejectedValueOnce(
            new Error(
                `Empty response from S3 for deploys/what-is-this-branch in ${originConfig.originBucketName} bucket`
            )
        )

        const handler = getHandler(
            {...originConfig, previewDeploymentPostfix: '.app.staging.example.com'},
            mockS3
        )
        const request = await handler(event, mockContext, mockCallback)

        expectAppVersionFetched('deploys/what-is-this-branch')
        const expectedEvent = mockRequestEvent({host, uri: `/404`, appVersion: 'unknown'})
        expect(request).toEqual(requestFromEvent(expectedEvent))
        expect(console.error).toHaveBeenCalledTimes(1)
    })
})

/**
 * Returns a mock Cloudfront viewer request event with the specified host and URI.
 * For more info on the shape of the request events for Edge Lambdas
 * @see https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-event-structure.html#example-viewer-request
 */
const mockRequestEvent = ({
    host,
    translationVersion,
    appVersion,
    uri = '/'
}: {
    host: string
    appVersion: string
    translationVersion?: string
    uri?: string
}): CloudFrontRequestEvent => ({
    Records: [
        {
            cf: {
                config: {
                    distributionDomainName: 'd111111abcdef8.cloudfront.net',
                    distributionId: 'EDFDVBD6EXAMPLE',
                    eventType: 'viewer-request' as const,
                    requestId: '4TyzHTaYWb1GX1qTfsHhEqV6HUDd_BzoBZnwfnvQc_1oF26ClkoUSEQ=='
                },
                request: {
                    clientIp: '203.0.113.178',
                    headers: {
                        host: [
                            {
                                key: 'Host',
                                value: host
                            }
                        ],
                        'user-agent': [
                            {
                                key: 'User-Agent',
                                value: 'curl/7.66.0'
                            }
                        ],
                        accept: [
                            {
                                key: 'accept',
                                value: '*/*'
                            }
                        ],
                        'x-translation-version': translationVersion
                            ? [
                                  {
                                      key: 'X-Translation-Version',
                                      value: translationVersion
                                  }
                              ]
                            : undefined,
                        'x-pleo-spa-version': appVersion
                            ? [
                                  {
                                      key: 'X-Pleo-SPA-Version',
                                      value: appVersion
                                  }
                              ]
                            : undefined
                    },
                    method: 'GET',
                    querystring: '',
                    uri
                }
            }
        }
    ]
})

const requestFromEvent = (event: CloudFrontRequestEvent) => event.Records[0].cf.request
const getRandomSha = () => crypto.randomBytes(20).toString('hex')
const getRandomInt = () => crypto.randomInt(100000, 199999).toString()

function expectAppVersionFetched(key: string) {
    expect(mockedFetchFileFromS3Bucket).toHaveBeenCalledTimes(1)
    expect(mockedFetchFileFromS3Bucket).toHaveBeenCalledWith(
        key,
        originConfig.originBucketName,
        mockS3
    )
}

function expectVersionsFetched(appKey: string, translationKey: string) {
    expect(mockedFetchFileFromS3Bucket).toHaveBeenCalledTimes(2)
    expect(mockedFetchFileFromS3Bucket).toHaveBeenCalledWith(
        appKey,
        originConfig.originBucketName,
        mockS3
    )
    expect(mockedFetchFileFromS3Bucket).toHaveBeenLastCalledWith(
        translationKey,
        originConfig.originBucketName,
        mockS3
    )
}
