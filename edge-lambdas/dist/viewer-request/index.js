/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __nccwpck_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__nccwpck_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__nccwpck_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__nccwpck_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__nccwpck_require__.o(definition, key) && !__nccwpck_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__nccwpck_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__nccwpck_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// ESM COMPAT FLAG
__nccwpck_require__.r(__webpack_exports__);

// EXPORTS
__nccwpck_require__.d(__webpack_exports__, {
  "handler": () => (/* binding */ handler)
});

;// CONCATENATED MODULE: external "https"
const external_https_namespaceObject = require("https");
;// CONCATENATED MODULE: external "aws-sdk/clients/s3"
const s3_namespaceObject = require("aws-sdk/clients/s3");
var s3_default = /*#__PURE__*/__nccwpck_require__.n(s3_namespaceObject);
;// CONCATENATED MODULE: external "fs"
const external_fs_namespaceObject = require("fs");
;// CONCATENATED MODULE: ./src/config.ts

/**
 * Retrieve config from a JSON config file. Since we can't use Lambda environment variables
 * we upload a JSON file containing env-specific configuration together with the lambda source file
 *
 * @returns The configuration object loaded from the file
 */
function getConfig() {
    return JSON.parse((0,external_fs_namespaceObject.readFileSync)('./config.json', { encoding: 'utf8' }));
}

;// CONCATENATED MODULE: external "path"
const external_path_namespaceObject = require("path");
;// CONCATENATED MODULE: ./src/utils.ts
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Appends a custom header to a passed CloudFront header map
 * @param headers - CloudFront headers map
 * @param headerName - Custom header name
 * @param headerValue - Custom header value
 * @param options.merge - Should the current header value be merged with the new one (e.g. for cookies)
 * @returns A new, modified CloudFront header maps
 */
function utils_setHeader(headers, headerName, headerValue, options = {}) {
    var _a;
    const headerKey = headerName.toLowerCase();
    const previousHeader = options.merge ? (_a = headers[headerKey]) !== null && _a !== void 0 ? _a : [] : [];
    return Object.assign(Object.assign({}, headers), { [headerKey]: [...previousHeader, { key: headerName, value: headerValue }] });
}
/**
 * Retrieve a header value (first if multiple values set) for a passed CloudFront request
 * @param request - CloudFront request
 * @param headerName - Header name to retrieve
 * @returns The first found value of the specified header, if available
 */
function utils_getHeader(request, headerName) {
    var _a, _b, _c;
    return (_c = (_b = (_a = request.headers) === null || _a === void 0 ? void 0 : _a[headerName.toLowerCase()]) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.value;
}
/**
 * Extract the value of a specific cookie from CloudFront headers map, if present
 * @param headers - CloudFront headers map
 * @param cookieName - The key of the cookie to extract the value for
 * @returns The string value of the cookie if present, otherwise null
 */
function utils_getCookie(headers, cookieName) {
    const cookieHeader = headers.cookie;
    if (!cookieHeader) {
        return null;
    }
    for (const cookieSet of cookieHeader) {
        const cookies = cookieSet.value.split(/; /);
        for (const cookie of cookies) {
            const cookieKeyValue = cookie.split('=');
            if (cookieKeyValue[0] === cookieName) {
                return cookieKeyValue[1];
            }
        }
    }
    return null;
}
/**
 * Fetches a file from the S3 origin bucket and returns its content
 * @param key key for the S3 bucket
 * @param bucket name of the S3 bucket
 * @param s3 S3 instance
 * @returns content of the file
 */
function fetchFileFromS3Bucket(key, bucket, s3) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield s3.getObject({ Bucket: bucket, Key: key }).promise();
        if (!response.Body) {
            throw new Error(`Empty response from S3 for ${key} in ${bucket} bucket`);
        }
        return response.Body.toString('utf-8').trim();
    });
}

;// CONCATENATED MODULE: ./src/addons/translations.ts
/**
 * This addon adds the translations functionality to the SPA served. It uses a secondary cursor deployment.
 * The latest version of translations is fetched when the HTML requested by the browser (at the same time as
 * the latest version of the app is served). Then that version is returned together with the HTML response
 * via a cookie header.
 * Additionally, to improve performance, a preload link header is added to the HTML response to trigger fetching
 * of the message catalog as soon as possible, without having to wait for the app JS to be downloaded, parsed
 * and executed before making a request for the message catalog.
 */
var translations_awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

