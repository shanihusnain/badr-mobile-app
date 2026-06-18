const CYCLE_DAYS = 28;

/**
 * Counts Fridays (Jumu'ah) within a goal cycle window.
 * A 28-day window always contains 4 Fridays; longer windows can contain 5.
 */
export function getJumuahCountForCycle(
  cycleStartDate: string = new Date().toISOString().slice(0, 10),
  cycleDays: number = CYCLE_DAYS,
): number {
  const start = new Date(`${cycleStartDate}T12:00:00`);
  if (Number.isNaN(start.getTime())) return 4;

  let count = 0;
  for (let offset = 0; offset < cycleDays; offset++) {
    const day = new Date(start);
    day.setDate(start.getDate() + offset);
    if (day.getDay() === 5) count++;
  }

  return count;
}

export const PRAYER_CYCLE_DAYS = CYCLE_DAYS;
