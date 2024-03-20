# jupyterlab_nebari_mode

[![Github Actions Status](https://github.com/nebari-dev/jupyterlab-nebari-mode/workflows/Build/badge.svg)](https://github.com/nebari-dev/jupyterlab-nebari-mode/actions/workflows/build.yml)
[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/nebari-dev/jupyterlab-nebari-mode/main?urlpath=lab)

Nebari customizations for JupyterLab.

## Plugins

- `jupyterlab-nebari-mode:logo`: replaces `@jupyterlab/application-extension:logo`, adding clickable Nebari logo:
  ![](https://raw.githubusercontent.com/nebari-dev/jupyterlab-nebari-mode/main/ui-tests/tests/jupyterlab_nebari_mode.spec.ts-snapshots/top-panel-linux.png)
- `jupyterlab-nebari-mode:commands` adds the following commands:
  - `nebari:open-proxy` which opens proxied processes, such as VSCode; this command can be used to add a menu entry, e.g.:
    ```json
    {
      "command": "nebari:open-proxy",
      "rank": 1,
      "args": {
        "name": "vscode"
      }
    }
    ```
  - `nebari:run-first-enabled` which runs the first available and enabled command; it differs from the built-in `apputils:run-first-enabled` command in that it takes a list of objects representing the commands, allowing to customise the `label`, `iconClass`, `caption`, `usage`, and `className` properties. An example usage for menu customization would be adding a menu entry labelled `Import numpy in File Editor` when user has the File Editor open and `Import numpy in Notebook` when user has a Notebook open:
    ```json
    {
      "command": "nebari:run-first-enabled",
      "rank": 1,
      "args": {
        "commands": [
          {
            "id": "fileeditor:replace-selection",
            "label": "Import numpy in File Editor",
            "args": { "text": "import numpy as np" }
          },
          {
            "id": "notebook:replace-selection",
            "label": "Import numpy in Notebook",
            "args": { "text": "import numpy as np" }
          }
        ]
      }
    }
    ```

## Requirements

- JupyterLab >= 4.0.0

## Install

To install the extension, execute:

```bash
pip install jupyterlab_nebari_mode
```

## Uninstall

To remove the extension, execute:

```bash
pip uninstall jupyterlab_nebari_mode
```

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the jupyterlab_nebari_mode directory
# Install package in development mode
pip install -e "."
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Development uninstall

```bash
pip uninstall jupyterlab_nebari_mode
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `jupyterlab-nebari-mode` within that folder.

### Testing the extension

#### Frontend tests

This extension is using [Jest](https://jestjs.io/) for JavaScript code testing.

To execute them, execute:

```sh
jlpm
jlpm test
```

#### Integration tests

This extension uses [Playwright](https://playwright.dev/docs/intro) for the integration tests (aka user level tests).
More precisely, the JupyterLab helper [Galata](https://github.com/jupyterlab/jupyterlab/tree/master/galata) is used to handle testing the extension in JupyterLab.

More information are provided within the [ui-tests](./ui-tests/README.md) README.

### Packaging the extension

See [RELEASE](RELEASE.md)
