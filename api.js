async function searchMonHocDangKy(msmh) {
    return await fetch("/dkmh/searchMonHocDangKy.action", {
        method: "POST",
        headers: {"X-Requested-With": "XMLHttpRequest"},
        body: new URLSearchParams({msmh: msmh}),
        credentials: "include"
    });
}

async function getThongTinNhomLopMonHoc(monHocId) {
    return await fetch("/dkmh/getThongTinNhomLopMonHoc.action", {
        method: "POST",
        headers: {"X-Requested-With": "XMLHttpRequest"},
        body: new URLSearchParams({monHocId: monHocId}),
        credentials: "include"
    });
}