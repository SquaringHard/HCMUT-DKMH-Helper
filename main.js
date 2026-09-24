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

    const timeSlots = [
        "06:00 – 06:50",
        "07:00 – 07:50",
        "08:00 – 08:50",
        "09:00 – 09:50",
        "10:00 – 10:50",
        "11:00 – 11:50",
        "12:00 – 12:50",
        "13:00 – 13:50",
        "14:00 – 14:50",
        "15:00 – 15:50",
        "16:00 – 16:50",
        "17:00 – 17:50",
        "18:00 – 18:50",
        "18:50 – 19:40",
        "19:40 – 20:30",
        "20:30 – 21:20",
        "21:20 – 22:10"
    ];
    const tbody = document.getElementById("hcmut-dkmh-helper-timetable");
    timeSlots.forEach((time, i) => {
        const row = document.createElement("tr");
        row.innerHTML = `<th title="${time}">${i + 1}</th>${"<td></td>".repeat(7)}`;
        tbody.appendChild(row);
    });

    document.getElementById("hcmut-dkmh-helper-search-form").addEventListener("submit", handleSearchForm);
    document.getElementById("hcmut-dkmh-helper-load-registration").addEventListener("click", handleLoadRegistration);
    tbody.addEventListener("click", handleTimetable);
    document.getElementById("hcmut-dkmh-helper-apply").addEventListener("click", handleApply);

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