export function browserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York";
}

export function friendlyDate(value?: string | number | Date, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options
  }).format(date);
}

export function timeGreeting(timezone: string) {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: timezone
    }).format(new Date())
  );

  if (hour < 12) return "Suprabhatam";
  if (hour < 17) return "Namaste";
  if (hour < 21) return "Shubha Sandhya";
  return "Shubha Ratri";
}

