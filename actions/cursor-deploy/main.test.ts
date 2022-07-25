import crypto from 'crypto'
import {stripIndents as strip} from 'common-tags'
import {cursorDeploy} from './main'
import * as utils from '../utils'

jest.mock('@actions/core')
jest.mock('@actions/github')

jest.mock('../utils')
const mockedUtils = jest.mocked(utils)

// reset the counter on mock fn calls after every test
beforeEach(() => jest.clearAllMocks())

// use the actual method for sanitizing branch names
const originalUtils = jest.requireActual('../utils')
mockedUtils.getSanitizedBranchName.mockImplementation(originalUtils.getSanitizedBranchName)

// Setup the mocking and test environment
function setupTest({
    underRollback,
    historyLength
}: {
    underRollback: boolean
    historyLength: number
}) {
    const treeHash = getRandomSha()
    mockedUtils.getCurrentRepoTreeHash.mockResolvedValue(treeHash)
    mockedUtils.fileExistsInS3.mockResolvedValue(underRollback)
    const cursorHistory = getRandomHistory(historyLength)
    mockedUtils.getFileFromS3.mockResolvedValue(cursorHistory.join('\n'))
    return {treeHash, cursorHistory}
}

describe(`Cursor Deploy Action`, () => {
    test(
        strip`
        When an incorrect deploy mode is passed
        Then the action fails with an informative error
        `,
        async () => {
            setupTest({historyLength: 10, underRollback: true})

            const promise = cursorDeploy({
                bucket: 'my-bucket',
                deployMode: 'horse',
                ref: 'refs/heads/master',
                featureBranches: true
            })

            expect(promise).rejects.toEqual(new Error('Incorrect deploy mode provided (horse)'))
            await promise.catch((error) => error)
            expectNoS3Mutations()
        }
    )
})

