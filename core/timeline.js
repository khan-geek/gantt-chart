function renderTimeline(container, start, days, dayWidth, step) {
    container.innerHTML = "";

    function getWeekNumber(date) {
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const diff = (date - startOfYear) / 86400000;
        return Math.ceil((diff + startOfYear.getDay() + 1) / 7);
    }

    for (let i = 0; i < days; i += step) {
        const d = addDays(start, i);

        let label;

        if (step === 1) {
            label = `${d.getDate()}/${d.getMonth() + 1}`;
        }
        else if (step === 7) {
            label = "W" + getWeekNumber(d);
        }
        else {
            label = d.toLocaleString("default", { month: "short" });
        }

        const div = document.createElement("div");
        div.className = "timeline-day";
        if (step === 1 && isHolidayDate(d)) {
            div.classList.add("timeline-day-holiday");
        }
        div.style.width = dayWidth + "px";
        div.style.flex = "0 0 auto";
        div.innerText = label;

        container.appendChild(div);
    }
}
