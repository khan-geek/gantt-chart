function appendHolidayLayer(bar, barStart, barEnd, holidayKeys, dayWidth, step) {
    const holidayLayer = document.createElement("div");
    holidayLayer.className = "holiday-layer";
    let currentDate = barStart;

    while (currentDate.getTime() <= barEnd.getTime()) {
        if (isHolidayDate(currentDate, holidayKeys)) {
            const marker = document.createElement("div");
            marker.className = "holiday-marker";
            marker.style.left = `${(getCalendarDayOffset(barStart, currentDate) / step) * dayWidth}px`;
            marker.style.width = `${Math.max(dayWidth / step, 6)}px`;
            holidayLayer.appendChild(marker);
        }

        currentDate = addDays(currentDate, 1);
    }

    if (holidayLayer.childElementCount) {
        bar.appendChild(holidayLayer);
    }
}

function renderBar(task, startDate, dayWidth, step = 1, holidayKeys = new Set(), summary = false) {
    const barStart = normalizeDate(task.start <= task.end ? task.start : task.end);
    const barEnd = normalizeDate(task.end >= task.start ? task.end : task.start);
    const normalizedStartDate = normalizeDate(startDate);

    const startOffset =
        Math.floor(getCalendarDayOffset(normalizedStartDate, barStart) / step);

    const duration =
        Math.floor(getCalendarDayOffset(barStart, barEnd) / step) + 1;

    const bar = document.createElement("div");
    bar.className = summary ? "task-bar task-bar-summary" : "task-bar";
    bar.dataset.id = task.id;

    bar.style.left = (startOffset * dayWidth) + "px";
    bar.style.width = (duration * dayWidth) + "px";

    bar.innerHTML = summary
        ? `<div class="progress progress-summary" style="width:${(task.progress || 0) * 100}%"></div>`
        : `
        <div class="progress" style="width:${(task.progress || 0) * 100}%"></div>
        <div class="resize-handle"></div>
    `;

    appendHolidayLayer(bar, barStart, barEnd, holidayKeys, dayWidth, step);

    return bar;
}

function renderTaskBar(task, startDate, dayWidth, step = 1, holidayKeys = new Set()) {
    return renderBar(task, startDate, dayWidth, step, holidayKeys);
}

function renderSummaryBar(task, startDate, dayWidth, step = 1, holidayKeys = new Set()) {
    return renderBar(task, startDate, dayWidth, step, holidayKeys, true);
}
