(() => {
    console.log("HCMUT DKMH Helper loaded.");
    const el = document.getElementById("div-DangKyMonHoc");
    if (!el) {
        console.error("HCMUT DKMH Helper: Element #div-DangKyMonHoc not found.");
        return;
    }

    const observer = new MutationObserver(() => {
        if (getComputedStyle(el).display === "none") return;
        observer.disconnect();
        console.log("HCMUT DKMH Helper started.");
        prepareHTML();
        prepareSearch();
        prepareLoadRegistration();
        prepareTimetable();
        prepareApply();
    });

    observer.observe(el, { attributes: true, attributeFilter: ["style"] });
})();