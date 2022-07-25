import * as utils from './utils'
import {exec} from '@actions/exec'

jest.mock('@actions/core')
jest.mock('@actions/exec')
const mockedExec = jest.mocked(exec)

// reset the counter on mock fn calls after every test
beforeEach(() => jest.clearAllMocks())

describe(`Actions Utils`, () => {
    test(`getCurrentRepoTreeHash uses git CLI to return the latest tree hash of the root of the repo`, async () => {
        mockedExec.mockResolvedValue(0)
        const output = await utils.getCurrentRepoTreeHash()
        expect(mockedExec).toHaveBeenCalledWith('git rev-parse', ['HEAD:'], {
            listeners: {stdout: expect.any(Function)}
        })
        expect(output).toBe('')
    })

    describe('S3 Utils', () => {
        test(`fileExistsInS3 uses AWS CLI to check for of an object in S3 bucket, returns true if it exists`, async () => {
            mockedExec.mockResolvedValue(0)
            const output = await utils.fileExistsInS3({key: 'my/key', bucket: 'my-bucket'})
            expect(mockedExec).toHaveBeenCalledWith('aws s3api head-object', [
                '--bucket=my-bucket',
                '--key=my/key'
            ])
            expect(output).toBe(true)
        })

        test(`fileExistsInS3 uses AWS CLI to check for of an object in S3 bucket, returns true if it exists`, async () => {
            mockedExec.mockRejectedValue(255)
            const output = await utils.fileExistsInS3({key: 'my/key', bucket: 'my-bucket'})
            expect(mockedExec).toHaveBeenCalledWith('aws s3api head-object', [
                '--bucket=my-bucket',
                '--key=my/key'
            ])
            expect(output).toBe(false)
        })

        test(`removeFileFromS3 uses AWS CLI to delete a file from S3 bucket`, async () => {
            mockedExec.mockResolvedValue(0)
            await utils.removeFileFromS3({key: 'my/key', bucket: 'my-bucket'})
            expect(mockedExec).toHaveBeenCalledWith('aws s3 rm', ['s3://my-bucket/my/key'])
        })

        test(`saveTextAsFileInS3 uses AWS CLI to save a file with a provided content in S3 bucket`, async () => {
            mockedExec.mockResolvedValue(0)
            await utils.saveTextAsFileInS3({
                text: 'Hello\nWorld!',
                key: 'my/key',
                bucket: 'my-bucket'
            })
            expect(mockedExec).toHaveBeenCalledWith(`/bin/bash -c "echo Hello\nWorld! > .temp"`)
            expect(mockedExec).toHaveBeenCalledWith('aws s3 cp', ['.temp', 's3://my-bucket/my/key'])
        })

        test(`getFileFromS3 uses AWS CLI to fetch a file from S3 bucket`, async () => {
            mockedExec.mockResolvedValueOnce(0)
            const output = await utils.getFileFromS3({
                key: 'my/key',
                bucket: 'my-bucket'
            })
            expect(mockedExec).toHaveBeenCalledWith('aws s3 cp', ['s3://my-bucket/my/key', '.temp'])
            expect(mockedExec).toHaveBeenCalledWith('cat', ['.temp'], {
                listeners: {stdout: expect.any(Function)}
            })
            expect(mockedExec).toHaveBeenCalledWith('rm', ['.temp'])
            expect(output).toBe('')
        })
    })

    describe('Branch Sanitize - getSanitizedBranchName', () => {
        test(`sanitizes a full git ref into a DNS-ready string`, async () => {
            const output = utils.getSanitizedBranchName('refs/heads/hello/world')
            expect(output).toBe('hello-world')
        })

        test(`replaces all non-word characters with a dash`, async () => {
            const output = utils.getSanitizedBranchName(
                'refs/heads/hello/world-100%_ready,for.this!here:it"a)b(c{d}e'
            )
            expect(output).toBe('hello-world-100-_ready-for-this-here-it-a-b-c-d-e')
        })

        test(`removes multiple dashes in a row`, async () => {
            const output = utils.getSanitizedBranchName(
                'refs/heads/hello/my-very-weird_branch-100%%%-original'
            )
            expect(output).toBe('hello-my-very-weird_branch-100-original')
        })

        test(`caps the length of the sanitized name to 60 characters`, async () => {
            const output = utils.getSanitizedBranchName(
                'refs/heads/hello/my-very-weird_branch-100-original-whoooohoooooo-lets-do_it'
            )
            expect(output).toBe('hello-my-very-weird_branch-100-original-whoooohoooooo-lets-d')
        })
    })
})
