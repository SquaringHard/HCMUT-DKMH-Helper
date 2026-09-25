function handleDisplaySchedule() {
    if (!sortedSchedules || sortedSchedules.length === 0 || !displayScheduleNode) return;
    populateDetailedTimetable();
    popup(displayScheduleNode.outerHTML);
}

function populateDetailedTimetable() {
    const grid = Array.from({ length: 17 }, () => Array(7).fill(null));
    const unscheduledCourses = new Map();

    for (const [courseIdx, [monHocText, [nhomLop, /*DKSiSo*/, /*selected*/, schedules]]] of sortedSchedules[currentScheduleIndex].entries()) {
        const [maMonHoc, /*tenMonHoc*/] = monHocText.split(" - ");
        for (const [thu, tiet, coSo, /*tuanHoc*/] of schedules) {
            if (tiet.every(t => !t)) {
                unscheduledCourses.set(monHocText, [nhomLop, coSo]);
                continue;
            }

            const dayCol = thu - 2;
            let p = 0;
            while (p < 17) {
                if (!tiet[p]) { p++; continue; }

                let duration = 1;
                while (p + duration < 17 && tiet[p + duration]) duration++;

                grid[p][dayCol] = {
                    type: "class",
                    rowspan: duration,
                    maMonHoc,
                    monHocText,
                    nhomLop,
                    coSo,
                    color: COURSE_COLORS[courseIdx % COURSE_COLORS.length]
                };
                for (let k = 1; k < duration; k++) grid[p + k][dayCol] = { type: "covered" };
                p += duration;
            }
        }
    }

    const tbody = displayScheduleNode.querySelector("#hcmut-dkmh-detail-tbody");
    tbody.replaceChildren();

    for (let p = 0; p < 17; p++) {
        const row = document.createElement("tr");

        const th = document.createElement("th");
        th.className = "active";
        th.style.cssText = "text-align:center; vertical-align:middle; font-size:12px; padding:4px;";
        th.innerHTML = `<b>${p + 1}</b><br><small style="color:#666; font-weight:normal;">${TIME_SLOTS[p]}</small>`;
        row.appendChild(th);

        for (let d = 0; d < 7; d++) {
            const cell = grid[p][d];
            if (cell === null) {
                const td = document.createElement("td");
                td.style.cssText = "vertical-align:middle; padding:4px;";
                row.appendChild(td);
            } else if (cell.type === "class") {
                const td = document.createElement("td");
                td.rowSpan = cell.rowspan;
                td.title = cell.monHocText;
                td.style.cssText = `vertical-align:middle; padding:4px; background-color:${cell.color.bg}; border:1px solid ${cell.color.border}; color:${cell.color.text}; cursor:help;`;
                const campusText = cell.coSo ? (cell.coSo.startsWith("CS") || cell.coSo.startsWith("Cơ sở") ? cell.coSo : `CS${cell.coSo}`) : "";
                td.innerHTML = `
                    <div style="font-weight:bold; font-size:13px;">${cell.maMonHoc}</div>
                    <div style="font-size:11px;">Nhóm: ${cell.nhomLop}</div>
                    ${campusText ? `<div style="font-size:11px;">${campusText}</div>` : ""}
                `;
                row.appendChild(td);
            }
        }
        tbody.appendChild(row);
    }

    const unscheduledDiv = displayScheduleNode.querySelector("#hcmut-dkmh-detail-unscheduled");
    const unscheduledList = displayScheduleNode.querySelector("#hcmut-dkmh-detail-unscheduled-list");
    unscheduledList.replaceChildren();

    if (unscheduledCourses.size > 0) {
        unscheduledDiv.style.display = "block";
        for (const [monHocText, [nhomLop, coSo]] of unscheduledCourses.entries()) {
            const li = document.createElement("li");
            li.innerHTML = `<span title="${monHocText}">${monHocText}</span> (Nhóm: ${nhomLop}${coSo ? `, ${coSo}` : ""})`;
            unscheduledList.appendChild(li);
        }
    } else {
        unscheduledDiv.style.display = "none";
    }
}
