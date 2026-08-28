function popup(html) {
    document.getElementById("HMCUT-DKMH-Helper-Modal-Body").innerHTML = html;

    const script = document.createElement('script');
    script.textContent = 'jQuery("#HMCUT-DKMH-Helper-Modal").modal("show");';
    document.head.appendChild(script);
    script.remove();
}

function addWarning(warnings, warnTxt, lst) { if (lst.length > 0) warnings.push([warnTxt, lst]); }
function renderWarningPopup(warnings) {
    if (warnings.length > 0) popup(warnings
        .map(([warnTxt, lst]) => `<b style="font-size:medium">${warnTxt}</b><br>${lst.join("<br>")}`)
        .join("<br><br>"));
}