function enableResize(root, tasks, dayWidth, step = 1, onChange = null) {
    function snapToGrid(value, width) {
        return Math.round(value / width) * width;
    }

    function removeExistingHandlers() {
        if (root.__resizeMouseMoveHandler) {
            document.removeEventListener("mousemove", root.__resizeMouseMoveHandler);
        }

        if (root.__resizeMouseUpHandler) {
            document.removeEventListener("mouseup", root.__resizeMouseUpHandler);
        }
    }

    let activeBar = null;
    let activeTask = null;
    let startX = 0;
    let initialWidth = 0;

    // Remove old listeners before adding new ones after a re-render.
    removeExistingHandlers();

    root.querySelectorAll(".resize-handle").forEach((handle) => {
        handle.addEventListener("mousedown", (event) => {
            event.stopPropagation();

            activeBar = handle.parentElement;
            activeTask = Array.isArray(tasks)
                ? tasks.find((task) => task.id == activeBar.dataset.id)
                : null;
            if (!activeTask) return;

            // Save the starting mouse position and bar width.
            startX = event.clientX;
            initialWidth = activeBar.offsetWidth;
            document.body.style.userSelect = "none";
        });
    });

    const handleMouseMove = (event) => {
        if (!activeBar || !activeTask) return;

        // Resize the bar visually while keeping it snapped to the grid.
        const rawWidth = initialWidth + (event.clientX - startX);
        const snappedWidth = snapToGrid(rawWidth, dayWidth);
        const nextWidth = Math.max(snappedWidth, dayWidth);

        activeBar.style.width = nextWidth + "px";
    };

    const handleMouseUp = () => {
        if (!activeBar || !activeTask) return;

        // Turn the final bar width into a new task end date.
        const stepsCount = Math.round(activeBar.offsetWidth / dayWidth);
        const durationDays = stepsCount * step;
        const newEnd = new Date(activeTask.start);

        newEnd.setDate(newEnd.getDate() + durationDays - 1);

        if (newEnd.getTime() === activeTask.end.getTime()) {
            activeBar = null;
            activeTask = null;
            document.body.style.userSelect = "";
            return;
        }

        activeTask.end = newEnd;

        if (typeof onChange === "function") {
            onChange();
        }

        activeBar = null;
        activeTask = null;
        document.body.style.userSelect = "";
    };

    root.__resizeMouseMoveHandler = handleMouseMove;
    root.__resizeMouseUpHandler = handleMouseUp;

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
}
