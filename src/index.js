import * as core from "@actions/core";
import * as github from "@actions/github";
import * as exec from "@actions/exec"
import * as devbox from "./devbox.js";

try {
    const version = core.getInput("version");
    const args = core.getInput("arguments");
    const workingDirectory = core.getInput("working-directory");
    const run = core.getInput("run");
    const lintFiles = core.getInput("lint-files");

    if ((lintFiles && (args || run)) || (args && run)) {
        throw new Error("You can only specify one of 'arguments', 'run' or 'lint-files'");
    }

    core.info(`Requested Verilator version ${version}`);
    let pkg_version = await devbox.check_pkg_version("verilator", version);
    core.info(`Resolved Verilator version ${pkg_version}`);

    await devbox.install_devbox();

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
                core.warning(`logerr: ${data.toString()}`);
                const warningMatch = data.toString().match(/^.Warning-(.+): (.+):(\d+):(\d+): (.*)\R/);
                if (warningMatch) {
                    warnings.push({
                        type: warningMatch[0],
                        file: warningMatch[1],
                        message: warningMatch[5],
                        line: parseInt(warningMatch[3]),
                        column: parseInt(warningMatch[4])
                    });
                }
                stdErr += data.toString();
            }
        };
        options.ignoreReturnCode = true;
        let ret = await exec.exec(`devbox run verilator --lint-only ${lintFiles}`, [], options);

        if (ret != 0) {
            core.warning(`Verilator lint found issues`);
            warnings.forEach(warning => {
                const annotationProperties = {
                    title: warning.type,
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

    await devbox.cache_nix();
} catch (error) {
    core.setFailed(error.message);

    await devbox.cache_nix();
}