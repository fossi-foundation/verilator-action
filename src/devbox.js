import * as core from "@actions/core";

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
                resolvedVersion = null;
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            resolvedVersion = data.version;
        })
        .catch(() => {});
    version = resolvedVersion;

    return version;
}