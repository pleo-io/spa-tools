<h1 align="center">
  🔋 Pleo SPA CI/CD - Cursor Deploy Action
</h1>

![](./screenshot.png)

<!-- action-docs-description -->

## Description

Deploy a new version of the app by modifying a cursor file in S3 bucket.

<!-- action-docs-description -->

Performs a deployment by updating a cursor file in an S3 bucket. This relies on infrastructure that
uses the cursor files to serve the correct version of an app to the user.

Note that the action assumes that the AWS credentials has already been configured for the job, and
allow to read and write to the S3 bucket provided as input. Use the `configure-aws-credentials`
action in a step prior to running this action to ensure that's the case.

<!-- action-docs-inputs -->

## Inputs

| parameter         | description                                                                            | required | default |
| ----------------- | -------------------------------------------------------------------------------------- | -------- | ------- |
| bucket-name       | Bucket to use for deployments                                                          | `true`   |         |
| deploy-mode       | The deployment mode (default / rollback / unblock)                                     | `false`  | default |
| requested-version | Version of the deployed app - defaults to the current repo tree hash                   | `false`  |         |
| feature-branches  | Should the action keep independent deployment version per git branch                   | `false`  | true    |
| app-name          | Name of the deployed app - useful for projects with multiple deployed apps             | `false`  |         |
| rollback-jump     | Controls how many versions back should be rolled back (only relevant in rollback mode) | `false`  | 1       |
| history-count     | How many versions should be kept in the cursor file                                    | `false`  | 20      |

<!-- action-docs-inputs -->

<!-- action-docs-outputs -->

## Outputs

| parameter        | description                                 |
| ---------------- | ------------------------------------------- |
| deployed-version | Current active version after the deployment |

<!-- action-docs-outputs -->

## Example Use

Using the current repo tree hash as deployed version, with support for feature branches:

```yml
- uses: pleo-oss/pleo-spa-cicd/actions/cursor-deploy@v5
  with:
      bucket-name: my-s3-bucket
```

Using the a custom version, with a named app and no feature branches:

```yml
- uses: pleo-oss/pleo-spa-cicd/actions/cursor-deploy@v5
  with:
      bucket-name: my-s3-bucket
      app-name: translations
      feature-branches: false
      requested-version: v10
```

## Rollbacks

The action supports rollbacks with blocking of automatic deployments until an explicit action is
taken to undo the rollback. You can either rollback a given number of versions back (using
`rollbackJump` input), or to a specific version (which was deployed in the past 20 deployments).

You can create a rollback GitHub workflows triggered via repository dispatch, e.g.

```yml
name: Rollback
on:
    workflow_dispatch:
        inputs:
            sha:
                required: false
jobs:
    rollback:
        runs-on: ubuntu-22.04
        steps:
            - uses: aws-actions/configure-aws-credentials@v1
              with:
                  aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
                  aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
            - name: Update Cursor File
              uses: pleo-oss/pleo-spa-cicd/actions/cursor-deploy@v5
              with:
                  bucket-name: my-origin-bucket
                  deploy-mode: rollback
                  rollback-jump: ${{ github.event.inputs.jump }}
                  rollback-jump: ${{ github.event.inputs.jump }}
```

You can create a similar workflow for unblocking:

```yml
name: Unblock
on: workflow_dispatch
jobs:
    rollback:
        runs-on: ubuntu-22.04
        steps:
            - uses: actions/checkout@v3
            - uses: aws-actions/configure-aws-credentials@v1
              with:
                  aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
                  aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
            - name: Update Cursor File
              uses: pleo-oss/pleo-spa-cicd/actions/cursor-deploy@v5
              with:
                  bucket-name: my-origin-bucket
                  deploy-mode: update
```

<!-- action-docs-runs -->

## Runs

This action is a `node16` action.

<!-- action-docs-runs -->
