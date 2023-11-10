# Changelog

## [10.0.0](https://github.com/pleo-io/spa-tools/compare/reusable-workflows-v9.0.0...reusable-workflows-v10.0.0) (2023-11-10)


### ⚠ BREAKING CHANGES

* Remove now redundant env variables in spa-tools build workflow ([#186](https://github.com/pleo-io/spa-tools/issues/186))

### Miscellaneous Chores

* Remove now redundant env variables in spa-tools build workflow ([#186](https://github.com/pleo-io/spa-tools/issues/186)) ([bc590e9](https://github.com/pleo-io/spa-tools/commit/bc590e98e39c5ebce16fd2403252c814bbecbf64))

## [9.0.0](https://github.com/pleo-io/spa-tools/compare/reusable-workflows-v8.5.1...reusable-workflows-v9.0.0) (2023-10-31)


### ⚠ BREAKING CHANGES

* Update spa-tools build workflow to provide Datadog API key as env var ([#179](https://github.com/pleo-io/spa-tools/issues/179))

### Features

* Update spa-tools build workflow to provide Datadog API key as env var ([#179](https://github.com/pleo-io/spa-tools/issues/179)) ([d3978d4](https://github.com/pleo-io/spa-tools/commit/d3978d46d445a8359862b1c20a96762093bba35b))

## [8.5.1](https://github.com/pleo-io/spa-tools/compare/reusable-workflows-v8.5.0...reusable-workflows-v8.5.1) (2023-09-15)


### Bug Fixes

* add missing $ to artifact name template ([#142](https://github.com/pleo-io/spa-tools/issues/142)) ([66c2763](https://github.com/pleo-io/spa-tools/commit/66c2763bc6d3e7101913e233fa7b3551bda1a371))

## [8.5.0](https://github.com/pleo-io/spa-tools/compare/reusable-workflows-v8.4.0...reusable-workflows-v8.5.0) (2023-09-14)


### Features

* add environment suffix to github artifact ([#140](https://github.com/pleo-io/spa-tools/issues/140)) ([7f0680d](https://github.com/pleo-io/spa-tools/commit/7f0680dc668d67661fd10233be3b7177a766d479))

## [8.4.0](https://github.com/pleo-io/spa-tools/compare/reusable-workflows-v8.3.0...reusable-workflows-v8.4.0) (2023-06-27)


### Features

* Upgrade actions from node 16 to 20 ([#104](https://github.com/pleo-io/spa-tools/issues/104)) ([dfb298c](https://github.com/pleo-io/spa-tools/commit/dfb298c41d07013afa1f28e41bcb5bb160de76f6))

## [8.3.0](https://github.com/pleo-io/spa-tools/compare/reusable-workflows-v8.2.0...reusable-workflows-v8.3.0) (2023-06-06)


### Features

* Add handling of well-known/apple-app-site-association ([#97](https://github.com/pleo-io/spa-tools/issues/97)) ([29f74a9](https://github.com/pleo-io/spa-tools/commit/29f74a92f4700574215401e40c468ab77027048c))

## [8.2.0](https://github.com/pleo-io/pleo-spa-cicd/compare/reusable-workflows-v8.1.0...reusable-workflows-v8.2.0) (2023-05-04)


### Features

* Merge with infra repo ([#71](https://github.com/pleo-io/pleo-spa-cicd/issues/71)) ([cf9ea0e](https://github.com/pleo-io/pleo-spa-cicd/commit/cf9ea0e7069ef2b844206c782e5a536fdb077f1c))

## [8.1.0](https://github.com/pleo-io/pleo-spa-cicd/compare/reusable-workflows-v8.0.5...reusable-workflows-v8.1.0) (2023-04-20)


### Features

* Enable using npx with private registry for config command ([#62](https://github.com/pleo-io/pleo-spa-cicd/issues/62)) ([90d141a](https://github.com/pleo-io/pleo-spa-cicd/commit/90d141a18b765c9ede1a861d3f71fb73e25f4886))

## [8.0.5](https://github.com/pleo-io/pleo-spa-cicd/compare/reusable-workflows-v8.0.4...reusable-workflows-v8.0.5) (2023-04-18)


### Bug Fixes

* Upgrade even more actions ([#58](https://github.com/pleo-io/pleo-spa-cicd/issues/58)) ([788b13c](https://github.com/pleo-io/pleo-spa-cicd/commit/788b13cb4783acc0dd88304e5ddfd9704349d535))

## [8.0.4](https://github.com/pleo-io/pleo-spa-cicd/compare/reusable-workflows-v8.0.3...reusable-workflows-v8.0.4) (2023-04-18)


### Bug Fixes

* Also update s3-cache-action to avoid using set-state ([dcfa310](https://github.com/pleo-io/pleo-spa-cicd/commit/dcfa3100e11a4623b48eca2c28a80722b30ed9dd))

## [8.0.3](https://github.com/pleo-io/pleo-spa-cicd/compare/reusable-workflows-v8.0.2...reusable-workflows-v8.0.3) (2023-04-18)


### Bug Fixes

* Force another build ([#55](https://github.com/pleo-io/pleo-spa-cicd/issues/55)) ([d3e75e2](https://github.com/pleo-io/pleo-spa-cicd/commit/d3e75e284047c34e271d94f383e6400f553aa319))
* Force deploy ([afc5e83](https://github.com/pleo-io/pleo-spa-cicd/commit/afc5e838daee96bfb3c35ea00f21eac64e4f173d))
* Get rid of remaining set-output ([#54](https://github.com/pleo-io/pleo-spa-cicd/issues/54)) ([d5b89f1](https://github.com/pleo-io/pleo-spa-cicd/commit/d5b89f14d17984af6061378d28bfb77bc01dab62))
* Upgrade aws-credentials (node 16 by default) ([#52](https://github.com/pleo-io/pleo-spa-cicd/issues/52)) ([f684cf4](https://github.com/pleo-io/pleo-spa-cicd/commit/f684cf4db7896b06af854aed6b4375b3ed62c04c))
