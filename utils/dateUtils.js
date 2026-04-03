function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function normalizeDate(date) {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
}

function parseDateInput(value) {
    if (!value) return null;

    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return null;

    return new Date(year, month - 1, day);
}

function formatDateInput(date) {
    const normalized = normalizeDate(date);
    const year = normalized.getFullYear();
    const month = String(normalized.getMonth() + 1).padStart(2, "0");
    const day = String(normalized.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getCalendarDayOffset(startDate, endDate) {
    const start = normalizeDate(startDate);
    const end = normalizeDate(endDate);

    const startDayNumber = Date.UTC(
        start.getFullYear(),
        start.getMonth(),
        start.getDate()
    ) / (1000 * 60 * 60 * 24);

    const endDayNumber = Date.UTC(
        end.getFullYear(),
        end.getMonth(),
        end.getDate()
    ) / (1000 * 60 * 60 * 24);

    return endDayNumber - startDayNumber;
}

function isHolidayDate(date, holidayKeys = new Set()) {
    const normalizedDate = normalizeDate(date);
    return normalizedDate.getDay() === 0 || holidayKeys.has(formatDateInput(normalizedDate));
}
