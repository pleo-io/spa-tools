import {postPreviewUrls} from './main'
import * as utils from '../utils'
import * as github from '@actions/github'

jest.mock('../utils')
jest.mock('@actions/core')
jest.mock('@actions/github')

// just making sure the mock methods are correctly typed
const mockedUtils = utils as jest.Mocked<typeof utils>
const mockedGithub = github as jest.Mocked<typeof github>

// reset the counter on mock fn calls after every test
afterEach(() => jest.clearAllMocks())

// use the actual method for sanitizing branch names
const originalUtils = jest.requireActual('../utils')
mockedUtils.getSanitizedBranchName.mockImplementation(originalUtils.getSanitizedBranchName)

describe(`Post Preview URLs action`, () => {
    test(`
    When the PR does not yet have the preview links for the app
    And there is no tree hash provided
    It updates the PR description
    And latest link is posted, marked as deploying
    And the permalink is not posted and it's marked as deploying
    `, async () => {
        const token = '1234'
        const mockedOctokit = {request: jest.fn()} as any
        mockedGithub.getOctokit.mockReturnValue(mockedOctokit)

        await postPreviewUrls({
            domain: 'app.example.com',
            token,
            repo: {owner: 'my-org', repo: 'my-repo'},
            pr: {
                number: 1,
                body: 'Hello World!',
                head: {ref: 'refs/heads/lol/my-feature-branch-30%-better'}
            }
        })

        expect(mockedGithub.getOctokit).toBeCalledWith(token)
        expect(mockedOctokit.request).toBeCalledWith(
            'PATCH /repos/{owner}/{repo}/pulls/{pull_number}',
            {
                body: `Hello World!
<!--app.example.com-preview-urls-do-not-change-below-->
---
🤖 **app.example.com preview links**
_Latest_: https://lol-my-feature-branch-30-better.app.example.com (Deploying... 🚧)
_Current permalink_: (Deploying... 🚧)
<!--app.example.com-preview-urls-do-not-change-above-->
`,
                owner: 'my-org',
                pull_number: 1,
                repo: 'my-repo'
            }
        )
    })
    test(`
    When the PR already has the preview links for the app
    And there is no tree hash provided
    It updates the PR description
    And latest link is posted
    And the permalink is not posted and it's marked as deploying
    `, async () => {
        const token = '1234'
        const mockedOctokit = {request: jest.fn()} as any
        mockedGithub.getOctokit.mockReturnValue(mockedOctokit)

        await postPreviewUrls({
            domain: 'app.example.com',
            token,
            repo: {owner: 'my-org', repo: 'my-repo'},
            pr: {
                number: 1,
                body: `Hello World!
<!--app.example.com-preview-urls-do-not-change-below-->
---
🤖 **app.example.com preview links**
_Latest_: https://lol-my-feature-branch-30-better.app.example.com (Deploying... 🚧)
_Current permalink_: (Deploying... 🚧)
<!--app.example.com-preview-urls-do-not-change-above-->
`,
                head: {ref: 'refs/heads/lol/my-feature-branch-30%-better'}
            }
        })

        expect(mockedGithub.getOctokit).toBeCalledWith(token)
        expect(mockedOctokit.request).toBeCalledWith(
            'PATCH /repos/{owner}/{repo}/pulls/{pull_number}',
            {
                body: `Hello World!
<!--app.example.com-preview-urls-do-not-change-below-->
---
🤖 **app.example.com preview links**
_Latest_: https://lol-my-feature-branch-30-better.app.example.com
_Current permalink_: (Deploying... 🚧)
<!--app.example.com-preview-urls-do-not-change-above-->
`,
                owner: 'my-org',
                pull_number: 1,
                repo: 'my-repo'
            }
        )
    })

    test(`
    When the PR already has the preview links for the app
    And there is a tree hash provided
    It updates the PR description
    And latest link is posted
    And the permalink is posted
    `, async () => {
        const token = '1234'
        const permalink = 'https://preview-c819fdae556e892d5d25de24db6bd6997e673ec6.app.example.com'
        const mockedOctokit = {request: jest.fn()} as any
        mockedGithub.getOctokit.mockReturnValue(mockedOctokit)

        await postPreviewUrls({
            domain: 'app.example.com',
            token,
            permalink,
            repo: {owner: 'my-org', repo: 'my-repo'},
            pr: {
                number: 1,
                body: `Hello World!
<!--app.example.com-preview-urls-do-not-change-below-->
---
🤖 **app.example.com preview links**
_Latest_: https://lol-my-feature-branch-30-better.app.example.com
_Current permalink_: (Deploying... 🚧)
<!--app.example.com-preview-urls-do-not-change-above-->
`,
                head: {ref: 'refs/heads/lol/my-feature-branch-30%-better'}
            }
        })

        expect(mockedGithub.getOctokit).toBeCalledWith(token)
        expect(mockedOctokit.request).toBeCalledWith(
            'PATCH /repos/{owner}/{repo}/pulls/{pull_number}',
            {
                body: `Hello World!
<!--app.example.com-preview-urls-do-not-change-below-->
---
🤖 **app.example.com preview links**
_Latest_: https://lol-my-feature-branch-30-better.app.example.com
_Current permalink_: ${permalink}
<!--app.example.com-preview-urls-do-not-change-above-->
`,
                owner: 'my-org',
                pull_number: 1,
                repo: 'my-repo'
            }
        )
    })
})
