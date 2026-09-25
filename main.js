async function insertHTML(el, url, pos) {
    const res = await fetch(chrome.runtime.getURL(url));
    const html = await res.text();
    el.insertAdjacentHTML(pos, html);
}

(async () => {
    const div = document.getElementById("divLichDangKyResponse");
    if (!div) {
        console.error("[HCMUT DKMH Helper] #divLichDangKyResponse not found.")
        return;
    }

    await insertHTML(div, "menu.html", "afterend");
    await insertHTML(document.body, "popup.html", "beforeend");

    const scheduleRes = await fetch(chrome.runtime.getURL("displaySchedule.html"));
    const scheduleHTML = await scheduleRes.text();
    displayScheduleNode = new DOMParser().parseFromString(scheduleHTML, "text/html").body.firstElementChild;

    const tbody = document.getElementById("hcmut-dkmh-helper-timetable");
    TIME_SLOTS.forEach((time, i) => {
        const row = document.createElement("tr");
        row.innerHTML = `<th title="${time}">${i + 1}</th>${"<td></td>".repeat(7)}`;
        tbody.appendChild(row);
    });

    document.getElementById("hcmut-dkmh-helper-search-form").addEventListener("submit", handleSearchForm);
    document.getElementById("hcmut-dkmh-helper-load-registration").addEventListener("click", handleLoadRegistration);
    tbody.addEventListener("click", handleTimetable);
    document.getElementById("hcmut-dkmh-helper-apply").addEventListener("click", handleApply);
    document.getElementById("hcmut-dkmh-helper-detail-btn").addEventListener("click", handleDisplaySchedule);

    const numpageDisplay = document.querySelectorAll("#hcmut-dkmh-helper-result i");
    numpageDisplay[0].addEventListener("click", () => {
        if (currentScheduleIndex <= 0) currentScheduleIndex = sortedSchedules.length - 1;
        else currentScheduleIndex--;
        displaySchedule();
    });
    numpageDisplay[1].addEventListener("click", () => {
        if (currentScheduleIndex >= sortedSchedules.length - 1) currentScheduleIndex = 0;
        else currentScheduleIndex++;
        displaySchedule();
    });


    console.info("[HCMUT DKMH Helper] Loaded.");
})();