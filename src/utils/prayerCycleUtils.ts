const CYCLE_DAYS = 28;

/**
 * Counts Fridays (Jumu'ah) within the fixed 28-day goal cycle starting on
 * `cycleStartDate`. Every 28-day window contains exactly 4 Fridays.
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

/** Jumu'ah count for the user's 28-day cycle (from cycle start date). */
export function getJumuahCountForCycleStart(
  cycleStartDate?: string | null,
): number {
  if (!cycleStartDate) return getJumuahCountForCycle();
  return getJumuahCountForCycle(cycleStartDate, CYCLE_DAYS);
}

/** Jumu'ah + Dhuhr limits when congregational tracking is enabled (28-day cycle). */
export function getCongregationalPrayerAdjustments(
  cycleStartDate?: string | null,
) {
  const cycleDayCount = CYCLE_DAYS;
  const jumuahCount = getJumuahCountForCycleStart(cycleStartDate);
  const dhuhrMax = Math.max(0, cycleDayCount - jumuahCount);

  return {
    cycleDayCount,
    jumuahCount,
    dhuhrMax,
    prayerDefaults: {
      fajr: cycleDayCount,
      dhuhr: dhuhrMax,
      asr: cycleDayCount,
      maghrib: cycleDayCount,
      isha: cycleDayCount,
      jumuah: jumuahCount,
    },
  };
}

export const PRAYER_CYCLE_DAYS = CYCLE_DAYS;

/** @deprecated Use getJumuahCountForCycleStart — cycles are always 28 days. */
export function getJumuahCountForCycleRange(
  cycleStartDate?: string | null,
  _cycleEndDate?: string | null,
): number {
  return getJumuahCountForCycleStart(cycleStartDate);
}

/** @deprecated Cycles are always 28 days for prayer goals. */
export function getCycleDayCount(
  _cycleStartDate?: string | null,
  _cycleEndDate?: string | null,
  fallbackDays: number = CYCLE_DAYS,
): number {
  return fallbackDays;
}
