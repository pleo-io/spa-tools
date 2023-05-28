import {CloudFrontRequest, CloudFrontResponse, CloudFrontResponseHandler} from 'aws-lambda'
import {Config} from '../config'
import {addTranslationInfoToResponse} from '../addons/translations'
import {APP_VERSION_HEADER, getHeader, setHeader} from '../utils'
/**
 * Edge Lambda handler triggered on "viewer-response" event, on the default CF behavior of the web app CF distribution.
 * The default CF behaviour only handles requests for HTML documents and requests for static files (e.g. /, /bills, /settings/accounting etc.)
 *
 * This lambda runs for every request and modifies the response object just before the fetched resource is returned to the user's browser.
 * It's currently used to add various HTTP headers to the responses.
 *
 * We're going via a getHandler method to aid testing with dependency injection
 */
export function getHandler(config: Config) {
    const handler: CloudFrontResponseHandler = async (event) => {
        let response = event.Records[0].cf.response
        const request = event.Records[0].cf.request

        response = addVersionHeader(response, request)
        response = addTranslationInfoToResponse(response, request, config)

        return response
    }
    return handler
}

// Add a custom version header to the response (used e.g. for checking for new SPA versions)
// Version is retrieved from a header set on request by the viewer-request lambda
export function addVersionHeader(response: CloudFrontResponse, request: CloudFrontRequest) {
    const appVersion = getHeader(request, APP_VERSION_HEADER)
    let headers = setHeader(response.headers, APP_VERSION_HEADER, appVersion)
    return {...response, headers}
}
