function popup(html) {
    document.getElementById("HMCUT-DKMH-Helper-Modal-Body").innerHTML = html;

    ///////////////////////////////////////////////////////
    // Bootstrap 3.3.6's jQueryObject.show('modal')      //
    // Impled by AI cuz I cant read Bootstrap sourcecode //
    // (sad) (skill issue)                               //
    ///////////////////////////////////////////////////////

    // Remove an old backdrop if one exists.
    document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());

    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop fade";
    document.body.appendChild(backdrop);

    document.body.classList.add("modal-open");
    const modal = document.getElementById("HMCUT-DKMH-Helper-Modal");
    modal.style.display = "block";

    // Let the browser paint the initial state before adding .in.
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            backdrop.classList.add("in");
            modal.classList.add("in");
        });
    });

    const close = () => {
        modal.classList.remove("in");
        backdrop.classList.remove("in");

        setTimeout(() => {
            modal.style.display = "none";
            backdrop.remove();
            document.body.classList.remove("modal-open");
        }, 300);
    };

    // Bootstrap-style close buttons.
    modal.querySelectorAll('[data-dismiss="modal"]').forEach(el => {
        el.addEventListener("click", close, { once: true });
    });

    // Close when clicking the backdrop.
    modal.addEventListener("click", e => {
        if (e.target === modal) close();
    }, { once: true });

    // Escape closes it.
    document.addEventListener("keydown", function esc(e) {
        if (e.key === "Escape") {
            close();
            document.removeEventListener("keydown", esc);
        }
    });
}

function addWarning(warnings, warnTxt, lst) { if (lst.length > 0) warnings.push([warnTxt, lst]); }
function renderWarningPopup(warnings) {
    if (warnings.length > 0) popup(warnings
        .map(([warnTxt, lst]) => `<b style="font-size:medium">${warnTxt}</b><br>${lst.join("<br>")}`)
        .join("<br><br>"));
}