describe(`Cursor Deploy Action - Default Mode`, () => {
    test(
        strip`
        When no requested version is provided
        Then the cursor file is updated
        And the version used is the current repo tree hash
        `,
        async () => {
            const {treeHash, cursorHistory} = setupTest({historyLength: 10, underRollback: false})

            const output = await cursorDeploy({
                deployMode: 'default',
                bucket: 'my-bucket',
                featureBranches: true,
                ref: 'refs/heads/master'
            })

            expectCursorHistoryFetched({bucket: 'my-bucket', key: 'deploys/master'})
            expectRollbackFileChecked({bucket: 'my-bucket', key: 'rollbacks/master'})
            expectCursorFileUpdated({
                version: treeHash,
                cursorHistory,
                branch: 'master',
                bucket: 'my-bucket',
                key: 'deploys/master'
            })
            expect(output.deployedVersion).toBe(treeHash)
        }
    )

    test(
        strip`
        When a specific version is requested for deployment
        Then the cursor file is updated
        And the version used is the requested version
        `,
        async () => {
            const {cursorHistory} = setupTest({historyLength: 10, underRollback: false})
            const requestedVersion = getRandomSha()

            const output = await cursorDeploy({
                deployMode: 'default',
                bucket: 'my-bucket',
                featureBranches: true,
                ref: 'refs/heads/master',
                requestedVersion
            })

            expectCursorHistoryFetched({bucket: 'my-bucket', key: 'deploys/master'})
            expectRollbackFileChecked({bucket: 'my-bucket', key: 'rollbacks/master'})
            expectCursorFileUpdated({
                version: requestedVersion,
                cursorHistory,
                branch: 'master',
                bucket: 'my-bucket',
                key: 'deploys/master'
            })
            expect(output.deployedVersion).toBe(requestedVersion)
        }
    )

    test(
        strip`
        When an app name is provided
        Then the cursor file is updated
        And the cursor key is prefixed with the app name
        `,
        async () => {
            const {treeHash, cursorHistory} = setupTest({historyLength: 10, underRollback: false})

            const output = await cursorDeploy({
                deployMode: 'default',
                bucket: 'my-bucket',
                featureBranches: true,
                appName: 'my-app',
                ref: 'refs/heads/master'
            })

            expectCursorHistoryFetched({bucket: 'my-bucket', key: 'my-app/deploys/master'})
            expectRollbackFileChecked({bucket: 'my-bucket', key: 'my-app/rollbacks/master'})
            expectCursorFileUpdated({
                version: treeHash,
                cursorHistory,
                branch: 'master',
                bucket: 'my-bucket',
                key: 'my-app/deploys/master'
            })
            expect(output.deployedVersion).toBe(treeHash)
        }
    )

    test(
        strip`
        When the action runs on a feature branch
        And the feature branches support is turned on
        Then the cursor file for the feature branch is updated
        `,
        async () => {
            const {treeHash, cursorHistory} = setupTest({historyLength: 10, underRollback: false})

            const output = await cursorDeploy({
                bucket: 'my-bucket',
                deployMode: 'default',
                ref: 'refs/heads/lol/my-feature-branch-30%-better',
                featureBranches: true
            })

            expectCursorHistoryFetched({
                bucket: 'my-bucket',
                key: 'deploys/lol-my-feature-branch-30-better'
            })
            expectRollbackFileChecked({
                bucket: 'my-bucket',
                key: 'rollbacks/lol-my-feature-branch-30-better'
            })
            expectCursorFileUpdated({
                version: treeHash,
                cursorHistory,
                branch: 'lol-my-feature-branch-30-better',
                bucket: 'my-bucket',
                key: 'deploys/lol-my-feature-branch-30-better'
            })
            expect(output.deployedVersion).toBe(treeHash)
        }
    )

    test(
        strip`
        When the action runs on a feature branch
        And the feature branches support is turned off
        Then the default cursor file is updated
        `,
        async () => {
            const {treeHash, cursorHistory} = setupTest({historyLength: 10, underRollback: false})

            const output = await cursorDeploy({
                bucket: 'my-bucket',
                deployMode: 'default',
                ref: 'refs/heads/lol/my-feature-branch-30%-better',
                featureBranches: false
            })

            expectCursorHistoryFetched({bucket: 'my-bucket', key: 'deploys/master'})
            expectRollbackFileChecked({bucket: 'my-bucket', key: 'rollbacks/master'})
            expectCursorFileUpdated({
                version: treeHash,
                cursorHistory,
                branch: 'master',
                bucket: 'my-bucket',
                key: 'deploys/master'
            })
            expect(output.deployedVersion).toBe(treeHash)
        }
    )

    test(
        strip`
        When there is an active rollback
        Then the cursor file is not updated
        And the action returns a error
        `,
        async () => {
            setupTest({historyLength: 10, underRollback: true})

            const promise = cursorDeploy({
                bucket: 'my-bucket',
                deployMode: 'default',
                ref: 'refs/heads/master',
                featureBranches: true
            })

            // Wait until we're done, but discard the error
            await promise.catch((error) => error)

            expect(promise).rejects.toEqual(
                new Error('deploys/master is currently blocked due to an active rollback.')
            )
            expectCursorHistoryFetched({bucket: 'my-bucket', key: 'deploys/master'})
            expectRollbackFileChecked({bucket: 'my-bucket', key: 'rollbacks/master'})
            expectNoS3Mutations()
        }
    )

    test(
        strip`
        When the cursor history 20 entries long
        And a new deployment is performed
        Then the cursor file is updated with the latest cursor
        And the oldest history entry is removed
        `,
        async () => {
            const {treeHash, cursorHistory} = setupTest({historyLength: 20, underRollback: false})

            const output = await cursorDeploy({
                deployMode: 'default',
                bucket: 'my-bucket',
                featureBranches: true,
                ref: 'refs/heads/master'
            })

            expectCursorHistoryFetched({bucket: 'my-bucket', key: 'deploys/master'})
            expectRollbackFileChecked({bucket: 'my-bucket', key: 'rollbacks/master'})
            expectCursorFileUpdated({
                version: treeHash,
                cursorHistory: cursorHistory.slice(0, 19),
                branch: 'master',
                bucket: 'my-bucket',
                key: 'deploys/master'
            })
            expect(output.deployedVersion).toBe(treeHash)
        }
    )
})
describe(`Cursor Deploy Action - Rollback Mode`, () => {
    test(
        strip`
        When a rollback jump is provided
        And there is enough cursor history
        Then the cursor file is updated
        And the previous deployed version is used
        And a rollback file is created 
        `,
        async () => {
            const {cursorHistory} = setupTest({historyLength: 10, underRollback: false})
            const rollbackJump = 2
            const rollbackVersion = cursorHistory[rollbackJump]

            const output = await cursorDeploy({
                bucket: 'my-prod-bucket',
                deployMode: 'rollback',
                ref: 'refs/heads/master',
                featureBranches: true,
                rollbackJump
            })

            expectCursorHistoryFetched({bucket: 'my-prod-bucket', key: 'deploys/master'})
            expect(mockedUtils.fileExistsInS3).not.toHaveBeenCalled()
            expectCursorsUpdatedForRollback({
                version: rollbackVersion,
                cursorHistory,
                bucket: 'my-prod-bucket',
                deployKey: 'deploys/master',
                rollbackKey: 'rollbacks/master'
            })
            expect(output.deployedVersion).toBe(rollbackVersion)
        }
    )

    test(
        strip`
         When a rollback jump is provided
         And the jump exceeds the cursor history length
         Then the action fails with an informative error
        `,
        async () => {
            setupTest({historyLength: 10, underRollback: false})

            const promise = cursorDeploy({
                bucket: 'my-prod-bucket',
                deployMode: 'rollback',
                ref: 'refs/heads/master',
                featureBranches: true,
                rollbackJump: 12
            })

            expect(promise).rejects.toEqual(
                new Error(`The is no deployment history for 12 versions back. Cannot roll back.`)
            )
            await promise.catch((error) => error)
            expectNoS3Mutations()
        }
    )

    test(
        strip`
         When no rollback jump is provided
         And no explicit version is requested for rollback
         Then the action fails with an informative error
        `,
        async () => {
            setupTest({historyLength: 10, underRollback: false})

            const promise = cursorDeploy({
                bucket: 'my-prod-bucket',
                deployMode: 'rollback',
                ref: 'refs/heads/master',
                featureBranches: true
            })

            expect(promise).rejects.toEqual(
                new Error(`Expected a rollback jump or version for rollback deployment mode.`)
            )
            await promise.catch((error) => error)
            expectNoS3Mutations()
        }
    )

    test(
        strip`
        When a specific version is requested for rollback
        Then the cursor file is updated
        And the version used is the requested version
        `,
        async () => {
            const {cursorHistory} = setupTest({historyLength: 10, underRollback: false})
            const requestedVersion = cursorHistory[9]

            const output = await cursorDeploy({
                bucket: 'my-prod-bucket',
                deployMode: 'rollback',
                requestedVersion: requestedVersion,
                ref: 'refs/heads/master',
                featureBranches: true
            })

            expectCursorHistoryFetched({bucket: 'my-prod-bucket', key: 'deploys/master'})
            expect(mockedUtils.fileExistsInS3).not.toHaveBeenCalled()

            expectCursorsUpdatedForRollback({
                version: requestedVersion,
                cursorHistory,
                bucket: 'my-prod-bucket',
                deployKey: 'deploys/master',
                rollbackKey: 'rollbacks/master'
            })
            expect(output.deployedVersion).toBe(requestedVersion)
        }
    )

    test(
        strip`
        When the action runs in the rollback deploy mode
        And a specific rollback version is provided
        And the version is not in the cursor history
        Then the action fails with an informative error
        `,
        async () => {
            setupTest({historyLength: 10, underRollback: true})
            const requestedVersion = getRandomSha()

            const promise = cursorDeploy({
                bucket: 'my-bucket',
                deployMode: 'rollback',
                requestedVersion,
                featureBranches: true,
                ref: 'refs/heads/master'
            })

            expect(promise).rejects.toEqual(
                new Error(
                    `The requested version ${requestedVersion} has not been deployed in the last 20 deploys. Preventing rollback to avoid serving invalid version.`
                )
            )

            await promise.catch((error) => error)

            expect(mockedUtils.fileExistsInS3).not.toHaveBeenCalled()
            expectNoS3Mutations()
        }
    )
})

