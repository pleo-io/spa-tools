<h1 align="center">
  🔋 Pleo SPA CI/CD
</h1>

💡 A collection of reusable GitHub Actions and Workflows helpful while building
a complete CI/CD pipeline for a Single Page Application using the cursor files.

👨‍🔧 This repository is lovingly stewarded by Pleo's Web Core team.

🐛 Issues should be reported
[in the repository](https://github.com/pleo-oss/pleo-spa-cicd/issues) or via
[Stewards: Frontend Infrastructure](https://linear.app/pleo/project/stewards-spa-cicd-and-infra-53a0a536f855)
project on Linear (if you have access).

## Contents

- [Custom GitHub Actions](/actions)
- [Reusable GitHub Workflows](/.github/workflows)

## Contributing

This repo uses Semantic Release to version the changes and keep an up-to-date
changelog file. When creating a PR, make sure that the squash commit title
(i.e. the PR title) follows the semantic commit standards.

Due to GitHub reusable workflow limitations, any changes needs to be made on
the [pleo-oss/pleo-spa-cicd](https://github.com/pleo-oss/pleo-spa-cicd)
repository, but after merging to `main` the changes are manually mirrored to
[pleo-io/pleo-spa-cicd](https://github.com/pleo-io/pleo-spa-cicd) by running:

```sh
git push --mirror https://github.com/pleo-io/pleo-spa-cicd
```
