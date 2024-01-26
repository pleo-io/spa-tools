import {stripIndents as strip} from 'common-tags'
import {cursorDeploy, branchNameToHostnameLabel} from './index'
import * as utils from '../utils'

jest.mock('../utils')
jest.mock('@actions/core')
jest.mock('@actions/github')

// just making sure the mock methods are correctly typed
const mockedUtils = jest.mocked(utils)

describe(`Cursor Deploy Action`, () => {
    test(
        strip`
        When the action runs in the default deploy mode
        And the the action runs on the default branch
        And there is no active rollback on that branch/env
        Then the cursor file for the main branch is updated
        And the tree hash used is the current repo tree hash
        `,
        async () => {
            const treeHash = 'b017ebdf289ba78787da4e9c3291f0b7959e7059'
            mockedUtils.getCurrentRepoTreeHash.mockResolvedValue(treeHash)
            mockedUtils.fileExistsInS3.mockResolvedValue(false)

            const output = await cursorDeploy({
                bucket: 'my-bucket',
                deployModeInput: 'default',
                ref: 'refs/heads/main',
                rollbackCommitHash: ''
            })

            expectRollbackFileChecked('my-bucket', 'rollbacks/main')

            expectCursorFileUpdated({
                treeHash: treeHash,
                branch: 'main',
                bucket: 'my-bucket',
                key: 'deploys/main'
            })

            expect(output.treeHash).toBe(treeHash)
            expect(output.branchLabel).toBe('main')
        }
    )

    test(
        strip`
        When the action runs in the default deploy mode
        And the the action runs on a feature branch
        And there is no active rollback on that branch/env
        Then the cursor file for the feature branch is updated
        And the tree hash used is the current repo tree hash
        `,
        async () => {
            const treeHash = '553b0cb96ac21ffc0583e5d8d72343b1faa90dfd'
            const sanitizedBranch = 'lol-my-feature-branch-30-better'
            mockedUtils.getCurrentRepoTreeHash.mockResolvedValue(treeHash)
            mockedUtils.fileExistsInS3.mockResolvedValue(false)

            const output = await cursorDeploy({
                bucket: 'my-bucket',
                deployModeInput: 'default',
                ref: 'refs/heads/lol/my-feature-branch-30%-better',
                rollbackCommitHash: ''
            })

            expectRollbackFileChecked('my-bucket', 'rollbacks/lol-my-feature-branch-30-better')

            expectCursorFileUpdated({
                treeHash: treeHash,
                branch: sanitizedBranch,
                bucket: 'my-bucket',
                key: 'deploys/lol-my-feature-branch-30-better'
            })

            expect(output.treeHash).toBe(treeHash)
            expect(output.branchLabel).toBe(sanitizedBranch)
        }
    )

    test(
        strip`
        When the action runs in the default deploy mode
        And there is an active rollback on that branch/env
        Then the cursor file for the feature branch is not updated
        And the action returns a error
        `,
        async () => {
            const treeHash = 'b017ebdf289ba78787da4e9c3291f0b7959e7059'
            mockedUtils.getCurrentRepoTreeHash.mockResolvedValue(treeHash)
            mockedUtils.fileExistsInS3.mockResolvedValue(true)

            const promise = cursorDeploy({
                bucket: 'my-bucket',
                deployModeInput: 'default',
                ref: 'refs/heads/main',
                rollbackCommitHash: ''
            })

            expect(promise).rejects.toEqual(
                new Error('main is currently blocked due to an active rollback.')
            )

            await promise.catch((error) => error)
            expectRollbackFileChecked('my-bucket', 'rollbacks/main')

            expect(mockedUtils.writeLineToFile).not.toHaveBeenCalled()
            expect(mockedUtils.copyFileToS3).not.toHaveBeenCalled()
        }
    )

    test(
        strip`
        When the action runs in the rollback deploy mode
        And no specific rollback hash is provided
        Then the cursor file is updated
        And the tree hash used is the previous commit tree hash
        `,
        async () => {
            const currentTreeHash = 'b017ebdf289ba78787da4e9c3291f0b7959e7059'
            const commitTreeHash = '32439d157a7e346d117a6a3c47d511526bd45012'

            mockedUtils.getCurrentRepoTreeHash.mockResolvedValue(currentTreeHash)
            mockedUtils.fileExistsInS3.mockResolvedValue(false)
            mockedUtils.getTreeHashForCommitHash.mockResolvedValue(commitTreeHash)

            const output = await cursorDeploy({
                bucket: 'my-prod-bucket',
                deployModeInput: 'rollback',
                ref: 'refs/heads/main',
                rollbackCommitHash: ''
            })

            expect(mockedUtils.fileExistsInS3).not.toHaveBeenCalled()
            expect(mockedUtils.isHeadAncestor).not.toHaveBeenCalled()
            expect(mockedUtils.getTreeHashForCommitHash).toHaveBeenCalledWith('HEAD^')

            expect(mockedUtils.writeLineToFile).toHaveBeenCalledTimes(1)
            expect(mockedUtils.writeLineToFile).toHaveBeenCalledWith({
                text: commitTreeHash,
                path: 'main'
            })

            expect(mockedUtils.copyFileToS3).toHaveBeenCalledTimes(2)
            expect(mockedUtils.copyFileToS3).toHaveBeenCalledWith({
                path: 'main',
                bucket: 'my-prod-bucket',
                key: 'deploys/main'
            })

            expect(mockedUtils.copyFileToS3).toHaveBeenLastCalledWith({
                path: 'main',
                bucket: 'my-prod-bucket',
                key: 'rollbacks/main'
            })

            expect(output.treeHash).toBe(commitTreeHash)
            expect(output.branchLabel).toBe('main')
        }
    )

    test(
        strip`
        When the action runs in the rollback deploy mode
        And a specific rollback hash is provided
        Then the cursor file is updated
        And the tree hash used is the tree hash of the passed commit hash
        `,
        async () => {
            const currentTreeHash = 'b017ebdf289ba78787da4e9c3291f0b7959e7059'
            const commitTreeHash = 'b6e1c0468f4705b8cd0f18a04cd28ef7b9da7425'
            const commitHash = 'fc24d309398cbf6d53237e05e4d2a8cd2de57cc7'

            mockedUtils.getCurrentRepoTreeHash.mockResolvedValue(currentTreeHash)
            mockedUtils.fileExistsInS3.mockResolvedValue(false)
            mockedUtils.isHeadAncestor.mockResolvedValue(true)
            mockedUtils.getTreeHashForCommitHash.mockResolvedValue(commitTreeHash)

            const output = await cursorDeploy({
                bucket: 'my-bucket',
                deployModeInput: 'rollback',
                rollbackCommitHash: commitHash,
                ref: 'refs/heads/main'
            })

            expect(mockedUtils.fileExistsInS3).not.toHaveBeenCalled()
            expect(mockedUtils.isHeadAncestor).toHaveBeenCalledWith(commitHash)
            expect(mockedUtils.getTreeHashForCommitHash).toHaveBeenCalledWith(commitHash)

            expect(mockedUtils.writeLineToFile).toHaveBeenCalledTimes(1)
            expect(mockedUtils.writeLineToFile).toHaveBeenCalledWith({
                text: commitTreeHash,
                path: 'main'
            })

            expect(mockedUtils.copyFileToS3).toHaveBeenCalledTimes(2)
            expect(mockedUtils.copyFileToS3).toHaveBeenCalledWith({
                path: 'main',
                bucket: 'my-bucket',
                key: 'deploys/main'
            })

            expect(mockedUtils.copyFileToS3).toHaveBeenLastCalledWith({
                path: 'main',
                bucket: 'my-bucket',
                key: 'rollbacks/main'
            })

            expect(output.treeHash).toBe(commitTreeHash)
            expect(output.branchLabel).toBe('main')
        }
    )

    test(
        strip`
        When the action runs in the unblock deploy mode
        And there is an active rollback on that branch/env
        Then the rollback file is deleted
        And the cursor file is updated
        And the tree hash used is the tree hash of the passed commit hash
        `,
        async () => {
            const treeHash = 'b017ebdf289ba78787da4e9c3291f0b7959e7059'

            mockedUtils.getCurrentRepoTreeHash.mockResolvedValue(treeHash)
            mockedUtils.fileExistsInS3.mockResolvedValue(true)
            mockedUtils.isHeadAncestor.mockResolvedValue(true)

            const output = await cursorDeploy({
                bucket: 'my-bucket',
                deployModeInput: 'unblock',
                rollbackCommitHash: '',
                ref: 'refs/heads/main'
            })

            expectRollbackFileChecked('my-bucket', 'rollbacks/main')

            expectCursorFileUpdated({
                treeHash: treeHash,
                branch: 'main',
                bucket: 'my-bucket',
                key: 'deploys/main'
            })

            expect(mockedUtils.removeFileFromS3).toHaveBeenCalledWith({
                bucket: 'my-bucket',
                key: 'rollbacks/main'
            })

            expect(output.treeHash).toBe(treeHash)
            expect(output.branchLabel).toBe('main')
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
                deployModeInput: 'horse',
                ref: 'refs/heads/main',
                rollbackCommitHash: ''
            })

            expect(promise).rejects.toEqual(new Error('Incorrect deploy mode (horse)'))

            await promise.catch((error) => error)
            expect(mockedUtils.copyFileToS3).not.toHaveBeenCalled()
            expect(mockedUtils.removeFileFromS3).not.toHaveBeenCalled()
        }
    )

    test(
        strip`
        When the action runs in the rollback deploy mode
        And a specific rollback hash is provided
        And the hash is not in the history of the current branch
        Then the action fails with an informative error
        `,
        async () => {
            const currentTreeHash = 'b017ebdf289ba78787da4e9c3291f0b7959e7059'
            const commitHash = 'fc24d309398cbf6d53237e05e4d2a8cd2de57cc7'
            const commitTreeHash = 'b6e1c0468f4705b8cd0f18a04cd28ef7b9da7425'

            mockedUtils.getCurrentRepoTreeHash.mockResolvedValue(currentTreeHash)
            mockedUtils.fileExistsInS3.mockResolvedValue(false)
            mockedUtils.isHeadAncestor.mockResolvedValue(false)
            mockedUtils.getTreeHashForCommitHash.mockResolvedValue(commitTreeHash)

            const promise = cursorDeploy({
                bucket: 'my-bucket',
                deployModeInput: 'rollback',
                rollbackCommitHash: commitHash,
                ref: 'refs/heads/main'
            })

            expect(promise).rejects.toEqual(
                new Error('The selected rollback commit is not present on the branch')
            )

            await promise.catch((error) => error)

            expect(mockedUtils.fileExistsInS3).not.toHaveBeenCalled()
            expect(mockedUtils.isHeadAncestor).toHaveBeenCalledWith(commitHash)
            expect(mockedUtils.copyFileToS3).not.toHaveBeenCalled()
            expect(mockedUtils.removeFileFromS3).not.toHaveBeenCalled()
        }
    )
})

