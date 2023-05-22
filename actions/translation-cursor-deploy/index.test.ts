import {stripIndents as strip} from 'common-tags'
import {cursorDeploy} from './index'
import * as utils from '../utils'
import * as helpers from './helpers'

jest.mock('../utils')
jest.mock('@actions/core')
jest.mock('@actions/github')

// just making sure the mock methods are correctly typed
const mockedUtils = jest.mocked(utils)

describe(`Translation Cursor Deploy Action`, () => {
    test(
        strip`
        When mode is 'default' with common 'hash' with existent latest cursor
        Previous cursor is updated with latest cursor
        And latest cursor is updated with 'hash' from params
        `,
        async () => {
            const bucket = 'my-bucket'
            mockedUtils.fileExistsInS3.mockResolvedValue(true)

            await cursorDeploy({
                bucket,
                hash: '2453',
                modeInput: 'default'
            })

            expect(mockedUtils.copyFileToS3).toHaveBeenCalledTimes(2)

            expect(mockedUtils.copyFileToS3).toHaveBeenCalledWith({
                path: `s3://${bucket}/${helpers.latestKey}`,
                bucket: bucket,
                key: helpers.previousKey
            })

            expect(mockedUtils.copyFileToS3).toHaveBeenLastCalledWith({
                path: 'latest',
                bucket,
                key: helpers.latestKey
            })

            expect(mockedUtils.writeLineToFile).toHaveBeenCalledTimes(1)
            expect(mockedUtils.writeLineToFile).toHaveBeenCalledWith({text: '2453', path: 'latest'})
        }
    )

    test(
        strip`
        When mode is 'default' with common 'hash' without existent latest cursor
        Previous cursor is NOT updated with latest cursor
        And latest cursor is created with 'hash' from params
        `,
        async () => {
            const bucket = 'my-bucket'
            mockedUtils.fileExistsInS3.mockResolvedValue(false)

            await cursorDeploy({
                bucket,
                hash: '2453',
                modeInput: 'default'
            })

            expect(mockedUtils.copyFileToS3).toHaveBeenCalledTimes(1)

            expect(mockedUtils.copyFileToS3).toHaveBeenCalledWith({
                path: 'latest',
                bucket,
                key: helpers.latestKey
            })

            expect(mockedUtils.writeLineToFile).toHaveBeenCalledTimes(1)
            expect(mockedUtils.writeLineToFile).toHaveBeenCalledWith({text: '2453', path: 'latest'})
        }
    )

    test(
        strip`
        When mode is 'rollback' without 'hash', but with existent previous cursor
        Latest cursor is updated with previous cursor
        And previous cursor is deleted
    `,
        async () => {
            const bucket = 'my-bucket'
            mockedUtils.fileExistsInS3.mockResolvedValue(true)

            await cursorDeploy({
                bucket,
                modeInput: 'rollback'
            })

            expect(mockedUtils.copyFileToS3).toHaveBeenCalledTimes(1)
            expect(mockedUtils.copyFileToS3).toHaveBeenCalledWith({
                path: `s3://${bucket}/${helpers.previousKey}`,
                bucket,
                key: helpers.latestKey
            })
            expect(mockedUtils.removeFileFromS3).toHaveBeenCalledTimes(1)
            expect(mockedUtils.removeFileFromS3).toHaveBeenCalledWith({
                bucket,
                key: helpers.previousKey
            })
        }
    )

    test(
        strip`        
        When mode is 'rollback' without 'hash' and without existent previous cursor
        Latest cursor is NOT updated
        Error is thrown
        `,
        async () => {
            const bucket = 'my-bucket'
            mockedUtils.fileExistsInS3.mockResolvedValue(false)

            const promise = cursorDeploy({
                bucket,
                modeInput: 'rollback'
            })

            expect(promise).rejects.toEqual(
                new Error('Previous cursor is empty, please specify the hash')
            )

            await promise.catch((error) => error)

            expect(mockedUtils.copyFileToS3).not.toHaveBeenCalled()
            expect(mockedUtils.removeFileFromS3).not.toHaveBeenCalled()
        }
    )

    test(
        strip`        
        When mode is 'rollback' with 'hash' from params,
        Latest cursor is NOT updated
        It makes the situation ambigious
        What should be used hash from param or hash from 'previous' cursor
        Error is thrown
        `,
        async () => {
            const bucket = 'my-bucket'
            mockedUtils.fileExistsInS3.mockResolvedValue(false)

            const promise = cursorDeploy({
                bucket,
                modeInput: 'rollback',
                hash: '2354'
            })

            expect(promise).rejects.toEqual(
                new Error(
                    'Rollback mode should be run without specified hash, otherwise it is ambiouty what should be used hash from param or hash from previous.'
                )
            )

            await promise.catch((error) => error)

            expect(mockedUtils.copyFileToS3).not.toHaveBeenCalled()
            expect(mockedUtils.removeFileFromS3).not.toHaveBeenCalled()
        }
    )

    test(
        strip`        
        When mode is 'default' without 'hash' from params,
        Latest cursor is NOT updated
        Because, hash should be specified
        Error is thrown
        `,
        async () => {
            const bucket = 'my-bucket'
            mockedUtils.fileExistsInS3.mockResolvedValue(false)

            const promise = cursorDeploy({
                bucket,
                modeInput: 'default'
            })

            expect(promise).rejects.toEqual(
                new Error('Hash should be speficied with the default mode')
            )

            await promise.catch((error) => error)

            expect(mockedUtils.copyFileToS3).not.toHaveBeenCalled()
            expect(mockedUtils.removeFileFromS3).not.toHaveBeenCalled()
        }
    )

    test(
        strip`
        When an incorrect deploy mode is passed
        Then the action fails with an informative error
        `,
        async () => {
            const promise = cursorDeploy({
                bucket: 'my-bucket',
                modeInput: 'mouse',
                hash: '6445'
            })

            expect(promise).rejects.toEqual(new Error('Incorrect deploy mode (mouse)'))

            await promise.catch((error) => error)
            expect(mockedUtils.copyFileToS3).not.toHaveBeenCalled()
            expect(mockedUtils.removeFileFromS3).not.toHaveBeenCalled()
        }
    )
})
