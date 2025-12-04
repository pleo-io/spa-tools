<h1 align="center">
  🔋 Pleo SPA Tools
</h1>

💡 Terraform modules for deploying Single Page Applications on AWS infrastructure.

👨‍🔧 This repository is lovingly stewarded by Pleo's Web Core team.

🐛 Issues should be reported
[in the repository](https://github.com/pleo-io/pleo-tools/issues) or via
[Stewards: SPA Tools](https://linear.app/pleo/project/stewards-spa-tools-53a0a536f855)
project on Linear (if you have access).

## Contents

- [Terraform Module](./terraform-module) - Main Terraform module for SPA deployment
- [Lambda@Edge Functions](/terraform-module/edge-lambdas) - CloudFront Lambda@Edge functions

## Contributing

This repo uses Semantic Release via
[Release Please](https://github.com/google-github-actions/release-please-action)
to version the changes and keep an up-to-date changelog file. When creating a
PR, make sure that the squash commit title (i.e. the PR title) follows the
semantic commit standards.

When your PR with package changes is merged, Release Please will create another
PR that updates package version and changelog.

The release PR needs to be manually
[closed and re-opened](https://github.com/peter-evans/create-pull-request/blob/main/docs/concepts-guidelines.md#workarounds-to-trigger-further-workflow-runs)
in order to run CI checks. ⚠️
