async function handleSearchForm(e) {
    e.preventDefault();

    const listEl = e.currentTarget.nextElementSibling;
    listEl.innerHTML = "";

    const input = e.currentTarget.querySelector("input");
    input.value = input.value.trim();
    if (!input.value) return;

    const response = await searchMonHocDangKy(input.value);
    if (!response.ok) { listEl.innerHTML = "<p>Lỗi server khi tìm kiếm môn học.</p>"; return; }

    const text = await response.text();
    if (text.includes("Chưa tìm kiếm")) { listEl.innerHTML = "<p>Không tìm thấy môn học nào.</p>"; return; }

    const body = new DOMParser().parseFromString(text, "text/html");
    for (const row of body.querySelectorAll("tr[id^='monHoc']")) {
        const monHocId = row.id.replace("monHoc", "");
        const cells = row.children;
        const monHocText = `${cells[2].textContent.trim()} - ${cells[3].textContent.trim()}`;

        const info = document.createElement("i");
        info.className = "text-green fa fa-info-circle";
        info.title = "Thông tin lớp học";
        info.role = "button";
        info.ariaHidden = "true";
        info.style.paddingRight = ""
        info.addEventListener("click", async (e) => {
            const response = await getThongTinNhomLopMonHoc(monHocId);
            popup(await response.text());
        });

        const textEl = document.createElement("div");
        textEl.appendChild(document.createTextNode(monHocText));
        textEl.appendChild(info);
        textEl.addEventListener("click", () => addCourse(monHocText, monHocId));
        listEl.appendChild(textEl);
    }
}

function addCourse(monHocText, monHocId) {
    if (selectedCourses.has(monHocId)) return;
    selectedCourses.set(monHocId, monHocText);
    document.getElementById("hcmut-dkmh-helper-no-selected").style.display = "none";

    const selectedEl = document.createElement("div");
    selectedEl.addEventListener("click", async () => {
        const response = await getThongTinNhomLopMonHoc(monHocId);
        popup(await response.text());
    });

    const trash = document.createElement("i");
    trash.className = "text-red fa fa-trash";
    trash.title = "Bỏ chọn";
    trash.role = "button";
    trash.ariaHidden = "true";
    trash.addEventListener("click", (e) => {
        e.stopPropagation();
        selectedEl.remove();
        selectedCourses.delete(monHocId);
        if (selectedCourses.size === 0) document.getElementById("hcmut-dkmh-helper-no-selected").style.display = "block";
    });

    selectedEl.appendChild(document.createTextNode(monHocText));
    selectedEl.appendChild(trash);
    document.getElementById("hcmut-dkmh-helper-selected-courses").appendChild(selectedEl);
}