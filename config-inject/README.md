## scripts/app-config

SPA Config Inject is set of tools that help you apply configurations to Single Page Application
(SPA) HTML template files. This allows you to build environment-agnostic bundles once and then
deploy the same bundle to different environments. This saves CI/CD time and ensures you deploy the
same code you tested.

Available tools are:

-   **CLI** Given the location of the SPA index HTML file this script reads the config file and
    inlines the config as a string within the HTML file in a selected slot. The interpolated file is
    saved and ready for deployment.
-   **Vite Plugin** In local development a Vite plugin injects local configuration. It's possible to
    selectively override the default local config via a git-ignored override file.
-   **Runtime config helper** Allows you to easily extract and use the injected config in your app.

## Installation

```sh
$ pnpm add @pleo-io/spa-config-inject
```

## Project Setup

> See the `example` directory for a sample project that uses this package in a recommended way.

Your SPA project needs to fulfill a few assumptions:

-   Configuration files as `mjs` modules under a common directory, following `config.{env}.mjs`
    naming convention. Config modules have a `config` named export which is an object containing
    configuration values. The object can be arbitrary nested, but needs to be JSON-serialisable.
-   `config.local.mjs` exists and contains configuration used during local development.

Furthermore, we recommend:

1. Have a `config.ts` file which defines the shape of your config, e.g.:

```ts
// config/config.ts
export type AppConfig = {
    env: 'staging' | 'production' | 'local'
    version: string
    nested: {
        boi: string
    }
}
```

Then in your per-env config files use use TypeScript via JSDocs annotations, e.g.:

```mjs
// @ts-check
/**
 * @type {import("./config").AppConfig}
 */
export const config = {
    env: 'staging',
    version: '__INJECTED__',
    nested: {
        boi: 'wat'
    }
}
```

2. Consume the config in your app through a module exposing the typed config:

```ts
// config/index.ts
import {getConfig} from '@pleo-io/spa-config-inject'
import type {AppConfig} from './config'

export default getConfig<AppConfig>()
```

Then in your app code:

```ts
// some-file.ts
import config from './config'

let boi = config.nested.boi // string
```

## Configuration

Configure the tool by adding a `spaConfig` namespace to your `package.json` file. The configuration
options are as follows:

-   `configDir` (string, required): The location of your app configuration files.
-   `buildDir` (string, required): The location of the HTML template file. Can be overridden with
    `SPA_BUILD_DIR` env var
-   `templateFileName` (string, optional, default: `_index.html`): The name of the template HTML
    file (relative to build dir). Can be overridden with `SPA_TEMPLATE_FILE_NAME` env var
-   `outputFileName` (string, optional, default: `index.html`): The name of the output HTML file
    (relative to build dir). Can be overridden with `SPA_OUTPUT_FILE_NAME` env var
-   `localConfigOverrideFile` (string, optional, default: `config.local.json`): The name of the
    local development config override file.

## Vite plugin

To inject the local config when running the app locally, add the Vite plugin to your Vite config:

```ts
import {defineConfig} from 'vite'
import {inlineLocalConfig} from '@pleo-io/spa-config-inject/vite'

export default defineConfig((config) => {
    return {
        plugins: [inlineLocalConfig({isDisabled: config.mode === 'production'})]
    }
})
```

Options that can be passed to `inlineLocalConfig`:

-   `isDisabled`: Disables the plugin - usually in production mode (defaults to false)
-   `env`: The name of the environment for which the config is injected (defaults to `local`)

## Local overrides

When running the app in local mode the first time, an empty `config.local.json` (or another name if
you configure it via `localConfigOverrideFile` option) will be created at the root of the project.
This file allows you to temporarily override the local config (e.g. change an API route) without
having to remember to undo your changes before committing. Remember to add that file to `.gitignore`
as it's not supposed to be versioned.

## CLI Usage

In your CD flow you'll need to run the CLI for each environment you deploy to, in order to generate
the HTML with baked in config for that env.

```sh
$ npx @pleo-io/spa-config-inject <env>
```

Usually you'll also want to add some dynamic overrides based on your CD run, e.g. adding a version:

```sh
$ SPA_CONFIG_OVERRIDE="{\"version\": \"abcd\"}" npx @pleo-io/spa-config-inject staging
```

### Options

Required:

-   `<env>`: The environment of the config to inject. Can also be provided via `SPA_ENV` env var.

Optional:

-   `SPA_CONFIG_OVERRIDE` (set as env variable): dynamic config override as a JSON string
