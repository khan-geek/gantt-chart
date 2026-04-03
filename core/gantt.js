const SIDEBAR_WIDTH = 250;
const DAY_WIDTH_BY_ZOOM = {
    day: { dayWidth: 40, step: 1 },
    week: { dayWidth: 80, step: 7 },
    month: { dayWidth: 120, step: 30 }
};

function hasInvalidDateRange(task) {
    return task.start && task.end && task.start > task.end;
}

function createRow() {
    const row = document.createElement("div");
    row.className = "row";
    return row;
}

function createLeftCell(label, isProject = false) {
    const cell = document.createElement("div");
    cell.className = "cell-left";

    if (isProject) {
        const strong = document.createElement("strong");
        strong.textContent = label;
        cell.appendChild(strong);
    } else {
        cell.textContent = label;
    }

    return cell;
}

function createRightCell() {
    const cell = document.createElement("div");
    cell.className = "cell-right";
    return cell;
}

function createProjectRow(project) {
    const row = createRow();
    row.appendChild(createLeftCell(project.name, true));
    row.appendChild(createRightCell());
    return row;
}

function createTaskRow(task, startDate, dayWidth, step, holidayKeys) {
    const row = createRow();
    const leftCell = createLeftCell(task.name);
    const rightCell = createRightCell();
    leftCell.style.paddingLeft = "30px";
    const bar = renderTaskBar(task, startDate, dayWidth, step, holidayKeys);
    rightCell.appendChild(bar);

    row.appendChild(leftCell);
    row.appendChild(rightCell);

    return row;
}

class CustomGantt extends HTMLElement {

    constructor() {
        super();

        this.attachShadow({ mode: "open" });

        this.tasks = [];
        this.holidayKeys = new Set();
        this.currentTask = null;
        this.zoom = "day";
        this.dayWidth = DAY_WIDTH_BY_ZOOM.day.dayWidth;
        this.step = DAY_WIDTH_BY_ZOOM.day.step;

        this.shadowRoot.innerHTML = this.getTemplate();
    }

    connectedCallback() {
        this.attachToolbar();
        this.attachModalActions();
        this.syncZoomControl();
        this.render();
    }

    setData(tasks) {
        const parsedTasks = tasks.map((task) => ({
            ...task,
            start: task.start ? normalizeDate(parseDateInput(task.start)) : null,
            end: task.end ? normalizeDate(parseDateInput(task.end)) : null
        }));

        const invalidTask = parsedTasks.find(hasInvalidDateRange);
        if (invalidTask) {
            console.warn(
                `Task "${invalidTask.name}" has a start date later than its end date.`
            );
            return;
        }

        this.tasks = parsedTasks;

        this.render();
    }

    setZoom(level) {
        const zoomConfig = DAY_WIDTH_BY_ZOOM[level];
        if (!zoomConfig) return;

        this.zoom = level;
        this.dayWidth = zoomConfig.dayWidth;
        this.step = zoomConfig.step;

        this.syncZoomControl();
        this.render();
    }

    setHolidays(holidays) {
        this.holidayKeys = new Set(
            (Array.isArray(holidays) ? holidays : [])
                .map((holiday) => parseDateInput(holiday))
                .map((holiday) => holiday ? normalizeDate(holiday) : null)
                .filter(Boolean)
                .map((holiday) => formatDateInput(holiday))
        );

        this.render();
    }

    render() {
        const container = this.shadowRoot.querySelector(".container");
        const header = this.shadowRoot.querySelector(".timeline-header");
        const dependencyLayer = this.shadowRoot.querySelector(".dependency-layer");

        this.syncZoomControl();
        container.querySelectorAll(".row").forEach((row) => row.remove());

        const dateRange = this.getDateRange();
        if (!dateRange) {
            header.innerHTML = "";
            dependencyLayer.innerHTML = "";
            return;
        }

        header.innerHTML = "";
        renderTimeline(
            header,
            dateRange.startDate,
            dateRange.totalDays,
            this.dayWidth,
            this.step
        );

        const groups = new Map();

        this.tasks.forEach((task) => {
            if (task.type === "project") {
                groups.set(task.id, { project: task, children: [] });
            }
        });

        this.tasks.forEach((task) => {
            if (!task.parent) return;

            const parentGroup = groups.get(task.parent);
            if (parentGroup) {
                parentGroup.children.push(task);
            }
        });

        Array.from(groups.values()).forEach((group) => {
            const projectRow = createProjectRow(group.project);
            container.appendChild(projectRow);

            group.children.forEach((task) => {
                const taskRow = createTaskRow(
                    task,
                    dateRange.startDate,
                    this.dayWidth,
                    this.step,
                    this.holidayKeys
                );
                container.appendChild(taskRow);
            });
        });

        dependencyLayer.setAttribute(
            "width",
            Math.max(container.clientWidth - SIDEBAR_WIDTH, 0)
        );
        dependencyLayer.setAttribute("height", container.scrollHeight);

        enableDragging(
            this.shadowRoot,
            this.tasks,
            this.dayWidth,
            this.step,
            () => this.render()
        );
        enableResize(
            this.shadowRoot,
            this.tasks,
            this.dayWidth,
            this.step,
            () => this.render()
        );
        drawDependencies(this.shadowRoot, this.tasks);
        this.enableEditing();
    }

