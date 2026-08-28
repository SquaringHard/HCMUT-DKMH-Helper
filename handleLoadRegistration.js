async function handleLoadRegistration() {
    const els = document.querySelectorAll("#divKetQuaDangKyResponse .col-md-8");
    if (els.length === 0) { popup("Không tìm thấy môn học nào trong Phiếu đăng ký."); return; }

    const serverError = [];
    const notExist = [];
    await Promise.all(Array.from(els, async el => {
        const monHocText = el.textContent.trim();
        const monHocCode = monHocText.substring(0, monHocText.indexOf(" "));
        const response = await searchMonHocDangKy(monHocCode);
        if (!response.ok) { serverError.push(monHocText); return; }

        const text = await response.text();
        const monHocId = text.match(/(?<=monHoc)\d+/)?.[0];
        if (monHocId) addCourse(monHocText, monHocId);
        else notExist.push(monHocText);
    }));

    const warnings = [];
    addWarning(warnings, "Lỗi server khi tìm kiếm các môn học sau:", serverError);
    addWarning(warnings, "Lỗi không tìm thấy thông tin cho các môn học sau:", notExist);
    renderWarningPopup(warnings);
}