function handleTimetable(e) {
    const clickedCell = e.target;
    if (clickedCell.tagName === "TD") { clickedCell.classList.toggle("x"); return; }
    if (clickedCell.tagName !== "TH") return; // TODO: drag click feature?

    const tbody = e.currentTarget;
    if (clickedCell.parentElement !== tbody.firstElementChild) {
        const row = clickedCell.parentElement;
        const allSelected = !row.querySelector("td:not(.x)");
        row.querySelectorAll("td")
            .forEach(td => td.classList.toggle("x", !allSelected));
        return;
    }

    const index = clickedCell.cellIndex;
    if (index !== 0) {
        const nth = clickedCell.cellIndex + 1;
        const allSelected = !tbody.querySelector(`td:nth-child(${nth}):not(.x)`);
        tbody.querySelectorAll(`td:nth-child(${nth})`)
            .forEach(cell => cell.classList.toggle("x", !allSelected));
        return;
    }

    const allSelected = !tbody.querySelector("td:not(.x)");
    tbody.querySelectorAll("td")
        .forEach(cell => cell.classList.toggle("x", !allSelected));
}