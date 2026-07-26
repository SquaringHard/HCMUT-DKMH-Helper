async function insertHTML(el, url, pos) {
    try {
        const res = await fetch(chrome.runtime.getURL(url));
        const html = await res.text();
        el.insertAdjacentHTML(pos, html);

        const temp = document.createElement("div");
        temp.innerHTML = html;
        const scripts = temp.querySelectorAll("script");
        for (const s of scripts) {
            const script = document.createElement("script");
            script.textContent = s.textContent;
            document.head.appendChild(script);
            script.remove();
        }
        return true;
    } catch (err) {
        console.error(`[HCMUT DKMH Helper] Failed to load ${url}:`, err);
        return false;
    }
}

const selectedCourses = new Map();
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
        if (selectedCourses.size === 0) {
            document.getElementById("hcmut-dkmh-helper-no-selected").style.display = "block";
        }
    });

    selectedEl.appendChild(document.createTextNode(monHocText));
    selectedEl.appendChild(trash);
    document.getElementById("hcmut-dkmh-helper-selected-courses").appendChild(selectedEl);
}

function popup(html) {
    document.getElementById("HMCUT-DKMH-Helper-Modal-Body").innerHTML = html;

    const script = document.createElement('script');
    script.textContent = 'jQuery("#HMCUT-DKMH-Helper-Modal").modal("show");';
    document.head.appendChild(script);
    script.remove();
}

function warnTextWithList(warnTxt, lst) {
    return `<b style="font-size: medium">${warnTxt}</b><br>${lst.join("<br>")}`;
}