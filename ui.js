function prepareHTML() {
    const responseEl = document.getElementById("divLichDangKyResponse");
    if (!responseEl) {
        console.error("HCMUT DKMH Helper: Element #divLichDangKyResponse not found.");
        return;
    }

    const menu = document.createElement("div");
    menu.className = "box box-primary";
    menu.innerHTML = `
        <div class="box-header with-border"><h3 class="box-title">HCMUT DKMH Helper Menu</h3></div>
        <form id="hcmut-dkmh-helper-form">
            <div class="input-group input-group-sm">
                <input name="msmh" class="form-control" placeholder="Mã môn học/Tên môn học (không để trống)">
                <span class="input-group-btn">
                    <button type="submit" class="btn btn-primary btn-flat"> 
                        <i class="fa fa-search" aria-hidden="true"></i>
                    </button>
                </span>
            </div>
        </form>
        <div id="hcmut-dkmh-helper-form-response" class="hcmut-dkmh-helper-course-list" style="min-height: 10px; max-height: 130px;"></div>

        <hr class="hcmut-dkmh-helper-hr">
        <div class="box-header with-border"><h3 class="box-title">Môn học đã chọn</h3></div>

        <div class="box-body hcmut-dkmh-helper-course-list" style="max-height: 135px;" id="hcmut-dkmh-helper-selected-courses">
            <span id="hcmut-dkmh-helper-no-selected">
                Chưa chọn môn học nào.<br>
                <a id="hcmut-dkmh-helper-load-registration" style="cursor:pointer;">Nhập từ Phiếu đăng ký?</a>
            </span>
        </div>

        <hr class="hcmut-dkmh-helper-hr">
        <div class="box-header with-border"><h3 class="box-title">Tùy chọn</h3></div>

        <div class="hcmut-dkmh-helper-option">
            <label>Cơ sở học:</label>
            <select id="hcmut-dkmh-helper-campus">
                <option value="">Tất cả</option>
                <option value="1">Cơ sở 1</option>
                <option value="2">Cơ sở 2</option>
            </select>
        </div>

        <div class="hcmut-dkmh-helper-option">
            <label>Nhóm lớp:</label>
            <input type="text" placeholder="VD: CC, CN, L, ..." id="hcmut-dkmh-helper-group"/>
        </div>

        <div style="margin:5px;">
            <label style="margin-bottom: 5px; display: block;">Giờ học:</label>
            <table class="hcmut-dkmh-helper-timetable"><tbody id="hcmut-dkmh-helper-timetable">
                <tr>
                    <th>Tiết</th>
                    <th>T2</th>
                    <th>T3</th>
                    <th>T4</th>
                    <th>T5</th>
                    <th>T6</th>
                    <th>T7</th>
                    <th>CN</th>
                </tr>
            </tbody></table>
        </div>

        <div style="padding:10px;">
            <button style="display:block; margin:auto;" id="hcmut-dkmh-helper-apply">Áp dụng</button>
        </div>

        <hr class="hcmut-dkmh-helper-hr">
        <div class="box-header with-border"><h3 class="box-title">Kết quả</h3></div>
        <div class="hcmut-dkmh-helper-course-list" id="hcmut-dkmh-helper-result">
            <p>Chưa tải môn học nào.</p>
        </div>
    `;
    responseEl.appendChild(menu);
}

function prepareSearch() {
    document.getElementById("hcmut-dkmh-helper-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const formResponseEl = document.getElementById("hcmut-dkmh-helper-form-response");
        formResponseEl.innerHTML = "";

        const msmh = e.target.elements["msmh"];
        msmh.value = msmh.value.trim();
        if (!msmh.value) return;

        const response = await searchMonHocDangKy(msmh.value);
        if (!response.ok) {
            formResponseEl.innerHTML = "<p>Lỗi server khi tìm kiếm môn học.</p>";
            return;
        }
        const text = await response.text();

        if (text.includes("Chưa tìm kiếm")) {
            formResponseEl.innerHTML = "<p>Không tìm thấy môn học nào.</p>";
            return;
        }

        const body = new DOMParser().parseFromString(text, "text/html");
        for (const row of body.querySelectorAll("tr[id^='monHoc']")) {
            const monHocId = row.id.replace("monHoc", "");
            const cells = row.children;
            const monHocText = `${cells[2].textContent.trim()} - ${cells[3].textContent.trim()}`;

            const textEl = document.createElement("div");
            textEl.appendChild(document.createTextNode(monHocText));
            textEl.addEventListener("click", () => addCourse(monHocText, monHocId));
            formResponseEl.appendChild(textEl);
        }
    });
}

