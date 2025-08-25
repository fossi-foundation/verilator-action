import * as core from "@actions/core";
import * as github from "@actions/github";
import * as exec from "@actions/exec"
import * as devbox from "./devbox.js";

try {
    const version = core.getInput("version");
    const args = core.getInput("arguments");
    core.info(`Requested Verilator version ${version}`);

    let pkg_version = await devbox.check_pkg_version("verilator", version);
    core.info(`Resolved Verilator version ${pkg_version}`);

    await devbox.install_devbox("latest");

    await exec.exec('devbox init');
    await exec.exec(`devbox add verilator@${pkg_version}`);
    await exec.exec(`devbox run verilator ${args}`);

    await devbox.cache_nix();
} catch (error) {
    core.setFailed(error.message);

    await devbox.cache_nix();
}