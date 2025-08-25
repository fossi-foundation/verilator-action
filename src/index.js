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

        options.listeners = {
            stdout: (data) => {
                stdOut += data.toString();
            },
            stderr: (data) => {
                const warningMatch = data.toString().match(/^.Warning-(.+): (.+):(\d+):(\d+): (.*)\R/);
                if (warningMatch) {
                    warnings.push({
                        type: warningMatch[1],
                        file: warningMatch[2],
                        message: warningMatch[5],
                        line: parseInt(warningMatch[3]),
                        column: parseInt(warningMatch[4])
                    });
                }
                stdErr += data.toString();
            }
        };
        options.ignoreReturnCode = true;
        const waivers = lintWaivers ? `-f ${lintWaivers}` : '';
        let ret = await exec.exec(`devbox run verilator --lint-only ${lintFiles} ${waivers} ${args}`, [], options);

        if (ret != 0) {
            warnings.forEach(warning => {
                const annotationProperties = {
                    title: warning.message,
                    file: warning.file,
                    startLine: warning.line,
                    endLine: warning.line,
                    startColumn: warning.column,
                    endColumn: warning.column
                };
                core.warning(warning.message, annotationProperties);
            });
        }
    }

    await lib.cache_nixstore();
} catch (error) {
    core.setFailed(error.message);
}