const TRANSLATION_VERSION_HEADER = 'X-Translation-Version';
const APP_VERSION_HEADER = 'X-App-Version';
const DEFAULT_LANGUAGE = 'en';
const LANG_QUERY_PARAM = 'lang';
const LANG_COOKIE_NAME = 'x-pleo-language';
const TRANSLATION_VERSION_COOKIE_NAME = 'translation-version';
/**
 * Modifies the response object to enrich it with headers used to serve translations for the app.
 */
function addTranslationInfoToResponse(response, request, config) {
    if (config.isLocalised !== 'true') {
        return response;
    }
    const translationVersion = getHeader(request, TRANSLATION_VERSION_HEADER);
    const appVersion = getHeader(request, APP_VERSION_HEADER);
    let modifiedResponse = setTranslationVersionCookie(response, translationVersion);
    if (Boolean(translationVersion)) {
        modifiedResponse = addPreloadHeader({
            response: modifiedResponse,
            request,
            translationVersion,
            appVersion
        });
    }
    return modifiedResponse;
}
/**
 * Modifies the pass request object to add the app and translation version on the request
 * object as custom headers. This allows the viewer-response lambda to pick up this information
 * and use it enrich the response.
 */
function addTranslationInfoToRequest({ request, translationVersion, appVersion, config }) {
    if (!config.isLocalised) {
        return;
    }
    if (translationVersion) {
        request.headers = utils_setHeader(request.headers, TRANSLATION_VERSION_HEADER, translationVersion);
    }
    request.headers = utils_setHeader(request.headers, APP_VERSION_HEADER, appVersion);
}
/**
 * Adds a cookie with the current translation version. This value is used by the app to request
 * the translation catalog (for any language other than the default language)
 */
const setTranslationVersionCookie = (response, translationVersion) => {
    let headers = response.headers;
    headers = setHeader(headers, 'Set-Cookie', `${TRANSLATION_VERSION_COOKIE_NAME}=${translationVersion}`, { merge: true });
    return Object.assign(Object.assign({}, response), { headers });
};
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
const addPreloadHeader = ({ response, request, translationVersion, appVersion }) => {
    var _a, _b;
    let headers = response.headers;
    const urlParams = new URLSearchParams(request.querystring);
    const language = (_b = (_a = urlParams.get(LANG_QUERY_PARAM)) !== null && _a !== void 0 ? _a : getCookie(request.headers, LANG_COOKIE_NAME)) !== null && _b !== void 0 ? _b : DEFAULT_LANGUAGE;
    // If the language guessed is the default language, instead of using the translation version,
    // we use the version of the app. The default language is deployed together with the app, and not
    // separately, so it follows the app versioning and the translations versioning.
    const hash = language === DEFAULT_LANGUAGE ? appVersion : translationVersion;
    headers = setHeader(headers, 'Link', `</static/translations/${language}/messages.${hash}.js>; rel="preload"; as="script"; crossorigin`);
    return Object.assign(Object.assign({}, response), { headers });
};
/**
 * Get the latest translation cursor file from S3 bucket
 */
const getTranslationVersion = (s3, config) => translations_awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!config.isLocalised) {
            return;
        }
        const response = yield fetchFileFromS3Bucket('translation-deploy/latest', config.originBucketName, s3);
        return response;
    }
    catch (error) {
        console.error('getTranslationVersion failed', error);
        // We never want this function to throw to avoid the app failing on any issues with the translations
        // deployments. We return an empty translation version here, which means the app will fall back to the
        // default language (which uses the app version instead of the translations version)
        return undefined;
    }
});

;// CONCATENATED MODULE: ./src/viewer-request/viewer-request.ts
var viewer_request_awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



const DEFAULT_BRANCH_DEFAULT_NAME = 'master';
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
 *   e.g. app.staging.example.com and app.example.com
 * - HTML for latest app version on a feature branch (branch preview deployment)
 *   e.g. my-branch.staging.example.com
 * - HTML for a specific app version (hash preview deployment)
 *   e.g. preview-b104213fc39ecca4f237a7bd6544d428ad46ec7e.app.staging.example.com
 *
 * If the translations are enabled via configuration, this lambda will also fetch the current translation
 * version from S3 and pass it to the response lambda via custom headers on the request object.
 */
