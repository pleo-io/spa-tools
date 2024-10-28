# Changelog

## [13.0.0](https://github.com/pleo-io/spa-tools/compare/reusable-workflows-v12.2.1...reusable-workflows-v13.0.0) (2024-10-28)


### ⚠ BREAKING CHANGES

* Distinguish between "Pleo" env and Github env in deployment ([#267](https://github.com/pleo-io/spa-tools/issues/267))

### Bug Fixes

* Distinguish between "Pleo" env and Github env in deployment ([#267](https://github.com/pleo-io/spa-tools/issues/267)) ([158c9ef](https://github.com/pleo-io/spa-tools/commit/158c9eff6d215e988eb56bf926b5e088826ba2e4))

## [12.2.1](https://github.com/pleo-io/spa-tools/compare/reusable-workflows-v12.2.0...reusable-workflows-v12.2.1) (2024-10-18)


### Bug Fixes

* Install dependencies in deploy workflow ([#265](https://github.com/pleo-io/spa-tools/issues/265)) ([5de4ae4](https://github.com/pleo-io/spa-tools/commit/5de4ae40c8f35b40ab553590abcef6391d92078c))

## [12.2.0](https://github.com/pleo-io/spa-tools/compare/reusable-workflows-v12.1.0...reusable-workflows-v12.2.0) (2024-10-16)


### Features

* support specifying rootDir in config inject script ([#263](https://github.com/pleo-io/spa-tools/issues/263)) ([686deb1](https://github.com/pleo-io/spa-tools/commit/686deb1379872c58c2d6f15f488a955a18e20f60))

## [12.1.0](https://github.com/pleo-io/spa-tools/compare/reusable-workflows-v12.0.3...reusable-workflows-v12.1.0) (2024-10-14)


### Features

* Adjust preview links name to integrate them with Linear ([#261](https://github.com/pleo-io/spa-tools/issues/261)) ([d058db3](https://github.com/pleo-io/spa-tools/commit/d058db37634c72a2407fbe483442a314bfeb5b8f))

## [12.0.3](https://github.com/pleo-io/spa-tools/compare/reusable-workflows-v12.0.2...reusable-workflows-v12.0.3) (2024-09-27)


### Bug Fixes

* Always deploy version when workflow runs on default branch ([#259](https://github.com/pleo-io/spa-tools/issues/259)) ([e88e4ab](https://github.com/pleo-io/spa-tools/commit/e88e4abaf5d58a6bfffc565b7ecb193db0ed1a98))

## [12.0.2](https://github.com/pleo-io/spa-tools/compare/reusable-workflows-v12.0.1...reusable-workflows-v12.0.2) (2024-09-19)


### Bug Fixes

* Improve post cleanup job for caching node_modules ([#257](https://github.com/pleo-io/spa-tools/issues/257)) ([149ef6b](https://github.com/pleo-io/spa-tools/commit/149ef6b5cbb87e2c1f3c695b0833ba2b6676f7a0))

## [12.0.1](https://github.com/pleo-io/spa-tools/compare/reusable-workflows-v12.0.0...reusable-workflows-v12.0.1) (2024-09-13)


### Bug Fixes

* if statements in deploy reusable workflow ([#255](https://github.com/pleo-io/spa-tools/issues/255)) ([9ea7ea7](https://github.com/pleo-io/spa-tools/commit/9ea7ea78612df14b62905527b1a385deb07712a6))

## [12.0.0](https://github.com/pleo-io/spa-tools/compare/reusable-workflows-v11.3.1...reusable-workflows-v12.0.0) (2024-09-13)


### ⚠ BREAKING CHANGES

* Support using custom hash for build and deploy workflows ([#253](https://github.com/pleo-io/spa-tools/issues/253))

### Features

* Support using custom hash for build and deploy workflows ([#253](https://github.com/pleo-io/spa-tools/issues/253)) ([05514c0](https://github.com/pleo-io/spa-tools/commit/05514c0cd3129f89ab4d0c93cbf325e8b730821a))

## [11.3.1](https://github.com/pleo-io/spa-tools/compare/reusable-workflows-v11.3.0...reusable-workflows-v11.3.1) (2024-09-09)


### Bug Fixes

* Change default runner for build reusable workflow ([#249](https://github.com/pleo-io/spa-tools/issues/249)) ([1268317](https://github.com/pleo-io/spa-tools/commit/12683172fe9f268380e0416079d1efd90b78896f))

## [11.3.0](https://github.com/pleo-io/spa-tools/compare/reusable-workflows-v11.2.0...reusable-workflows-v11.3.0) (2024-07-02)


### Features

* Use 16 core runner for build step ([#243](https://github.com/pleo-io/spa-tools/issues/243)) ([b1fee0d](https://github.com/pleo-io/spa-tools/commit/b1fee0df87324c64b9ca9fb411b3a2d935f7160a))

## [11.2.0](https://github.com/pleo-io/spa-tools/compare/reusable-workflows-v11.1.2...reusable-workflows-v11.2.0) (2024-06-20)


### Features

* Cache node_modules/.pnpm instead of the global store ([#236](https://github.com/pleo-io/spa-tools/issues/236)) ([277902c](https://github.com/pleo-io/spa-tools/commit/277902c4c62552867f2f7252813e4b8bb351f3ca))

## [11.1.2](https://github.com/pleo-io/spa-tools/compare/reusable-workflows-v11.1.1...reusable-workflows-v11.1.2) (2024-06-20)


### Bug Fixes

* Avoid automatically using Remote Cache in all workflows ([#239](https://github.com/pleo-io/spa-tools/issues/239)) ([d193502](https://github.com/pleo-io/spa-tools/commit/d193502111b1f9fa6f39061cd914d9a976198d09))

## [11.1.1](https://github.com/pleo-io/spa-tools/compare/reusable-workflows-v11.1.0...reusable-workflows-v11.1.1) (2024-06-20)


### Bug Fixes

* Remove debug log of turbo token ([#237](https://github.com/pleo-io/spa-tools/issues/237)) ([8301e60](https://github.com/pleo-io/spa-tools/commit/8301e60a3d4c67e046c304300bd5314e52e72e90))

## [11.1.0](https://github.com/pleo-io/spa-tools/compare/reusable-workflows-v11.0.2...reusable-workflows-v11.1.0) (2024-06-18)


### Features

* Add support for Turborepo Remote Cache to the build workflow ([#234](https://github.com/pleo-io/spa-tools/issues/234)) ([1a7335c](https://github.com/pleo-io/spa-tools/commit/1a7335cf85936f7af2754b1e892bc6b8c60ce606))

## [11.0.2](https://github.com/pleo-io/spa-tools/compare/reusable-workflows-v11.0.1...reusable-workflows-v11.0.2) (2024-06-03)


### Bug Fixes

* **deps:** update spa-github-actions to latest ([#228](https://github.com/pleo-io/spa-tools/issues/228)) ([5270e3e](https://github.com/pleo-io/spa-tools/commit/5270e3e45bc5df8c59e0af36c0af43881c4c826b))

## [11.0.1](https://github.com/pleo-io/spa-tools/compare/reusable-workflows-v11.0.0...reusable-workflows-v11.0.1) (2024-06-03)


### Bug Fixes

* **deps:** udpate actions/checkout to trigger a new release ([#226](https://github.com/pleo-io/spa-tools/issues/226)) ([b1c7753](https://github.com/pleo-io/spa-tools/commit/b1c775345fdd09c13b039dc3355dbf7b6192db66))

## [11.0.0](https://github.com/pleo-io/spa-tools/compare/reusable-workflows-v10.3.0...reusable-workflows-v11.0.0) (2024-04-30)


### ⚠ BREAKING CHANGES

* update actions in spa-tools to versions using node 20 ([#213](https://github.com/pleo-io/spa-tools/issues/213))

### Miscellaneous Chores

* update actions in spa-tools to versions using node 20 ([#213](https://github.com/pleo-io/spa-tools/issues/213)) ([7aaba39](https://github.com/pleo-io/spa-tools/commit/7aaba39e91017408078c406d12bfd5d6b70cd5d6))

## [10.3.0](https://github.com/pleo-io/spa-tools/compare/reusable-workflows-v10.2.0...reusable-workflows-v10.3.0) (2024-03-26)


### Features

* update reusable-workflows ([baba061](https://github.com/pleo-io/spa-tools/commit/baba061d59b3950cc48d9eeb09b442f42661c420))

## [10.2.0](https://github.com/pleo-io/spa-tools/compare/reusable-workflows-v10.1.0...reusable-workflows-v10.2.0) (2024-03-12)


### Features

* Update to latest spa-github-actions version ([#205](https://github.com/pleo-io/spa-tools/issues/205)) ([c5c5949](https://github.com/pleo-io/spa-tools/commit/c5c594927481efecef46e7f898e6b47d8b24d485))

## [10.1.0](https://github.com/pleo-io/spa-tools/compare/reusable-workflows-v10.0.0...reusable-workflows-v10.1.0) (2023-12-20)


### Features

* Allow production deploy from emergency branch ([#196](https://github.com/pleo-io/spa-tools/issues/196)) ([1e5ef73](https://github.com/pleo-io/spa-tools/commit/1e5ef73a6fc9456c3857d497f05579302c39eac5))

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
