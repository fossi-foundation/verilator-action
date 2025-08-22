# Action to run Verilator

Run Verilator at a specific version. It uses Nix and its wrapper devbox to run the requested version at low overhead.


## Example Workflow

```
name: Try Verilator

on: push

jobs:
  verilator-version:
    name: Verilator version
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      - name: Verilator version
        uses: fossi-foundation/verilator-action
        with:
          version: latest
          arguments: '--version'
```

## Configure Action

### Action Inputs

| Input argument | description                                                                                    | default               |
| -------------- | ---------------------------------------------------------------------------------------------- | --------------------- |
| version        | The version of Verilator to run. Can be a specific version or `latest` for the latest release. | `latest`              |
| arguments      | The arguments to pass to Verilator.                                                            | none                  |