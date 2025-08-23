import * as core from "@actions/core";
import * as github from "@actions/github";

import * as devbox from "./devbox.js";

try {
  const version = core.getInput("version");
  core.info(`Requested Verilator version ${version}`);

  devbox.check_pkg_version("verilator");

} catch (error) {
  core.setFailed(error.message);
}