# Action to run Verilator

Run Verilator at a specific version. It uses Nix and its wrapper devbox to run the requested version at low overhead.

Three modes are supported:

1. Run verilator with `<arguments>`
2. Run an arbitrary command in the environment with `run`
3. Lint code in a specific file or directory with `lint-files`

## Example Workflows

### Run with arguments

```
on: push

jobs:
  verilator-version:
    name: Verilator version
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      - name: Verilator version
        uses: fossi-foundation/verilator-action@v0.3
        with:
          version: latest
          run: '--version'
```

You can also set the working directory with the `working-directory` input.

### Run an arbitrary command in the environment with `run`

```
on: push

jobs:
    verilator-version:
      name: Verilator version
      runs-on: ubuntu-latest

      steps:
        - name: Checkout code
          uses: actions/checkout@v2
        - name: Verilator version
          uses: fossi-foundation/verilator-action@v0.3
          with:
            version: latest
            run: 'verilator --version'
  ```

You can also set the working directory with the `working-directory` input.

### Lint your code

This will nicely present the result of linting in GitHub.

```
on: push

jobs:
  verilator-version:
    name: Verilator version
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      - name: Verilator version
        uses: fossi-foundation/verilator-action@v0.3
        with:
          version: latest
          run: 'verilator --version'
  ```

You can also set the working directory with the `working-directory` input.

### Lint your code

This will nicely present the result of linting in GitHub.

```
on: push

jobs:
  verilator-version:
    name: Verilator version
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      - name: Verilator version
        uses: fossi-foundation/verilator-action@v0.3
        with:
          version: latest
          lint-files: 'src/mymodule.v'
```

You can set extra arguments for the Verilator command with the `arguments` input, and you can supply a waiver file with `lint-waivers`.

### Action Inputs

| Input argument    | description                                                                                    | default               |
| ----------------- | ---------------------------------------------------------------------------------------------- | --------------------- |
| version           | The version of Verilator to run. Can be a specific version or `latest` for the latest release. | `latest`              |
| working-directory | The working directory to run Verilator in.                                                     | `.`                   |
| arguments         | The arguments to pass to Verilator.                                                            | none                  |
| run               | An arbitrary command to run in the environment.                                                | none                  |
| lint-files        | A file or directory to lint.                                                                   | none                  |
| lint-waivers      | A file containing lint waivers.                                                                | none                  |