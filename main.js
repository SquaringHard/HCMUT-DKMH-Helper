(async () => {
    const div = document.getElementById("divLichDangKyResponse");
    if (!div) {
        console.error("[HCMUT DKMH Helper] #divLichDangKyResponse not found.")
        return;
    }

    if (!await insertHTML(div, "menu.html", "afterend")) return;
    if (!await insertHTML(document.body, "popup.html", "beforeend")) return;

    document.getElementById("hcmut-dkmh-helper-search-form").addEventListener("submit", handleSearchFormSubmit);
    document.getElementById("hcmut-dkmh-helper-load-registration").addEventListener("click", handleLoadRegistration);

    // prepareTimetable();
    // prepareApply();
    console.log("[HCMUT DKMH Helper] Loaded.");
})();