const selectedCourses = new Map();
function addCourse(monHocText, monHocId) {
    if (selectedCourses.has(monHocText)) return;
    selectedCourses.set(monHocText, monHocId);
    document.getElementById("hcmut-dkmh-helper-no-selected").style.display = "none";

    const selectedEl = document.createElement("div");
    selectedEl.appendChild(document.createTextNode(monHocText));
    selectedEl.addEventListener("click", () => {
        selectedEl.remove();
        selectedCourses.delete(monHocText);
        if (selectedCourses.size === 0) {
            document.getElementById("hcmut-dkmh-helper-no-selected").style.display = "block";
        }
    });
    document.getElementById("hcmut-dkmh-helper-selected-courses").appendChild(selectedEl);
}

function prepareLoadRegistration() {
    document.getElementById("hcmut-dkmh-helper-load-registration").addEventListener("click", async () => {
        const els = document.querySelectorAll("#divKetQuaDangKyResponse .col-md-8");
        if (els.length === 0) {
            alert("Không tìm thấy môn học nào trong Phiếu đăng ký.");
            return;
        }

        const serverError = [];
        const notExist = [];
        await Promise.all([...els].map(async el => {
            const monHocText = el.textContent.trim();
            const monHocCode = monHocText.substring(0, monHocText.indexOf(" "));

            const response = await searchMonHocDangKy(monHocCode);
            if (!response.ok) { serverError.push(monHocText); return; }

            const monHocId = await response.text().then(text => text.match(/(?<=monHoc)\d+/)?.[0]);
            if (monHocId) addCourse(monHocText, monHocId);
            else notExist.push(monHocCode);
        }));

        if (serverError.length > 0) alert(`Lỗi server khi tìm kiếm các môn học sau:\n${serverError.join("\n")}`);
        if (notExist.length > 0) alert(`Lỗi không tìm thấy thông tin cho các môn học sau:\n${notExist.join("\n")}`);
    });
}

function prepareTimetable() {
    const tbody = document.getElementById("hcmut-dkmh-helper-timetable");
    for (let i = 1; i <= 17; i++) {
        const row = document.createElement("tr");
        row.innerHTML = `<th>${i}</th>${"<td></td>".repeat(7)}`;
        tbody.appendChild(row);
    }

    tbody.addEventListener("click", (e) => {
        if (e.target.tagName === "TD") {
            e.target.classList.toggle("x");
            return;
        }

        const rows = [...tbody.children];
        if (e.target.parentElement !== rows[0]) { 
            const row = [...e.target.parentElement.children].slice(1);
            if (row.every(c => c.classList.contains("x"))) row.forEach(c => c.classList.remove("x"));
            else row.forEach(c => c.classList.add("x"));
            return;
        }

        const index = [...rows[0].children].indexOf(e.target);
        if (index !== 0) {
            const column = rows.slice(1).map(r => r.children[index]);
            if (column.every(c => c.classList.contains("x"))) column.forEach(c => c.classList.remove("x"));
            else column.forEach(c => c.classList.add("x"));
            return;
        }

        const cells = tbody.querySelectorAll("td");
        for (const cell of cells) {
            if (cell.classList.contains("x")) continue;
            cells.forEach(c => c.classList.add("x"));
            return;
        }
        cells.forEach(c => c.classList.remove("x"));
    });
}

