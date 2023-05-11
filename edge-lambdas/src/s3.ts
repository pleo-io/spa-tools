import {S3Client, GetObjectCommand} from '@aws-sdk/client-s3'

/**
 * Fetches a file from the S3 origin bucket and returns its content
 * @param key key for the S3 bucket
 * @param bucket name of the S3 bucket
 * @param s3 S3 instance
 * @returns content of the file
 */
export async function fetchFileFromS3Bucket(key: string, bucket: string, s3: S3Client) {
    const command = new GetObjectCommand({Bucket: bucket, Key: key})
    const response = await s3.send(command)
    if (!response.Body) {
        throw new Error(`Empty response from S3 for ${key} in ${bucket} bucket`)
    }

    const fileContents = await response.Body.transformToString()
    return fileContents.trim()
}
