import * as core from "@actions/core";
import * as github from "@actions/github";
import * as exec from "@actions/exec"
import * as lib from "@fossi-foundation/github-action-lib"

try {
    const version = core.getInput("version");
    const args = core.getInput("arguments");
    const workingDirectory = core.getInput("working-directory");
    const run = core.getInput("run");
    const lintFiles = core.getInput("lint-files");
    const lintWaivers = core.getInput("lint-waivers");

    if (lintFiles && run) {
        throw new Error("You can only specify one of 'run' or 'lint-files'");
    }
    if (run && args) {
        throw new Error("You can only specify one of 'run' or 'arguments'");
    }

    core.info(`Requested Verilator version ${version}`);
    let pkg_version = await lib.devbox_check_pkg_version("verilator", version);
    core.info(`Resolved Verilator version ${pkg_version}`);

    await lib.nix_ensure();
    await lib.devbox_ensure();
    await lib.restore_nixstore();

    const options = {}
    if (workingDirectory) {
        options.cwd = workingDirectory;
    }

    core.startGroup("Prepare environment");
    await exec.exec('devbox init', [], options);
    await exec.exec(`devbox add verilator@${pkg_version}`, [], options);
    await exec.exec(`devbox add zlib -o dev`, [], options);
    core.endGroup();

    if (args) {
        await exec.exec(`devbox run verilator ${args}`, [], options);
    }

    if (run) {
        await exec.exec(`devbox run ${run}`, [], options);
    }

    if (lintFiles) {
        let stdOut = '';
        let stdErr = '';

        const options = {};

        let warnings = [];
        let errors = [];

        options.listeners = {
            stdout: (data) => {
                stdOut += data.toString();
            },
            stderr: (data) => {
                const match = data.toString().match(/^.(Warning|Error)-(.+): (.+):(\d+):(\d+): (.+)$/m);
                if (match) {
                    const annotationProperties = {
                        title: `Verilator Lint ${match[1]}`,
                        file: match[3],
                        startLine: parseInt(match[4]),
                        endLine: parseInt(match[4]),
                        startColumn: parseInt(match[5]),
                        endColumn: parseInt(match[5])
                    };
                    if (match[1] === "Warning") {
                        warnings.push([annotationProperties,match[6]]);
                    } else {
                        errors.push([annotationProperties,match[6]]);
                    }
                }
                stdErr += data.toString();
            } 
        };
        options.ignoreReturnCode = true;
        let ret = await exec.exec(`devbox run verilator --lint-only ${lintFiles} ${lintWaivers} ${args}`, [], options);

        if (ret != 0) {
            warnings.forEach(warning => {
                const [annotationProperties, message] = warning;
                core.warning(message, annotationProperties);
            });
            errors.forEach(error => {
                const [annotationProperties, message] = error;
                core.error(message, annotationProperties);
            });
        }
    }

    await lib.cache_nixstore();
} catch (error) {
    core.setFailed(error.message);
}