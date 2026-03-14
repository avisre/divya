function toDateParts(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return {
    year,
    month: month || 1,
    day: day || 1
  };
}

export function parseIsoDate(value: string) {
  const { year, month, day } = toDateParts(value);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatIsoDate(value: Date) {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function enumerateIsoDates(startIso: string, endIso: string) {
  const dates: string[] = [];
  const cursor = parseIsoDate(startIso);
  const end = parseIsoDate(endIso);

  while (cursor.getTime() <= end.getTime()) {
    dates.push(formatIsoDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

export function buildVisibleCalendarWindow(anchorIso: string, visibleMonths = 3) {
  const anchor = parseIsoDate(anchorIso);
  const start = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1));
  const end = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + visibleMonths, 0));

  return {
    startIso: formatIsoDate(start),
    endIso: formatIsoDate(end)
  };
}
