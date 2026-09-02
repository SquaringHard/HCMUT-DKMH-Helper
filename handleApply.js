async function handleApply() {
    const warnings = [];
    const schedules = await loadScheduleOfSelectedCourses(warnings);
    if (schedules.length === 0) {
        const resultEl = document.getElementById("hcmut-dkmh-helper-result");
        resultEl.firstElementChild.textContent = "Chưa tải môn học nào.";
        resultEl.firstElementChild.style.display = "block";
        resultEl.lastElementChild.style.display = "none";
    } else displayFoundSchedules(findSuitableClasses(filterSchedules(schedules, warnings)));
    renderWarningPopup(warnings);
}

async function loadScheduleOfSelectedCourses(warnings) {
    const serverError = [];
    const notExist = [];
    const schedules = [];
    await Promise.all(Array.from(selectedCourses, async ([monHocId, monHocText]) => {
        const text = await getThongTinNhomLopMonHoc(monHocId);
        if (text === undefined) { serverError.push(monHocText); return; }
        if (text.includes("Môn học chưa được mở nhóm lớp!")) notExist.push(monHocText);
        else schedules.push([monHocText, parseThongTinNhomLopMonHocResponse(text)]);
    }));

    addWarning(warnings, "Lỗi server khi tìm kiếm các môn học sau:", serverError);
    addWarning(warnings, "Lỗi các môn học sau chưa được mở nhóm lớp:", notExist);
    return schedules;
}

function parseThongTinNhomLopMonHocResponse(text) {
    const body = new DOMParser().parseFromString(text, "text/html")
        .querySelector("tbody")
        .children;

    const nhomLopList = [];
    for (let i = 1; i < body.length; i += 3) {
        const nhomLop = body[i].children[0].textContent.trim().toUpperCase();
        const DKSiSo = body[i].children[1].textContent.trim().split("/").map(x => parseInt(x));
        const selected = !!body[i].children[8].querySelector(".fa-check");

        const schedulesProcessed = [];
        const schedules = body[i + 1].querySelectorAll("tr");
        for (let j = 1; j < schedules.length; j++) {
            const coSo = schedules[j].children[3].textContent.trim();
            const thuText = schedules[j].children[0].textContent.trim();
            if (thuText === "Chưa biết") { schedulesProcessed.push([8, EMPTY_DAY, coSo, null]); continue; }

            const thu = parseInt(thuText[5]) || 8;
            const tiet = strToBoolArr(schedules[j].children[1].textContent);
            const tuanHoc = strToBoolArr(schedules[j].children[5].textContent);
            schedulesProcessed.push([thu, tiet, coSo, tuanHoc]);
        }

        nhomLopList.push([nhomLop, DKSiSo, selected, schedulesProcessed]);
    }
    return nhomLopList;
}

function strToBoolArr(str) { return Array.from(str.replace(/\s+/g, ""), x => x !== '-'); }

function filterSchedules(schedules, warnings) {
    const coSoSelected = document.getElementById("hcmut-dkmh-helper-campus").value;
    const nhomLopSelected = document.getElementById("hcmut-dkmh-helper-group").value.trim().toUpperCase();
    const showFull = document.getElementById("hcmut-dkmh-show-full").checked;
    const timetable = computeTimeTable();
    const empties = [];
    const newSchedules = [];
    for (const [monHocText, nhomLopList] of schedules) {
        const filteredNhomLopList = nhomLopList.filter(([nhomLop, DKSiSo, selected, schedules]) => {
            if (!nhomLop.includes(nhomLopSelected)) return false;
            for (const [thu, tiet, coSo, /*tuanHoc*/] of schedules) {
                if (coSoSelected && coSo !== coSoSelected) return false;
                if (timetable[thu - 2].some((isBlocked, index) => isBlocked && tiet[index])) return false;
            }
            return showFull || selected || DKSiSo[0] < DKSiSo[1];
        });

        if (filteredNhomLopList.length === 0) empties.push(monHocText);
        else newSchedules.push([monHocText, filteredNhomLopList]);
    }
    addWarning(warnings, "Các môn học sau không có nhóm lớp/giờ học phù hợp và sẽ bị bỏ qua:", empties);
    return newSchedules;
}

