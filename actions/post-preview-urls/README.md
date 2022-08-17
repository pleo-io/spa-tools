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
  uses: pleo-oss/pleo-spa-cicd/actions/post-preview-urls@v6
  with:
      app_name: My App
      links: |
          [
            {"name": "Latest", "url": "https://${{ steps.branch-hostname.outputs.label }}.${{ inputs.domain_name }}"},
            {"name": "Current Permalink", "url": "${{ steps.deployment-url.outputs.url }}"}
          ]
```

<!-- action-docs-inputs -->

## Inputs

| parameter | description                                                                                      | required | default             |
| --------- | ------------------------------------------------------------------------------------------------ | -------- | ------------------- |
| token     | GitHub token used to update the PR description                                                   | `false`  | ${{ github.token }} |
| links     | JSON specification of links to post to the PR description (`Array<{name: string, url: string}>`) | `true`   |                     |
| as_labels | If true, the URL is not displayed and all links are rendered as a comma-separated list           | `false`  | false               |
| app_name  | The name displayed in the link section title                                                     | `false`  | 🤖 App              |

<!-- action-docs-inputs -->

<!-- action-docs-outputs -->

<!-- action-docs-outputs -->

<!-- action-docs-runs -->

## Runs

This action is a `node16` action.

<!-- action-docs-runs -->
