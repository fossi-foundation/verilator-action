import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as exec from "@actions/exec"
import * as cache from "@actions/cache";
import * as fs from "fs";

export async function check_pkg_version(pkgName, version) {
    const myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");

    const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
    };

    let resolvedVersion = null;
    await fetch(`https://search.devbox.sh/v2/resolve?name=${pkgName}&version=${version}`, requestOptions)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`${pkgName} not found at version ${version}`);
            }
            return response.json();
        })
        .then((data) => {
            resolvedVersion = data.version;
        });

    return resolvedVersion;
}

async function nix_ensure() {
    core.startGroup("Ensuring Nix is installed");
    if (!fs.existsSync(`/nix/var/nix/profiles/default/bin/nix`)) {
        let installerDir = tc.find('nix-installer', '3.8.6', process.arch);
        if (!installerDir) {
            core.info("Nix installer not cached. Downloading");
            let arch = process.arch === "arm64" ? "aarch64" : "x86_64";
            const installerFile = await tc.downloadTool(`https://github.com/DeterminateSystems/nix-installer/releases/download/v3.8.6/nix-installer-${arch}-${process.platform}`);
            await exec.exec(`chmod +x ${installerFile}`);
            installerDir = await tc.cacheFile(installerFile, 'nix-installer', 'nix-installer', '3.8.6', process.arch);
        }
        await exec.exec(`${installerDir}/nix-installer install --no-confirm`);
    }
    core.endGroup();
}

export async function install_devbox() {
    await nix_ensure();

    core.startGroup("Ensuring devbox is installed");
    const devboxPath = tc.find('devbox', `0.16.0-${ process.platform }-${ process.arch }`);
    if (devboxPath) {
        core.info(`Devbox is already cached at: ${devboxPath}`);
        core.addPath(devboxPath);
    } else {
        core.info(`Devbox is not cached.`);
        const downloadPath = await tc.downloadTool(`https://github.com/jetify-com/devbox/releases/download/0.16.0/devbox_0.16.0_${ process.platform }_${ process.arch == "x64" ? "amd64" : process.arch }.tar.gz`);
        const devboxExtractedFolder = await tc.extractTar(downloadPath);

        const cachedPath = await tc.cacheDir(devboxExtractedFolder, 'devbox', `0.16.0-${ process.platform }-${ process.arch }`);
        core.addPath(cachedPath);
    }
    core.endGroup();
    
    core.startGroup("Restore nix store from cache");
    await exec.exec('sudo chmod u+s /bin/tar');
    await cache.restoreCache(["/nix/store"], `nix-store-${process.platform}-${process.arch}`);
    await exec.exec('sudo chmod u-s /bin/tar');
    core.endGroup();
}

export async function cache_nix() {
    await cache.saveCache(["/nix/store"], `nix-store-${process.platform}-${process.arch}`);
}