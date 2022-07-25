<h1 align="center">
  🔋 Pleo SPA CI/CD - Post Preview URLs Action
</h1>

![](./screenshot.png)

<!-- action-docs-description -->

## Description

Append the URLs for branch app and storybook preview deployments to the PR description.

<!-- action-docs-description -->

## Example Use

```yml
- name: Update PR Description
  uses: pleo-oss/pleo-spa-cicd/actions/post-preview-urls@v2
  with:
      domain: app.example.com
      permalink: https://preview-c819fdae556e892d5d25de24db6bd6997e673ec6.app.example.com
```

<!-- action-docs-inputs -->

## Inputs

| parameter | description                                     | required | default             |
| --------- | ----------------------------------------------- | -------- | ------------------- |
| token     | GitHub token used to update the PR description  | `false`  | ${{ github.token }} |
| domain    | The domain for the app deployments              | `true`   |                     |
| permalink | The permalink to the current preview deployment | `false`  |                     |
| app-name  | The name displayed in the link section title    | `false`  | 🤖 App              |

<!-- action-docs-inputs -->

<!-- action-docs-outputs -->

<!-- action-docs-outputs -->

<!-- action-docs-runs -->

## Runs

This action is a `node16` action.

<!-- action-docs-runs -->
