import {CloudFrontResponseHandler} from 'aws-lambda'
import {Config} from '../config'
import {addTranslationInfoToResponse} from '../addons/translations'
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

        response = addTranslationInfoToResponse(response, request, config)

        return response
    }
    return handler
}
