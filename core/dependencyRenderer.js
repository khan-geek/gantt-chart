function drawDependencies(root, tasks) {
    const svg = root.querySelector("svg");
    if (!svg) return;

    svg.innerHTML = "";

    tasks.forEach((task) => {
        if (!task.dependencies) return;

        task.dependencies.forEach((depId) => {
            const fromBar = root.querySelector(`.task-bar[data-id="${depId}"]`);
            const toBar = root.querySelector(`.task-bar[data-id="${task.id}"]`);

            if (!fromBar || !toBar) return;

            const fromRect = fromBar.getBoundingClientRect();
            const toRect = toBar.getBoundingClientRect();
            const svgRect = svg.getBoundingClientRect();

            const x1 = fromRect.right - svgRect.left;
            const y1 = fromRect.top + fromRect.height / 2 - svgRect.top;
            const x2 = toRect.left - svgRect.left;
            const y2 = toRect.top + toRect.height / 2 - svgRect.top;

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            const d = `
M ${x1} ${y1}
L ${x1 + 20} ${y1}
L ${x1 + 20} ${y2}
L ${x2} ${y2}
`;

            path.setAttribute("d", d);
            path.setAttribute("stroke", "#444");
            path.setAttribute("fill", "none");
            path.setAttribute("stroke-width", "2");

            svg.appendChild(path);
        });
    });
}