function parseThongTinNhomLopMonHocResponse(text, monHocId) {
    const body = new DOMParser().parseFromString(text, "text/html")
                                .getElementsByTagName("tbody")[0]
                                .children;
    const nhomLopList = [];
    for (let i = 1; i < body.length; i += 3) {
        const nhomLop = body[i].children[0].textContent.trim().toLocaleUpperCase();
        const DKSiSo = body[i].children[1].textContent.trim().split("/").map(x => parseInt(x));
        const selected = !!body[i].children[8].querySelector(".fa-check");

        const schedulesProcessed = [];
        const schedules = body[i + 1].getElementsByTagName("tr");
        for (let j = 1; j < schedules.length; j++) {
            const coSo = schedules[j].children[3].textContent.trim();
            const thuText = schedules[j].children[0].textContent.trim();
            if (thuText === "Chưa biết") {
                schedulesProcessed.push([8, Array(17).fill(false), coSo, Array(17).fill(false)]);
                continue;
            }

            const thu = parseInt(thuText[5]) || 8;

            const tiet = [...schedules[j].children[1].textContent.replace(/\s+/g, "")].map(x => x !== '-');
            const tuanHoc = [...schedules[j].children[5].textContent.replace(/\s+/g, "")].map(x => x !== '-');
            schedulesProcessed.push([thu, tiet, coSo, tuanHoc]);
        }

        nhomLopList.push([nhomLop, DKSiSo, selected, schedulesProcessed]);
    }
    return nhomLopList;
}

function prepareApply() {
    document.getElementById("hcmut-dkmh-helper-apply").addEventListener("click", async () => {
        const resultEl = document.getElementById("hcmut-dkmh-helper-result");
        resultEl.innerHTML = "<p>Đang tìm kiếm...</p>";

        const serverError = [];
        const notExist = [];
        const noSchedule = [];
        const schedules = [];
        await Promise.all([...selectedCourses].map(async ([monHocText, monHocId]) => {
            const response = await getThongTinNhomLopMonHoc(monHocId);
            if (!response.ok) { serverError.push(monHocText); return; }

            const text = await response.text();
            if (text.includes("Môn học chưa được mở nhóm lớp!")) { notExist.push(monHocText); return; }

            const nhomLopList = parseThongTinNhomLopMonHocResponse(text, monHocId);
            if (nhomLopList === null) { noSchedule.push(monHocText); return; }
            schedules.push([monHocText, nhomLopList]);
        }));

        if (notExist.length > 0) alert(`Lỗi không tìm thấy thông tin cho các môn học sau:\n${notExist.join("\n")}`);
        if (noSchedule.length > 0) alert(`Các môn học sau chưa có lịch học:\n${noSchedule.join("\n")}`);
        if (serverError.length > 0) alert(`Lỗi server khi tìm kiếm các môn học sau:\n${serverError.join("\n")}`);
        if (schedules.length === 0) {
            document.getElementById("hcmut-dkmh-helper-result").innerHTML = "<p>Chưa tải môn học nào.</p>";
            return;
        }

        const coso = document.getElementById("hcmut-dkmh-helper-campus").value;
        const nhom = document.getElementById("hcmut-dkmh-helper-group").value.trim().toUpperCase();

        const timetableFlat = document.querySelectorAll("#hcmut-dkmh-helper-timetable td");
        const timetable = Array.from({ length: 7 }, (_, i) =>
                          Array.from({ length: 17 }, (_, j) =>
                          timetableFlat[j * 7 + i].classList.contains("x")));

        for (const [idx, [monHocText, nhomLopList]] of schedules.entries()) {
            schedules[idx][1] = nhomLopList.filter(([nhomLop, DKSiSo, selected, times]) => {
                if (!nhomLop.includes(nhom)) return false;
                if (!selected && DKSiSo[0] >= DKSiSo[1]) return false;
                for (const [thu, tiet, coSo, tuanHoc] of times) {
                    if (coso && coSo !== coso) return false;
                    if (timetable[thu - 2].some((isBlocked, index) => isBlocked && tiet[index])) return false;
                }
                return true;
            });
        }

        const empties = schedules.filter(([_, nhomLopList]) => nhomLopList.length === 0).map(([monHocText]) => monHocText);
        if (empties.length > 0) alert(`Các môn học sau không có nhóm lớp phù hợp và sẽ bị bỏ qua:\n${empties.join("\n")}`);
        const filteredSchedules = schedules.filter(([_, nhomLopList]) => nhomLopList.length > 0);

        for (const [monHocText, nhomLopList] of filteredSchedules) {
            console.log(`Môn ${monHocText} có ${nhomLopList.length} nhóm lớp phù hợp:`);
            for (const [nhomLop, DKSiSo, selected, times] of nhomLopList) {
                console.log(`Nhóm ${nhomLop} (${DKSiSo[0]}/${DKSiSo[1]}), ${selected ? "đã đăng ký, " : ""}lịch học:\n${times.map(t => `Thứ ${t[0]}: ${t[1].map((v,i) => v ? `${(i+1)%10}`:"-").join("")} tại CS${t[2]} vào tuần ${t[3].map((v,i) => v ? `${(i+1)%10}` : "-").join("")}`).join("\n")}`);
            }
            console.log();
        }

        const suitableSchedule = findSuitableSchedules(filteredSchedules);
        if (suitableSchedule.length === 0) {
            document.getElementById("hcmut-dkmh-helper-result").innerHTML = "<p>Không tìm thấy lịch học phù hợp với các môn đã chọn.</p>";
            return;
        }

        resultEl.innerHTML = `
            <table class="table table-condensed table" style="width:100%;text-align:center;">
                <tbody>
                    <tr class="active" style="display:table-row;">
                        <th style="text-align:center;">Mã môn</th>
                        <th style="text-align:center;">Nhóm lớp</th>
                        <th style="text-align:center;">Đã đăng ký</th>
                    </tr>
                </tbody>
            </table>
        `;
        const tbody = resultEl.querySelector("tbody");
        for (const [monHocText, [nhomLop, DKSiSo, selected, times]] of suitableSchedule) {
            const row = document.createElement("tr");
            const [maMonHoc, tenMonHoc] = monHocText.split(" - ");
            row.innerHTML = `
                <td title="${tenMonHoc}">${maMonHoc}</td>
                <td>${nhomLop}</td>
                <td><i class="fa ${selected ? "fa-check" : ""}" aria-hidden="true" style="color: #0073b7;"></i></td>
            `;
            tbody.appendChild(row);
        }
    });
}

