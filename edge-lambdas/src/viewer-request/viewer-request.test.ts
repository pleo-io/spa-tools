import crypto from 'crypto'
import {CloudFrontRequestEvent} from 'aws-lambda'
import S3 from 'aws-sdk/clients/s3'
import {getHandler} from './viewer-request'

jest.mock('aws-sdk/clients/s3', () => jest.fn().mockReturnValue({getObject: jest.fn()}))

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
        const s3 = getMockedS3(appVersion)
        const event = mockRequestEvent({host})

        const handler = getHandler({...originConfig}, s3)
        const request = await handler(event, mockContext, mockCallback)

        expectAppVersionFetched(s3, 'deploys/master')
        const expectedEvent = mockRequestEvent({host, uri: `/html/${appVersion}/index.html`})
        expect(request).toEqual(requestFromEvent(expectedEvent))
    })

    test(`
        When requesting app.example.com
        And a custom default branch name is configured
        Then it modifies the request to fetch the latest default branch HTML
    `, async () => {
        const appVersion = getRandomSha()
        const host = 'app.example.com'
        const s3 = getMockedS3(appVersion)
        const event = mockRequestEvent({host})

        const handler = getHandler({...originConfig, defaultBranchName: 'main'}, s3)
        const request = await handler(event, mockContext, mockCallback)

        expectAppVersionFetched(s3, 'deploys/main')
        const expectedEvent = mockRequestEvent({host, uri: `/html/${appVersion}/index.html`})
        expect(request).toEqual(requestFromEvent(expectedEvent))
    })

    test(`
        When requesting app.staging.example.com
        And preview deployment postfix is set
        Then it modifies the request to fetch the latest default branch HTML
    `, async () => {
        const appVersion = getRandomSha()
        const s3 = getMockedS3(appVersion)
        const host = 'app.staging.example.com'
        const handler = getHandler(
            {...originConfig, previewDeploymentPostfix: '.app.staging.example.com'},
            s3
        )
        const event = mockRequestEvent({host})

        const request = await handler(event, mockContext, mockCallback)

        expectAppVersionFetched(s3, 'deploys/master')
        const expectedEvent = mockRequestEvent({host, uri: `/html/${appVersion}/index.html`})
        expect(request).toEqual(requestFromEvent(expectedEvent))
    })

    test(`
        When requesting e.g. my-feature.app.staging.example.com
        it modifies the request to fetch the latest HTML for my-feature branch
    `, async () => {
        const appVersion = getRandomSha()
        const s3 = getMockedS3(appVersion)
        const host = 'my-feature.app.staging.example.com'
        const event = mockRequestEvent({host})

        const handler = getHandler(
            {...originConfig, previewDeploymentPostfix: '.app.staging.example.com'},
            s3
        )
        const request = await handler(event, mockContext, mockCallback)

        expectAppVersionFetched(s3, 'deploys/my-feature')
        const expectedEvent = mockRequestEvent({host, uri: `/html/${appVersion}/index.html`})
        expect(request).toEqual(requestFromEvent(expectedEvent))
    })

    test(`Handles requests for specific html files`, async () => {
        const appVersion = getRandomSha()
        const s3 = getMockedS3(appVersion)
        const host = 'my-feature.app.staging.example.com'
        const event = mockRequestEvent({host, uri: '/iframe.html'})

        const handler = getHandler(
            {...originConfig, previewDeploymentPostfix: '.app.staging.example.com'},
            s3
        )
        const request = await handler(event, mockContext, mockCallback)

        expectAppVersionFetched(s3, 'deploys/my-feature')
        const expectedEvent = mockRequestEvent({host, uri: `/html/${appVersion}/iframe.html`})
        expect(request).toEqual(requestFromEvent(expectedEvent))
    })

    test(`Handles requests for well known files`, async () => {
        const appVersion = getRandomSha()
        const host = 'my-feature.app.staging.example.com'
        const s3 = getMockedS3(appVersion)
        const event = mockRequestEvent({host, uri: '/.well-known/apple-app-site-association'})

        const handler = getHandler(
            {...originConfig, previewDeploymentPostfix: '.app.staging.example.com'},
            s3
        )
        const request = await handler(event, mockContext, mockCallback)

        expectAppVersionFetched(s3, 'deploys/my-feature')
        const expectedEvent = mockRequestEvent({
            host,
            uri: `/html/${appVersion}/.well-known/apple-app-site-association`
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
        const s3 = getMockedS3(appVersion)
        const event = mockRequestEvent({host})

        const handler = getHandler(
            {...originConfig, previewDeploymentPostfix: '.app.staging.example.com'},
            s3
        )
        const request = await handler(event, mockContext, mockCallback)

        expect(s3.getObject).not.toHaveBeenCalled()
        const expectedEvent = mockRequestEvent({
            host,
            uri: `/html/${requestedAppVersion}/index.html`
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
        const s3 = getMockedS3(appVersion, translationVersion)
        const event = mockRequestEvent({host})

        const handler = getHandler({...originConfig, isLocalised: 'true'}, s3)
        const request = await handler(event, mockContext, mockCallback)

        expectVersionsFetched(s3, 'deploys/master', 'translation-deploy/latest')
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
        const s3 = getMockedS3(appVersion, new Error('network error, yo'))
        const event = mockRequestEvent({host})
        jest.spyOn(console, 'error').mockImplementationOnce(() => {})

        const handler = getHandler({...originConfig, isLocalised: 'true'}, s3)
        const request = await handler(event, mockContext, mockCallback)

        expectVersionsFetched(s3, 'deploys/master', 'translation-deploy/latest')
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
        const s3 = getMockedS3(new Error('network error, yo'))
        const host = 'what-is-this-branch.app.staging.example.com'
        jest.spyOn(console, 'error').mockImplementationOnce(() => {})
        const event = mockRequestEvent({host})

        const handler = getHandler(
            {...originConfig, previewDeploymentPostfix: '.app.staging.example.com'},
            s3
        )
        const request = await handler(event, mockContext, mockCallback)

        expectAppVersionFetched(s3, 'deploys/what-is-this-branch')
        const expectedEvent = mockRequestEvent({host, uri: `/404`})
        expect(request).toEqual(requestFromEvent(expectedEvent))
        expect(console.error).toHaveBeenCalledTimes(1)
    })
})

const getMockedS3 = (...values: Array<string | Error>) => {
    const MockedS3 = S3 as jest.MockedClass<typeof S3>
    const s3 = new MockedS3()
    const mockedPromise = jest.fn()
    values.forEach((value) => {
        if (value instanceof Error) {
            mockedPromise.mockReturnValueOnce(value)
        } else {
            mockedPromise.mockReturnValueOnce({Body: value})
        }
    })
    s3.getObject = jest.fn().mockReturnValue({promise: mockedPromise})
    return s3
}

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
    appVersion?: string
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
                        'x-app-version': appVersion
                            ? [
                                  {
                                      key: 'X-App-Version',
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

function expectAppVersionFetched(s3: S3, key: string) {
    expect(s3.getObject).toHaveBeenCalledTimes(1)
    expect(s3.getObject).toHaveBeenCalledWith({
        Bucket: originConfig.originBucketName,
        Key: key
    })
}

function expectVersionsFetched(s3: S3, appKey: string, translationKey: string) {
    expect(s3.getObject).toHaveBeenCalledTimes(2)
    expect(s3.getObject).toHaveBeenCalledWith({
        Bucket: 'test-origin-bucket',
        Key: appKey
    })
    expect(s3.getObject).toHaveBeenLastCalledWith({
        Bucket: 'test-origin-bucket',
        Key: translationKey
    })
}
