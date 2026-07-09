const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const MONTH_SHORT = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"] as const;

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return startOfDay(next);
}

export function isSameDay(left: Date, right: Date): boolean {
  return toDateKey(left) === toDateKey(right);
}

export function isYesterday(selected: Date, reference: Date): boolean {
  const yesterday = addDays(startOfDay(reference), -1);
  return isSameDay(selected, yesterday);
}

export function getWeekdayShort(date: Date): string {
  return WEEKDAY_SHORT[date.getDay()];
}

export function getMonthName(date: Date): string {
  return MONTH_NAMES[date.getMonth()];
}

export function getMonthShortUpper(date: Date): string {
  return MONTH_SHORT[date.getMonth()];
}

export function getMonthStartDateKey(dateKey: string): string {
  const d = parseDateKey(dateKey);
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  return toDateKey(start);
}

export function getMonthDateKeys(dateKey: string): string[] {
  const d = parseDateKey(dateKey);
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);

  const keys: string[] = [];
  for (let day = start; day <= end; day = addDays(day, 1)) {
    keys.push(toDateKey(day));
  }
  return keys;
}

export function buildDateRange(center: Date, before = 14, after = 14): Date[] {
  const dates: Date[] = [];
  for (let offset = -before; offset <= after; offset += 1) {
    dates.push(addDays(center, offset));
  }
  return dates;
}