describe(`Cursor Deploy Action - Unblock Mode`, () => {
    test(
        strip`
        When the action runs in the unblock deploy mode
        And there is an active rollback
        Then the rollback file is deleted 
        And the cursor file is updated
        `,
        async () => {
            const {treeHash, cursorHistory} = setupTest({historyLength: 10, underRollback: true})

            const output = await cursorDeploy({
                bucket: 'my-bucket',
                deployMode: 'unblock',
                ref: 'refs/heads/master',
                featureBranches: true
            })

            expectRollbackFileChecked({bucket: 'my-bucket', key: 'rollbacks/master'})
            expectRollbackFileRemoved({bucket: 'my-bucket', key: 'rollbacks/master'})
            expectCursorFileUpdated({
                version: treeHash,
                cursorHistory,
                branch: 'master',
                bucket: 'my-bucket',
                key: 'deploys/master'
            })

            expect(output.deployedVersion).toBe(treeHash)
        }
    )

    test(
        strip`
        When the action runs in the unblock deploy mode
        And there is no active rollback
        Then the action fails with an informative error
        `,
        async () => {
            setupTest({historyLength: 10, underRollback: false})

            const promise = cursorDeploy({
                bucket: 'my-bucket',
                deployMode: 'unblock',
                ref: 'refs/heads/master',
                featureBranches: true
            })

            expect(promise).rejects.toEqual(
                new Error("deploys/master does not have an active rollback, you can't unblock.")
            )
            await promise.catch((error) => error)
            expectNoS3Mutations()
        }
    )
})

