import * as https from 'https'

import S3 from 'aws-sdk/clients/s3'

import {getConfig} from '../config'
import {getHandler} from './viewer-request'

const config = getConfig()

/**
 * Note that in order to optimize performance, we're using a persistent connection created
 * in global scope of this Edge Lambda. For more details
 * @see https://aws.amazon.com/blogs/networking-and-content-delivery/leveraging-external-data-in-lambdaedge
 */
const keepAliveAgent = new https.Agent({keepAlive: true})
const s3 = new S3({
    region: config.originBucketRegion,
    httpOptions: {agent: keepAliveAgent}
})

export const handler = getHandler(config, s3)
