import * as core from "@actions/core";
import * as github from "@actions/github";

import * as devbox from "./devbox.js";

try {
    const version = core.getInput("version");
    core.info(`Requested Verilator version ${version}`);

    let pkg_version = await devbox.check_pkg_version("verilator", version);
    if (pkg_version === null) {
            throw new Error(`Could not resolve Verilator version ${version}`);
    }
    core.info(`Resolved Verilator version ${pkg_version}`);

} catch (error) {
    core.setFailed(error.message);
}