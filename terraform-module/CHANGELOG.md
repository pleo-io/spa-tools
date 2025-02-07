# Changelog

## [3.3.0](https://github.com/pleo-io/spa-tools/compare/terraform-module-v3.2.1...terraform-module-v3.3.0) (2025-02-07)


### Features

* Add support for deploying Telescope using spa-tools ([#273](https://github.com/pleo-io/spa-tools/issues/273)) ([8992257](https://github.com/pleo-io/spa-tools/commit/89922576e825ba41027415754e7da6e10a913b5e))

## [3.2.1](https://github.com/pleo-io/spa-tools/compare/terraform-module-v3.2.0...terraform-module-v3.2.1) (2024-09-11)


### Bug Fixes

* Support turbo hash in preview deploy URLs ([#251](https://github.com/pleo-io/spa-tools/issues/251)) ([c18a89d](https://github.com/pleo-io/spa-tools/commit/c18a89d130d94842dd598d38047ad6e7846a3f6a))

## [3.2.0](https://github.com/pleo-io/spa-tools/compare/terraform-module-v3.1.1...terraform-module-v3.2.0) (2024-08-22)


### Features

* Move github-deployment-env to spa terraform-modules ([#246](https://github.com/pleo-io/spa-tools/issues/246)) ([e0a2792](https://github.com/pleo-io/spa-tools/commit/e0a27924317d50e3e37a2a2359cc5bce92fcfa9c))

## [3.1.1](https://github.com/pleo-io/spa-tools/compare/terraform-module-v3.1.0...terraform-module-v3.1.1) (2024-06-14)


### Bug Fixes

* **deps:** Update Github provider to version 5 ([#232](https://github.com/pleo-io/spa-tools/issues/232)) ([ab193af](https://github.com/pleo-io/spa-tools/commit/ab193afe97d5d3de126457c13779d2169d41f787))

## [3.1.0](https://github.com/pleo-io/spa-tools/compare/terraform-module-v3.0.0...terraform-module-v3.1.0) (2024-03-26)


### Features

* update reusable-workflows ([baba061](https://github.com/pleo-io/spa-tools/commit/baba061d59b3950cc48d9eeb09b442f42661c420))

## [3.0.0](https://github.com/pleo-io/spa-tools/compare/terraform-module-v2.5.0...terraform-module-v3.0.0) (2024-01-22)


### ⚠ BREAKING CHANGES

* Remove "Translation" addon ([#198](https://github.com/pleo-io/spa-tools/issues/198))

### Miscellaneous Chores

* Remove "Translation" addon ([#198](https://github.com/pleo-io/spa-tools/issues/198)) ([34f4d49](https://github.com/pleo-io/spa-tools/commit/34f4d49b32d7272713ab0f794021f13fa7eeaf2a))

## [2.5.0](https://github.com/pleo-io/spa-tools/compare/terraform-module-v2.4.2...terraform-module-v2.5.0) (2023-09-21)


### Features

* add variable to disable indexing ([#149](https://github.com/pleo-io/spa-tools/issues/149)) ([b112aac](https://github.com/pleo-io/spa-tools/commit/b112aaca62c7233cd7760c319a2d24575b331e58))

## [2.4.2](https://github.com/pleo-io/spa-tools/compare/terraform-module-v2.4.1...terraform-module-v2.4.2) (2023-09-05)


### Bug Fixes

* S3 bucket creation ([#129](https://github.com/pleo-io/spa-tools/issues/129)) ([d4f58c3](https://github.com/pleo-io/spa-tools/commit/d4f58c3ae45d9e85f8acee0089dde251f8782ca7))

## [2.4.1](https://github.com/pleo-io/spa-tools/compare/terraform-module-v2.4.0...terraform-module-v2.4.1) (2023-08-23)


### Bug Fixes

* Don't set ACLs on newly created S3 bucket ([#120](https://github.com/pleo-io/spa-tools/issues/120)) ([b49e7cf](https://github.com/pleo-io/spa-tools/commit/b49e7cfaad1c217c56636bb081eabbd07d018588))

## [2.4.0](https://github.com/pleo-io/spa-tools/compare/terraform-module-v2.3.0...terraform-module-v2.4.0) (2023-06-27)


### Features

* Upgrade actions from node 16 to 20 ([#104](https://github.com/pleo-io/spa-tools/issues/104)) ([dfb298c](https://github.com/pleo-io/spa-tools/commit/dfb298c41d07013afa1f28e41bcb5bb160de76f6))

## [2.3.0](https://github.com/pleo-io/spa-tools/compare/terraform-module-v2.2.0...terraform-module-v2.3.0) (2023-05-28)


### Features

* Use Cloudfront response headers policy ([#87](https://github.com/pleo-io/spa-tools/issues/87)) ([0f6522f](https://github.com/pleo-io/spa-tools/commit/0f6522f690fcac25188a544c7b0e137e724472ac))

## [2.2.0](https://github.com/pleo-io/spa-tools/compare/terraform-module-v2.1.0...terraform-module-v2.2.0) (2023-05-22)


### Features

* Add X-Pleo-SPA-Version header to the HTML response ([#86](https://github.com/pleo-io/spa-tools/issues/86)) ([eef1ffd](https://github.com/pleo-io/spa-tools/commit/eef1ffd934a7a1fbe6202d6d7cd83f988d10bf2a))

## [2.1.0](https://github.com/pleo-io/spa-tools/compare/terraform-module-v2.0.0...terraform-module-v2.1.0) (2023-05-11)


### Features

* Move edge lambda code to terraform-module package ([#83](https://github.com/pleo-io/spa-tools/issues/83)) ([6d63fe0](https://github.com/pleo-io/spa-tools/commit/6d63fe01992bb18d53f634acdc7b259a26a5c34a))

## [2.0.0](https://github.com/pleo-io/spa-tools/compare/terraform-module-v1.4.0...terraform-module-v2.0.0) (2023-05-08)


### ⚠ BREAKING CHANGES

* Update version of the runtime to Node 18 ([#75](https://github.com/pleo-io/spa-tools/issues/75))

### Features

* Update version of the runtime to Node 18 ([#75](https://github.com/pleo-io/spa-tools/issues/75)) ([5f4a25e](https://github.com/pleo-io/spa-tools/commit/5f4a25ecf3f38ddb2ad5d5850425b648a2ea7223))

## [1.4.0](https://github.com/pleo-io/pleo-spa-cicd/compare/terraform-module-v1.3.0...terraform-module-v1.4.0) (2023-05-04)


### Features

* Merge with infra repo ([#71](https://github.com/pleo-io/pleo-spa-cicd/issues/71)) ([cf9ea0e](https://github.com/pleo-io/pleo-spa-cicd/commit/cf9ea0e7069ef2b844206c782e5a536fdb077f1c))
