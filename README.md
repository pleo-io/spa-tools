<h1 align="center">
  🔋 Pleo SPA Tools
</h1>

💡 A collection of reusable tools for delivering Single Page Applications,
including AWS-based infrastructure, GitHub Actions CI/CD and runtime config.

👨‍🔧 This repository is lovingly stewarded by Pleo's Web Core team.

🐛 Issues should be reported
[in the repository](https://github.com/pleo-io/pleo-tools/issues) or via
[Stewards: SPA Tools](https://linear.app/pleo/project/stewards-spa-tools-53a0a536f855)
project on Linear (if you have access).

## Contents

- [Custom GitHub Actions](/actions)
- [Reusable GitHub Workflows](/reusable-workflows)
- [Runtime Config Injection Tooling](./config-inject)
- [Terraform Module](./terraform-module)
- [Lambda@Edge Lambdas](/terraform-module/edge-lambdas)

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
