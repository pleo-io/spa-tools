<h1 align="center">
  🔋 Pleo SPA CI/CD - GitHub Actions
</h1>

[Custom JS GitHub actions](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action)
which help implementing a CI/CD pipeline described in this repository.

## Actions

| Name                                                     | Description                                                                              |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --- |
| [cursor-deploy](./cursor-deploy)                         | Performs a deployment by updating a cursor file in an S3 bucket.                         |
| [post-preview-urls](./post-preview-urls)                 | Update PR description with the links to the latest preview deployment.                   |     |
| [translation-cursor-deploy](./translation-cursor-deploy) | Performs a deployment by updating a cursor file in an S3 bucket - used for translations. |

## Contributing

Each action is written in TypeScript and bundled into a single JS file using
[`@vercel/ncc`](https://github.com/vercel/ncc). Note that we version the generated JS files in the
repo, so you need to run the build locally and include the changes to the built actions in your PR.

To build the actions, run `make build`. Tests, written in Jest, you can run them with `make test`.

Currently we need to manually update the version (to the next version) for actions in the
`.workflows` folder. `git grep 'pleo.*@v' .github/workflows/*.yml` will highligh the places to
change.