    getTemplate() {
        return `
<style>
${ganttStyles}
</style>

<div class="toolbar">
<label for="zoomSelect">Zoom:</label>
<select id="zoomSelect" class="zoom-select">
<option value="day">Day</option>
<option value="week">Week</option>
<option value="month">Month</option>
</select>
</div>

<div class="container">
<div class="timeline-header"></div>
<svg class="dependency-layer"></svg>
</div>

<div id="modal">
<input id="taskName" placeholder="Task name"><br><br>
<input id="taskStart" type="date"><br><br>
<input id="taskEnd" type="date"><br><br>
<div id="dateWarning"></div>
<button id="saveTask" type="button">Save</button>
<button id="closeModal" type="button">Close</button>
</div>
`;
    }

    attachToolbar() {
        const zoomSelect = this.shadowRoot.getElementById("zoomSelect");

        zoomSelect.addEventListener("change", (event) => {
            this.setZoom(event.target.value);
        });
    }

    syncZoomControl() {
        const zoomSelect = this.shadowRoot.getElementById("zoomSelect");
        if (zoomSelect) {
            zoomSelect.value = this.zoom;
        }
    }

    attachModalActions() {
        const modal = this.shadowRoot.getElementById("modal");
        const saveButton = this.shadowRoot.getElementById("saveTask");
        const closeButton = this.shadowRoot.getElementById("closeModal");
        const warning = this.shadowRoot.getElementById("dateWarning");

        saveButton.onclick = () => {
            if (!this.currentTask) return;

            const name = this.shadowRoot.getElementById("taskName").value;
            const start = parseDateInput(this.shadowRoot.getElementById("taskStart").value);
            const end = parseDateInput(this.shadowRoot.getElementById("taskEnd").value);

            if (hasInvalidDateRange({ start, end })) {
                warning.textContent = "Start date cannot be later than end date.";
                return;
            }

            warning.textContent = "";
            this.currentTask.name = name;
            this.currentTask.start = start;
            this.currentTask.end = end;

            modal.style.display = "none";
            this.render();
        };

        closeButton.onclick = () => {
            warning.textContent = "";
            modal.style.display = "none";
        };
    }

    getDateRange() {
        const datedTasks = this.tasks.filter((task) => task.start && task.end);
        if (!datedTasks.length) return null;

        const startDate = datedTasks.reduce((earliest, task) => {
            return task.start < earliest ? task.start : earliest;
        }, datedTasks[0].start);

        const endDate = datedTasks.reduce((latest, task) => {
            return task.end > latest ? task.end : latest;
        }, datedTasks[0].end);

        const totalDays = getCalendarDayOffset(startDate, endDate) + 1;

        return { startDate, endDate, totalDays };
    }

    enableEditing() {
        const modal = this.shadowRoot.getElementById("modal");

        this.shadowRoot.querySelectorAll(".task-bar").forEach((bar) => {
            bar.addEventListener("dblclick", () => {
                const id = bar.dataset.id;
                this.currentTask = this.tasks.find((task) => task.id == id);
                if (!this.currentTask) return;

                this.shadowRoot.getElementById("dateWarning").textContent = "";
                modal.style.display = "block";
                this.shadowRoot.getElementById("taskName").value = this.currentTask.name;
                this.shadowRoot.getElementById("taskStart").value =
                    formatDateInput(this.currentTask.start);
                this.shadowRoot.getElementById("taskEnd").value =
                    formatDateInput(this.currentTask.end);
            });
        });
    }
}

customElements.define("custom-gantt", CustomGantt);
