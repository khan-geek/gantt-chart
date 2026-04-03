function renderTaskBar(task, startDate, dayWidth, step = 1, holidayKeys = new Set()) {
    const barStart = normalizeDate(task.start <= task.end ? task.start : task.end);
    const barEnd = normalizeDate(task.end >= task.start ? task.end : task.start);
    const normalizedStartDate = normalizeDate(startDate);

    const startOffset =
        Math.floor(getCalendarDayOffset(normalizedStartDate, barStart) / step);

    const duration =
        Math.floor(getCalendarDayOffset(barStart, barEnd) / step) + 1;

    const bar = document.createElement("div");
    bar.className = "task-bar";
    bar.dataset.id = task.id;

    bar.style.left = (startOffset * dayWidth) + "px";
    bar.style.width = (duration * dayWidth) + "px";

    bar.innerHTML = `
        <div class="progress" style="width:${(task.progress || 0) * 100}%"></div>
        <div class="resize-handle"></div>
    `;

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

    return bar;
}