function getHandler(config, s3) {
    const handler = (event) => viewer_request_awaiter(this, void 0, void 0, function* () {
        const request = event.Records[0].cf.request;
        try {
            // Get app version and translation version in parallel to avoid the double network penalty.
            // Translation hash is only fetched if translations are enabled. Fetching translation cursor
            // can never throw here, as in case of a failure we're returning a default value.
            const [appVersion, translationVersion] = yield Promise.all([
                getAppVersion(request, config, s3),
                getTranslationVersion(s3, config)
            ]);
            // If needed, pass the versions to the viewer response lambda via custom headers on the request
            addTranslationInfoToRequest({ request, translationVersion, appVersion, config });
            // We instruct the CDN to return a file that corresponds to the app version calculated
            const uri = getUri(request, appVersion);
            request.uri = uri;
        }
        catch (error) {
            console.error(error);
            // On failure, we're requesting a non-existent file on purpose, to allow CF to serve
            // the configured custom error page
            request.uri = '/404';
        }
        return request;
    });
    return handler;
}
/**
 * We respond with a requested file, but prefix it with the hash of the current active deployment
 */
function getUri(request, appVersion) {
    // If the
    // - request uri is for a specific file (e.g. "/iframe.html")
    // - or is a request on one of the .well-known paths (like .well-known/apple-app-site-association)
    // we serve the requested file.
    // Otherwise, for requests uris like "/" or "my-page" we serve the top-level index.html file,
    // which assumes the routing is handled client-side.
    const isFileRequest = request.uri.split('/').pop().includes('.');
    const isWellKnownRequest = request.uri.startsWith('/.well-known/');
    const filePath = isFileRequest || isWellKnownRequest ? request.uri : '/index.html';
    return external_path_namespaceObject.join('/html', appVersion, filePath);
}
/**
 * Calculate the version of the app that should be served.
 * It can be either a specific version requested via preview link with a hash, or the latest
 * version for a branch requested (preview or main), which we fetch from cursor files stored in S3
 */
function getAppVersion(request, config, s3) {
    var _a, _b;
    return viewer_request_awaiter(this, void 0, void 0, function* () {
        const host = (_a = utils_getHeader(request, 'host')) !== null && _a !== void 0 ? _a : null;
        // Preview name is the first segment of the url e.g. my-branch for my-branch.app.staging.example.com
        // Preview name is either a sanitized branch name or it follows the preview-[hash] pattern
        let previewName;
        if (config.previewDeploymentPostfix && host && host.includes(config.previewDeploymentPostfix)) {
            previewName = host.split('.')[0];
            // If the request is for a specific hash of a preview deployment, we use that hash
            const previewHash = getPreviewHash(previewName);
            if (previewHash) {
                return previewHash;
            }
        }
        const defaultBranchName = (_b = config.defaultBranchName) !== null && _b !== void 0 ? _b : DEFAULT_BRANCH_DEFAULT_NAME;
        // Otherwise we fetch the current app version for requested branch from S3
        const branchName = previewName || defaultBranchName;
        return fetchAppVersion(branchName, config, s3);
    });
}
/**
 * We serve a preview for each app version at e.g.preview-[hash].app.staging.example.com
 * If the preview name matches that pattern, we assume it's a hash preview link
 */
function getPreviewHash(previewName) {
    var _a;
    const matchHash = /^preview-(?<hash>[a-z0-9]{40})$/.exec(previewName || '');
    return (_a = matchHash === null || matchHash === void 0 ? void 0 : matchHash.groups) === null || _a === void 0 ? void 0 : _a.hash;
}
/**
 * Fetch a cursor deploy file from the S3 bucket and returns its content, which is the current
 * active app version for that branch).
 */
function fetchAppVersion(branch, config, s3) {
    return viewer_request_awaiter(this, void 0, void 0, function* () {
        try {
            return yield fetchFileFromS3Bucket(`deploys/${branch}`, config.originBucketName, s3);
        }
        catch (error) {
            throw new Error(`Cursor file not found for branch=${branch}`);
        }
    });
}

;// CONCATENATED MODULE: ./src/viewer-request/index.ts




const config = getConfig();
/**
 * Note that in order to optimize performance, we're using a persistent connection created
 * in global scope of this Edge Lambda. For more details
 * @see https://aws.amazon.com/blogs/networking-and-content-delivery/leveraging-external-data-in-lambdaedge
 */
const keepAliveAgent = new external_https_namespaceObject.Agent({ keepAlive: true });
const s3 = new (s3_default())({
    region: config.originBucketRegion,
    httpOptions: { agent: keepAliveAgent }
});
const handler = getHandler(config, s3);

module.exports = __webpack_exports__;
/******/ })()
;