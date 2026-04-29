export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function addMonths(date: Date, amount: number): Date {
  const result = new Date(date);
  const day = result.getDate();
  result.setMonth(result.getMonth() + amount, 1);
  const maxDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, maxDay));
  return result;
}

export function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function isAfter(date: Date, reference: Date): boolean {
  return startOfDay(date) > startOfDay(reference);
}

export function isBefore(date: Date, reference: Date): boolean {
  return startOfDay(date) < startOfDay(reference);
}

export function isAfterOrSame(date: Date, reference: Date): boolean {
  return startOfDay(date) >= startOfDay(reference);
}

export function isBeforeOrSame(date: Date, reference: Date): boolean {
  return startOfDay(date) <= startOfDay(reference);
}

export function isBetween(date: Date, start: Date, end: Date): boolean {
  const d = startOfDay(date).getTime();
  const s = startOfDay(start).getTime();
  const e = startOfDay(end).getTime();
  const [lo, hi] = s <= e ? [s, e] : [e, s];
  return d > lo && d < hi;
}

/** Returns the dates that make up the calendar grid for a given month/year.
 *  Always 6 rows × 7 columns (42 cells). Week starts on Sunday. */
export function getCalendarDays(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const startDow = first.getDay();
  const days: Date[] = [];
  for (let i = -startDow; i < 42 - startDow; i++) {
    days.push(new Date(year, month, 1 + i));
  }
  return days;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Minimal date formatter. Supports tokens:
 *   YYYY, YY, MMMM, MMM, MM, M, DD, D
 */
export function formatDate(date: Date, fmt: string): string {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  const mm = String(m + 1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");

  return fmt
    .replace(/YYYY/g, String(y))
    .replace(/YY/g, String(y).slice(-2))
    .replace(/MMMM/g, MONTH_NAMES[m] ?? "")
    .replace(/MMM/g, MONTH_ABBR[m] ?? "")
    .replace(/MM/g, mm)
    .replace(/M/g, String(m + 1))
    .replace(/DD/g, dd)
    .replace(/D/g, String(d));
}

export { MONTH_NAMES, MONTH_ABBR, DAY_NAMES, DAY_ABBR };
