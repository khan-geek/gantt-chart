function enableDragging(root, tasks, dayWidth, step = 1, onChange = null) {
    function snapToGrid(value, width) {
        return Math.round(value / width) * width;
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function removeExistingHandlers() {
        if (root.__dragMouseMoveHandler) {
            document.removeEventListener("mousemove", root.__dragMouseMoveHandler);
        }

        if (root.__dragMouseUpHandler) {
            document.removeEventListener("mouseup", root.__dragMouseUpHandler);
        }
    }

    let activeBar = null;
    let activeTask = null;
    let startX = 0;
    let initialLeft = 0;

    // Remove old listeners before adding new ones after a re-render.
    removeExistingHandlers();

    root.querySelectorAll(".task-bar").forEach((bar) => {
        bar.addEventListener("mousedown", (event) => {
            if (event.target.classList.contains("resize-handle")) return;

            activeTask = Array.isArray(tasks)
                ? tasks.find((task) => task.id == bar.dataset.id)
                : null;
            if (!activeTask) return;

            // Save the starting mouse position and bar position.
            activeBar = bar;
            startX = event.clientX;
            initialLeft = bar.offsetLeft;
            document.body.style.userSelect = "none";
        });
    });

    const handleMouseMove = (event) => {
        if (!activeBar || !activeTask) return;

        // Move the bar visually while keeping it snapped inside the row bounds.
        const parent = activeBar.parentElement;
        const rawLeft = initialLeft + (event.clientX - startX);
        const snappedLeft = snapToGrid(rawLeft, dayWidth);
        const maxLeft = parent.offsetWidth - activeBar.offsetWidth;
        const nextLeft = clamp(snappedLeft, 0, maxLeft);

        activeBar.style.left = nextLeft + "px";
    };

    const handleMouseUp = () => {
        if (!activeBar || !activeTask) return;

        // Convert the final visual movement into real date changes.
        const stepsMoved = Math.round((activeBar.offsetLeft - initialLeft) / dayWidth);
        if (stepsMoved === 0) {
            activeBar = null;
            activeTask = null;
            document.body.style.userSelect = "";
            return;
        }

        const daysMoved = stepsMoved * step;
        const newStart = new Date(activeTask.start);
        const newEnd = new Date(activeTask.end);

        newStart.setDate(newStart.getDate() + daysMoved);
        newEnd.setDate(newEnd.getDate() + daysMoved);

        activeTask.start = newStart;
        activeTask.end = newEnd;

        if (typeof onChange === "function") {
            onChange();
        }

        activeBar = null;
        activeTask = null;
        document.body.style.userSelect = "";
    };

    root.__dragMouseMoveHandler = handleMouseMove;
    root.__dragMouseUpHandler = handleMouseUp;

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
}
