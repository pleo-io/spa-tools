import {stripIndent as strip} from 'common-tags'
import {postPreviewUrls} from './main'
import * as github from '@actions/github'

jest.mock('../utils')
jest.mock('@actions/core')
jest.mock('@actions/github')

// just making sure the mock methods are correctly typed
const mockedGithub = jest.mocked(github)

describe(`Post Preview URLs action`, () => {
    test(
        strip`
        When the PR does not yet have the preview links for the app
        It adds the links passed to the PR description
        `,
        async () => {
            const token = '1234'
            const mockRequest = jest.fn().mockResolvedValueOnce({
                data: {body: 'Hello World!\n Some indent'}
            })
            mockedGithub.getOctokit.mockReturnValue({request: mockRequest} as any)

            await postPreviewUrls({
                linksJSON: JSON.stringify([
                    {name: 'Latest', url: 'https://feature.app.example.com'}
                ]),
                token,
                repo: {owner: 'my-org', repo: 'my-repo'},
                prNumber: 1,
                appName: '🤖 App'
            })

            expect(mockedGithub.getOctokit).toBeCalledWith(token)
            expect(mockRequest).toHaveBeenLastCalledWith(
                'PATCH /repos/{owner}/{repo}/pulls/{pull_number}',
                {
                    body: strip`
                    Hello World!
                     Some indent
                    <!--app-preview-urls-do-not-change-below-->
                    ---
                    **🤖 App preview links**
                    _Latest_: https://feature.app.example.com
                    <!--app-preview-urls-do-not-change-above-->
                `,
                    owner: 'my-org',
                    pull_number: 1,
                    repo: 'my-repo'
                }
            )
        }
    )

    test(
        strip`
        When the PR does not yet have the preview links for the app
        And the links are requested as labels
        It adds the links passed to the PR description
        And renders the links as labels, hiding the URL
        `,
        async () => {
            const token = '1234'
            const mockRequest = jest.fn().mockResolvedValueOnce({
                data: {body: 'Hello World!\n Some indent'}
            })
            mockedGithub.getOctokit.mockReturnValue({request: mockRequest} as any)

            await postPreviewUrls({
                linksJSON: JSON.stringify([
                    {name: 'Latest', url: 'https://feature.app.example.com'},
                    {
                        name: 'Current Permalink',
                        url: 'https://preview-c819fdae556e892d5d25de24db6bd6997e673ec6.app.example.com'
                    }
                ]),
                token,
                repo: {owner: 'my-org', repo: 'my-repo'},
                prNumber: 1,
                appName: '🤖 App',
                asLabels: true
            })

            expect(mockedGithub.getOctokit).toBeCalledWith(token)
            expect(mockRequest).toHaveBeenLastCalledWith(
                'PATCH /repos/{owner}/{repo}/pulls/{pull_number}',
                {
                    body: strip`
                    Hello World!
                     Some indent
                    <!--app-preview-urls-do-not-change-below-->
                    ---
                    **🤖 App preview links**
                    [Latest](https://feature.app.example.com), [Current Permalink](https://preview-c819fdae556e892d5d25de24db6bd6997e673ec6.app.example.com)
                    <!--app-preview-urls-do-not-change-above-->
                `,
                    owner: 'my-org',
                    pull_number: 1,
                    repo: 'my-repo'
                }
            )
        }
    )

    test(
        strip`
        When the PR already has the preview links for the app
        It updates the links in the PR description
        `,
        async () => {
            const token = '1234'
            const mockRequest = jest.fn().mockResolvedValueOnce({
                data: {
                    body: strip`
                        Hello World!
                         Some indent
                        <!--app-preview-urls-do-not-change-below-->
                        ---
                        **🤖 App preview links**
                        _Latest_: https://feature.app.example.com
                        <!--app-preview-urls-do-not-change-above-->
                    `
                }
            })
            mockedGithub.getOctokit.mockReturnValue({request: mockRequest} as any)

            await postPreviewUrls({
                linksJSON: JSON.stringify([
                    {name: 'Latest', url: 'https://feature-2.app.example.com'}
                ]),
                token,
                repo: {owner: 'my-org', repo: 'my-repo'},
                prNumber: 1,
                appName: '🤖 App'
            })

            expect(mockedGithub.getOctokit).toBeCalledWith(token)
            expect(mockRequest).toHaveBeenLastCalledWith(
                'PATCH /repos/{owner}/{repo}/pulls/{pull_number}',
                {
                    body: strip`
                    Hello World!
                     Some indent
                    <!--app-preview-urls-do-not-change-below-->
                    ---
                    **🤖 App preview links**
                    _Latest_: https://feature-2.app.example.com
                    <!--app-preview-urls-do-not-change-above-->
                `,
                    owner: 'my-org',
                    pull_number: 1,
                    repo: 'my-repo'
                }
            )
        }
    )

    test(
        strip`
        When there are multiple links passed
        It posts all links in the PR description
        `,
        async () => {
            const token = '1234'
            const mockRequest = jest.fn().mockResolvedValueOnce({
                data: {
                    body: strip`
                        Hello World!
                        <!--app-preview-urls-do-not-change-below-->
                        ---
                        **🤖 App preview links**
                        _Latest_: https://feature.app.example.com
                        <!--app-preview-urls-do-not-change-above-->
                    `
                }
            })
            mockedGithub.getOctokit.mockReturnValue({request: mockRequest} as any)

            await postPreviewUrls({
                linksJSON: JSON.stringify([
                    {name: 'Latest', url: 'https://feature.app.example.com'},
                    {
                        name: 'Current Permalink',
                        url: 'https://preview-c819fdae556e892d5d25de24db6bd6997e673ec6.app.example.com'
                    }
                ]),
                token,
                repo: {owner: 'my-org', repo: 'my-repo'},
                prNumber: 1,
                appName: '🤖 App'
            })

            expect(mockedGithub.getOctokit).toBeCalledWith(token)
            expect(mockRequest).toHaveBeenLastCalledWith(
                'PATCH /repos/{owner}/{repo}/pulls/{pull_number}',
                {
                    body: strip`
                    Hello World!
                    <!--app-preview-urls-do-not-change-below-->
                    ---
                    **🤖 App preview links**
                    _Latest_: https://feature.app.example.com
                    _Current Permalink_: https://preview-c819fdae556e892d5d25de24db6bd6997e673ec6.app.example.com
                    <!--app-preview-urls-do-not-change-above-->
                `,
                    owner: 'my-org',
                    pull_number: 1,
                    repo: 'my-repo'
                }
            )
        }
    )

    test(
        strip`
        When the PR already has the preview links for another app
        And there is no preview links for the current app
        It appends the links and keeps the links for the other app
        `,
        async () => {
            const token = '1234'
            const mockRequest = jest.fn().mockResolvedValueOnce({
                data: {
                    body: strip`
                        Hello World!
                        <!--app-preview-urls-do-not-change-below-->
                        ---
                        **🤖 App preview links**
                        _Latest_: https://feature.app.example.com
                        _Current Permalink_: https://preview-c819fdae556e892d5d25de24db6bd6997e673ec6.app.example.com
                        <!--app-preview-urls-do-not-change-above-->
                    `,
                    head: {ref: 'refs/heads/lol/my-feature-branch-30%-better'}
                }
            })
            mockedGithub.getOctokit.mockReturnValue({request: mockRequest} as any)

            await postPreviewUrls({
                linksJSON: JSON.stringify([
                    {name: 'Latest', url: 'https://feature.storybook.example.com'},
                    {
                        name: 'Current Permalink',
                        url: 'https://preview-c819fdae556e892d5d25de24db6bd6997e673ec6.storybook.example.com'
                    }
                ]),
                token,
                repo: {owner: 'my-org', repo: 'my-repo'},
                prNumber: 1,
                appName: '🤖 Storybook'
            })

            expect(mockedGithub.getOctokit).toBeCalledWith(token)
            expect(mockRequest).toHaveBeenLastCalledWith(
                'PATCH /repos/{owner}/{repo}/pulls/{pull_number}',
                {
                    body: strip`
                        Hello World!
                        <!--app-preview-urls-do-not-change-below-->
                        ---
                        **🤖 App preview links**
                        _Latest_: https://feature.app.example.com
                        _Current Permalink_: https://preview-c819fdae556e892d5d25de24db6bd6997e673ec6.app.example.com
                        <!--app-preview-urls-do-not-change-above-->
                        <!--storybook-preview-urls-do-not-change-below-->
                        ---
                        **🤖 Storybook preview links**
                        _Latest_: https://feature.storybook.example.com
                        _Current Permalink_: https://preview-c819fdae556e892d5d25de24db6bd6997e673ec6.storybook.example.com
                        <!--storybook-preview-urls-do-not-change-above-->
                    `,
                    owner: 'my-org',
                    pull_number: 1,
                    repo: 'my-repo'
                }
            )
        }
    )

    test(
        strip`
        When the PR already has the preview links for another app
        And there is are preview links for the current app
        It updates the links for the current app
        And keeps the links for the other app intact
        `,
        async () => {
            const token = '1234'
            const mockRequest = jest.fn().mockResolvedValueOnce({
                data: {
                    body: strip`
                    Hello World!
                    <!--storybook-preview-urls-do-not-change-below-->
                    ---
                    **🤖 Storybook preview links**
                    _Latest_: https://feature.storybook.example.com
                    _Current Permalink_: https://preview-0ce99f79fa377f39248fa0633b21bdb130728674.storybook.example.com
                    <!--storybook-preview-urls-do-not-change-above-->
                    <!--app-preview-urls-do-not-change-below-->
                    ---
                    **🤖 App preview links**
                    _Latest_: https://feature.app.example.com
                    _Current Permalink_: https://preview-c819fdae556e892d5d25de24db6bd6997e673ec6.app.example.com
                    <!--app-preview-urls-do-not-change-above-->
                `,
                    head: {ref: 'refs/heads/lol/my-feature-branch-30%-better'}
                }
            })
            mockedGithub.getOctokit.mockReturnValue({request: mockRequest} as any)

            await postPreviewUrls({
                linksJSON: JSON.stringify([
                    {name: 'Latest', url: 'https://feature.storybook.example.com'},
                    {
                        name: 'Current Permalink',
                        url: 'https://preview-c819fdae556e892d5d25de24db6bd6997e673ec6.storybook.example.com'
                    }
                ]),
                token,
                repo: {owner: 'my-org', repo: 'my-repo'},
                prNumber: 1,
                appName: '📚 Storybook'
            })

            expect(mockedGithub.getOctokit).toBeCalledWith(token)
            expect(mockRequest).toBeCalledWith('PATCH /repos/{owner}/{repo}/pulls/{pull_number}', {
                body: strip`
                Hello World!
                <!--storybook-preview-urls-do-not-change-below-->
                ---
                **📚 Storybook preview links**
                _Latest_: https://feature.storybook.example.com
                _Current Permalink_: https://preview-c819fdae556e892d5d25de24db6bd6997e673ec6.storybook.example.com
                <!--storybook-preview-urls-do-not-change-above-->
                <!--app-preview-urls-do-not-change-below-->
                ---
                **🤖 App preview links**
                _Latest_: https://feature.app.example.com
                _Current Permalink_: https://preview-c819fdae556e892d5d25de24db6bd6997e673ec6.app.example.com
                <!--app-preview-urls-do-not-change-above-->
            `,
                owner: 'my-org',
                pull_number: 1,
                repo: 'my-repo'
            })
        }
    )
})
