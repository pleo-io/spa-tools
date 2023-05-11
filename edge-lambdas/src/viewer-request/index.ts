import {S3Client} from '@aws-sdk/client-s3'

import {getConfig} from '../config'
import {getHandler} from './viewer-request'

const config = getConfig()

/**
 * Note that in order to optimize performance, we're using a persistent connection created
 * in global scope of this Edge Lambda. In V3 of AWS-SDK the TCP connections are kept alive by default.
 * For more details
 * @see https://aws.amazon.com/blogs/networking-and-content-delivery/leveraging-external-data-in-lambdaedge
 */
const s3 = new S3Client({region: config.originBucketRegion})

export const handler = getHandler(config, s3)
