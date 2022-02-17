<h1 align="center">
  🔋 Pleo SPA CI/CD - Post Preview URLs Action
</h1>

![](./screenshot.png)

<!-- action-docs-description -->

## Description

Append the URLs for branch app and storybook preview deployments to the PR description.

<!-- action-docs-description -->

## Example Use

<!-- action-docs-inputs -->

## Inputs

| parameter | description                                                               | required | default             |
| --------- | ------------------------------------------------------------------------- | -------- | ------------------- |
| token     | GitHub token used to update the PR description                            | `false`  | ${{ github.token }} |
| app_name  | Name of the app (e.g. if you're deploying multiple SPAs in the same repo) | `false`  | app                 |
| app_emoji | Emoji for the app                                                         | `false`  | 📱                  |
| domain    | The domain for the app deployments                                        | `true`   |                     |
| tree_hash | The tree hash of the current deployment                                   | `false`  |                     |

<!-- action-docs-inputs -->

<!-- action-docs-outputs -->

<!-- action-docs-outputs -->

<!-- action-docs-runs -->

## Runs

This action is an `node16` action.

<!-- action-docs-runs -->