function findSuitableSchedules(schedules) {
    function timesOverlap(times1, times2) {
        for (const [thu1, tiet1, coSo1, tuanHoc1] of times1) {
            for (const [thu2, tiet2, coSo2, tuanHoc2] of times2) {
                if (thu1 !== thu2) continue;

                let sharePeriod = false;
                for (let p = 0; p < 17; p++) {
                    if (tiet1[p] && tiet2[p]) {
                        sharePeriod = true;
                        break;
                    }
                }
                if (!sharePeriod) continue;

                for (let w = 0; w < Math.min(tuanHoc1.length, tuanHoc2.length); w++) {
                    if (tuanHoc1[w] && tuanHoc2[w]) return true;
                }
            }
        }
        return false;
    }

    const currentSelection = [];
    function backtrack(subjectIndex) {
        if (subjectIndex === schedules.length) return true;

        const [monHocText, nhomLopList] = schedules[subjectIndex];

        for (const cls of nhomLopList) {
            const classTimes = cls[3];
            let conflict = false;
            for (const selected of currentSelection) {
                const selectedClassTimes = selected[1][3];
                if (timesOverlap(selectedClassTimes, classTimes)) {
                    conflict = true;
                    break;
                }
            }
            if (conflict) continue;

            currentSelection.push([monHocText, cls]);
            if (backtrack(subjectIndex + 1)) return true;
            currentSelection.pop();
        }

        return false;
    }

    backtrack(0);
    return currentSelection;
}