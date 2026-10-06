import type { MenstruationPeriod } from "@/src/api/queries/useGetMenstruationPeriod";

function normalizeDate(date: string | null | undefined): string {
  return String(date ?? "").slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(`${normalizeDate(dateStr)}T12:00:00`);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayLocalYmd(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Expand menstruation periods into YYYY-MM-DD dates (inclusive).
 * Ongoing periods use today as the end when `endDate` is null.
 */
export function expandMenstruationPeriodDates(
  periods: MenstruationPeriod[] | null | undefined,
  options?: {
    rangeStart?: string;
    rangeEnd?: string;
    today?: string;
  },
): string[] {
  if (!Array.isArray(periods) || periods.length === 0) return [];

  const today = normalizeDate(options?.today) || todayLocalYmd();
  const rangeStart = normalizeDate(options?.rangeStart);
  const rangeEnd = normalizeDate(options?.rangeEnd);
  const dates = new Set<string>();

  for (const period of periods) {
    const start = normalizeDate(period.startDate);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) continue;

    const rawEnd = normalizeDate(period.endDate);
    const end =
      /^\d{4}-\d{2}-\d{2}$/.test(rawEnd)
        ? rawEnd
        : period.isOngoing
          ? today
          : start;

    let cursor = start;
    while (cursor <= end) {
      const inRange =
        (!rangeStart || cursor >= rangeStart) &&
        (!rangeEnd || cursor <= rangeEnd);
      if (inRange) dates.add(cursor);
      cursor = addDays(cursor, 1);
      if (cursor === start) break; // safety
    }
  }

  return Array.from(dates).sort();
}
