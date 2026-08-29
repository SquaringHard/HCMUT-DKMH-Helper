async function searchMonHocDangKy(msmh) {
    return fetch2("/dkmh/searchMonHocDangKy.action", {
        method: "POST",
        headers: {"X-Requested-With": "XMLHttpRequest"},
        body: new URLSearchParams({msmh: msmh}),
        credentials: "include"
    });
}

async function getThongTinNhomLopMonHoc(monHocId) {
    return fetch2("/dkmh/getThongTinNhomLopMonHoc.action", {
        method: "POST",
        headers: {"X-Requested-With": "XMLHttpRequest"},
        body: new URLSearchParams({monHocId: monHocId}),
        credentials: "include"
    });
}

async function fetch2(input, init) {
    try {
        const response = await fetch(input, init);
        if (response.ok) return response.text();

        console.error(`HTTP ${response.status} ${response.statusText} from ${input}`);
        return undefined;
    } catch (e) {
        console.error(`Error while fetching from ${input}`, e);
        return undefined;
    }
}