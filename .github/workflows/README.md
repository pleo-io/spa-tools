# Frontend Infrastructure Reusable Workflows

[Reusable GitHub workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows)
which help implementing a CI/CD pipeline described in this repository.

### Prerequisites

In order to be compatible with these workflows, your SPA needs to meet a few
criteria:

- if your SPA is deployed to different environments with a varying config (like
  API keys, urls etc.), it needs to be able to build an environment agnostic
  production version, i.e. a bundle without any baked-in configuration that
  differs between environments. The way to accomplish this will vary depending
  on the build tooling you use.
- if your SPA is deployed to different environments, you need to provide a
  command which can inject the config for the selected environment into the
  bundle. If provided, the deploy workflow will invoke that command before
  uploading files to S3
- all the long-cacheable assets like JS/CSS/images need to have a cache buster
  string in their name and they need to be placed in a `${build_dir}/static`
  directory when the production version is built.

## Workflows

### Build

Efficiently runs the build script (defined in `package.json`), bundles and
uploads the result to an S3 registry bucket.

#### Inputs

| Name             | Description                                                                | Type     | Default    | Required |
| ---------------- | -------------------------------------------------------------------------- | -------- | ---------- | :------: |
| `app_name`       | Name of the app, unique for the repo, kebab-cased                          | `string` | n/a        |   yes    |
| `bucket_name`    | Name of the S3 registry bucket                                             | `string` | n/a        |   yes    |
| `build_dir`      | Name of the directory where the production output is built                 | `string` | n/a        |   yes    |
| `build_script`   | Name of the script in package.json used for building the production output | `string` | n/a        |   yes    |
| `registry_scope` | Org scope for the GitHub Package Registry                                  | `string` | `@pleo-io` |    no    |

#### Secrets

Use the
[`secrets: inherit`](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#onworkflow_callsecretsinherit)
options when using the workflow.

| Name                                      | Description                                                       | Required |
| ----------------------------------------- | ----------------------------------------------------------------- | :------: |
| `AWS_ACCESS_KEY_ID_FRONTEND_REGISTRY`     | ID of a AWS key that allows r/w access to the registry bucket     |   yes    |
| `AWS_SECRET_ACCESS_KEY_FRONTEND_REGISTRY` | Secret of a AWS key that allows r/w access to the registry bucket |   yes    |
| `GH_REGISTRY_NPM_TOKEN`                   | Token for NPM package registry                                    |   yes    |

#### Outputs

| Name       | Description                                 |
| ---------- | ------------------------------------------- |
| tree_hash  | Tree hash of the code built                 |
| bundle_uri | S3 URI of the bundle in the registry bucket |

#### Example Use

```yml
build:
  uses: pleo-oss/pleo-spa-cicd/workflows/build.yml@v2
  secrets: inherit
  with:
    app_name: my-app
    build_script: build:app
    build_dir: dist
    bucket_name: my-registry-bucket
```

### Deploy

Copies the output files from the registry to the origin S3 bucket and updates
the cursor file for the current branch.

#### Inputs

| Name                | Description                                     | Type     | Default    | Required |
| ------------------- | ----------------------------------------------- | -------- | ---------- | :------: |
| `environment`       | Name of the deployment environment              | `string` | n/a        |   yes    |
| `bundle_uri`        | S3 URI of the bundle in the registry bucket     | `string` | n/a        |   yes    |
| `tree_hash`         | Tree hash of the code to deploy                 | `string` | n/a        |   yes    |
| `bucket_name`       | Name of the S3 origin bucket                    | `string` | n/a        |   yes    |
| `domain_name`       | Domain name for the app (e.g. app.example.com)  | `string` | n/a        |   yes    |
| `inject_config_cmd` | Command to run to inject the environment config | `string` | n/a        |    no    |
| `registry_scope`    | Org scope for the GitHub Package Registry       | `string` | `@pleo-io` |    no    |

#### Secrets

Use the
[`secrets: inherit`](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#onworkflow_callsecretsinherit)
options when using the workflow.

| Name                                      | Description                                                        | Required |
| ----------------------------------------- | ------------------------------------------------------------------ | :------: |
| `AWS_ACCESS_KEY_ID_FRONTEND_REGISTRY`     | ID of a AWS key that allows read access to the registry bucket     |   yes    |
| `AWS_SECRET_ACCESS_KEY_FRONTEND_REGISTRY` | Secret of a AWS key that allows read access to the registry bucket |   yes    |
| `AWS_ACCESS_KEY_ID_ORIGIN`                | ID of a AWS key that allows r/w access to the origin bucket        |   yes    |
| `AWS_SECRET_ACCESS_KEY_ORIGIN`            | Secret of a AWS key that allows r/w access to the origin bucket    |   yes    |

#### Outputs

| Name           | Description                              |
| -------------- | ---------------------------------------- |
| deployment_url | URL where the deployment can be accessed |

#### Example Use

```yml
deploy:
  uses: pleo-oss/pleo-spa-cicd/workflows/deploy.yml@v2
  needs: build
  secrets: inherit
  with:
    environment: staging
    bundle_uri: ${{ needs.build.outputs.bundle_uri }}
    tree_hash: ${{ needs.build.outputs.tree_hash }}
    bucket_name: my-origin-bucket
    domain_name: app.staging.example.com
    inject_config_cmd: yarn apply:config --env staging
```