//#region Custom Assertions

function expectCursorFileUpdated(args: {
    branch: string
    bucket: string
    version: string
    cursorHistory: string[]
    key: string
}) {
    expect(mockedUtils.saveTextAsFileInS3).toHaveBeenCalledTimes(1)
    expect(mockedUtils.saveTextAsFileInS3).toHaveBeenCalledWith({
        text: [args.version, ...args.cursorHistory].join('\n'),
        bucket: args.bucket,
        key: args.key
    })
}

function expectCursorsUpdatedForRollback(args: {
    version: string
    bucket: string
    deployKey: string
    rollbackKey: string
    cursorHistory: string[]
}) {
    expect(mockedUtils.saveTextAsFileInS3).toHaveBeenCalledTimes(2)
    expect(mockedUtils.saveTextAsFileInS3).toHaveBeenCalledWith({
        text: [args.version, ...args.cursorHistory].join('\n'),
        bucket: args.bucket,
        key: args.deployKey
    })
    expect(mockedUtils.saveTextAsFileInS3).toHaveBeenCalledWith({
        text: args.version,
        bucket: args.bucket,
        key: args.rollbackKey
    })
}

function expectRollbackFileChecked(args: {bucket: string; key: string}) {
    expect(mockedUtils.fileExistsInS3).toHaveBeenCalledTimes(1)
    expect(mockedUtils.fileExistsInS3).toHaveBeenCalledWith(args)
}

function expectRollbackFileRemoved(args: {bucket: string; key: string}) {
    expect(mockedUtils.removeFileFromS3).toHaveBeenCalledWith(args)
}

function expectCursorHistoryFetched(args: {bucket: string; key: string}) {
    expect(mockedUtils.getFileFromS3).toHaveBeenCalledWith(args)
}

function expectNoS3Mutations() {
    expect(mockedUtils.removeFileFromS3).not.toHaveBeenCalled()
    expect(mockedUtils.saveTextAsFileInS3).not.toHaveBeenCalled()
}

//#endregion Custom Assertions

//#region Test Helpers

function getRandomSha() {
    return crypto.randomBytes(20).toString('hex')
}

function getRandomHistory(length: number): string[] {
    return Array(length)
        .fill(null)
        .map(() => getRandomSha())
}

//#endregion Test Helpers
