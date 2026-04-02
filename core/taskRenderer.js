function renderTaskBar(task, startDate, dayWidth, step = 1) {
    const dayMs = 1000 * 60 * 60 * 24;
    const barStart = task.start <= task.end ? task.start : task.end;
    const barEnd = task.end >= task.start ? task.end : task.start;

    const startOffset =
        Math.floor((barStart - startDate) / dayMs / step);

    const duration =
        Math.ceil((barEnd - barStart) / dayMs / step) + 1;

    const bar = document.createElement("div");
    bar.className = "task-bar";
    bar.dataset.id = task.id;

    bar.style.left = (startOffset * dayWidth) + "px";
    bar.style.width = (duration * dayWidth) + "px";

    bar.innerHTML = `
        <div class="progress" style="width:${(task.progress || 0) * 100}%"></div>
        <div class="resize-handle"></div>
    `;

    return bar;
}