function computeTimeTable() {
    const timetableFlat = document.querySelectorAll("#hcmut-dkmh-helper-timetable td");
    return Array.from({ length: 7 }, (_, j) => Array.from(
        { length: 17 },
        (_, i) => timetableFlat[i * 7 + j].classList.contains("x")
    ));
}

// current impl expects schedules of ~6 subjects
// if actual #subject is much larger, this impl may not be optimal
function findSuitableClasses(schedules) {
    if (schedules.length === 0) return [];

    function hasConflict(sessions1, sessions2) {
        // tuanHoc is null --> schedule is not set yet --> no conflict
        if (!sessions1[0][3] || !sessions2[0][3]) return false;

        for (const [thu1, tiet1, /*coSo1*/, tuanHoc1] of sessions1) {
            for (const [thu2, tiet2, /*coSo2*/, tuanHoc2] of sessions2) {
                if (thu1 === thu2
                    && tiet1.some((t, i) => t && tiet2[i])
                    && tuanHoc1.some((t, i) => t && tuanHoc2[i]))
                    return true;
            }
        }
        return false;
    }

    const results = [];
    const currentClassList = [];
    function backtrack(index) {
        if (index === schedules.length) { results.push([...currentClassList]); return; }

        const [monHocText, nhomLopList] = schedules[index];
        for (const nhomLop of nhomLopList) {
            if (currentClassList.some(([, selectedNhomLop]) => hasConflict(selectedNhomLop[3], nhomLop[3]))) continue;
            currentClassList.push([monHocText, nhomLop]);
            backtrack(index + 1);
            currentClassList.pop();
        }
    }

    backtrack(0);
    return results;
}

function displayFoundSchedules(schedules) {
    const resultEl = document.getElementById("hcmut-dkmh-helper-result");
    if (schedules.length === 0) {
        resultEl.firstElementChild.textContent = "Không tìm thấy lịch học phù hợp với các môn đã chọn.";
        resultEl.firstElementChild.style.display = "block";
        resultEl.lastElementChild.style.display = "none";
        return;
    }

    sortedSchedules = schedules.map(x => [x, computeNumFullAndNumSelected(x)])
        .sort((x1, x2) => {
            const [nf1, ns1] = x1[1];
            const [nf2, ns2] = x2[1];
            return (nf1 - nf2) || (ns2 - ns1);
        })
        .map(([x, _]) => x);

    currentScheduleIndex = 0;
    displaySchedule();
    resultEl.firstElementChild.style.display = "none";
    resultEl.lastElementChild.style.display = "flex";
}

function computeNumFullAndNumSelected(schedule) {
    let numFull = 0;
    let numSelected = 0;
    for ([/*monHocText*/, [/*nhomLop*/, DKSiSo, selected, /*schedules*/]] of schedule) {
        if (selected) numSelected++;
        else if (DKSiSo[0] >= DKSiSo[1]) numFull++;
    }
    return [numFull, numSelected];
}

function displaySchedule() {
    const tbody = document.querySelector("#hcmut-dkmh-helper-result tbody");
    tbody.innerHTML = "";
    for (const [monHocText, [nhomLop, DKSiSo, selected, /*times*/]] of sortedSchedules[currentScheduleIndex]) {
        const row = document.createElement("tr");
        const [maMonHoc, /*tenMonHoc*/] = monHocText.split(" - ");
        const [icon, title, color] = selected
            ? ["fa-check", "đã đăng ký", "#0073b7"] : DKSiSo[0] >= DKSiSo[1]
            ? ["fa-ban", "đã đủ sĩ số", "red"]
            : ["fa-info-circle", "có thể đăng ký", "green"];
        row.innerHTML = `
                <td title="${monHocText}" style="cursor:help">${maMonHoc}</td>
                <td style="cursor:default">${nhomLop}</td>
                <td><i class="fa ${icon}" title="${title}" aria-hidden="true" style="color:${color}; cursor:help"></i></td>
            `;
        tbody.appendChild(row);
    }

    document.querySelector("#hcmut-dkmh-helper-result span").textContent = `${currentScheduleIndex + 1}/${sortedSchedules.length}`;
}