describe('Branch Sanitize - branchNameToHostnameLabel', () => {
    it(`sanitizes a full git ref into a DNS-ready string`, async () => {
        const output = branchNameToHostnameLabel('refs/heads/hello/world')
        expect(output).toBe('hello-world')
    })

    it(`replaces all non-word characters with a dash`, async () => {
        const output = branchNameToHostnameLabel(
            'refs/heads/hello/world-100%_ready,for.this!here:it"a)b(c{d}e'
        )
        expect(output).toBe('hello-world-100-_ready-for-this-here-it-a-b-c-d-e')
    })

    it(`removes multiple dashes in a row`, async () => {
        const output = branchNameToHostnameLabel(
            'refs/heads/hello/my-very-weird_branch-100%%%-original'
        )
        expect(output).toBe('hello-my-very-weird_branch-100-original')
    })

    it(`caps the length of the sanitized name to 60 characters`, async () => {
        const output = branchNameToHostnameLabel(
            'refs/heads/hello/my-very-weird_branch-100-original-whoooohoooooo-lets-do_it'
        )
        expect(output).toBe('hello-my-very-weird_branch-100-original-whoooohoooooo-lets-d')
    })

    it(`trims trailing non-word characters when the branch name exceeds the max allowed length`, async () => {
        const output = branchNameToHostnameLabel(
            'refs/heads/feature-hello-0000-the-quick-brown-fox-jumped-over-the-lazy-dog' // the 60th character here (minus 'refs/heads/') is a hyphen
        )
        expect(output).toBe('feature-hello-0000-the-quick-brown-fox-jumped-over-the-lazy')
    })

    it(`trims trailing non-word characters when the branch name does not exceed the max allowed length`, async () => {
        const output = branchNameToHostnameLabel('refs/heads/feature-hello-0000-')
        expect(output).toBe('feature-hello-0000')
    })

    it(`trims multiple non-word characters`, async () => {
        const output = branchNameToHostnameLabel('refs/heads/feature-hello-0000--')
        expect(output).toBe('feature-hello-0000')
    })

    it(`trims whitespace`, async () => {
        const output = branchNameToHostnameLabel(' refs/heads/feature-hello-0000 ')
        expect(output).toBe('feature-hello-0000')
    })
})

//#region Custom Assertions

function expectCursorFileUpdated(args: {
    treeHash: string
    branch: string
    bucket: string
    key: string
}) {
    expect(mockedUtils.writeLineToFile).toHaveBeenCalledTimes(1)
    expect(mockedUtils.writeLineToFile).toHaveBeenCalledWith({
        text: args.treeHash,
        path: args.branch
    })

    expect(mockedUtils.copyFileToS3).toHaveBeenCalledTimes(1)
    expect(mockedUtils.copyFileToS3).toHaveBeenCalledWith({
        path: args.branch,
        bucket: args.bucket,
        key: args.key
    })
}

function expectRollbackFileChecked(bucket: string, key: string) {
    expect(mockedUtils.fileExistsInS3).toHaveBeenCalledTimes(1)
    expect(mockedUtils.fileExistsInS3).toHaveBeenCalledWith({bucket, key})
}

//#endregion Custom Assertions
