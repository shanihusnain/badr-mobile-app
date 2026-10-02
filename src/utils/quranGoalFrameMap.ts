import moment from "moment-hijri";
import type {
  QuranGoalFrameData,
  QuranGoalFrameDay,
  QuranGoalFrameStatus,
} from "@/src/api/queries/useGetQuranGoalFrame";
import type { QuranHoursDayProgress } from "@/src/screens/private/goalprogressloggingscreen/quranHoursWeeklyData";
import type { MemorisationDayProgress } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationWeeklyData";
import type { QuranRecitationDayProgress } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationWeeklyData";
import {
  applyCompletionBestDayFlags,
  buildCompletionDayProgress,
  type QuranCompletionDayProgress,
} from "@/src/screens/private/goalprogressloggingscreen/quranRecitationCompletionWeeklyData";
import {
  getCompletionResumeCursor,
  parseJuzNumbersFromCompletionLabel,
  type CompletionResumeCursor,
} from "@/src/screens/private/goalprogressloggingscreen/quranRecitationCompletionTarget";
import { getJuzVerseCountFromMap } from "@/src/screens/private/goalprogressloggingscreen/quranJuzVerseMap";

export function formatQuranFrameWeekRange(weekStart: string, weekEnd: string) {
  const start = moment(weekStart, "YYYY-MM-DD");
  const end = moment(weekEnd, "YYYY-MM-DD");
  if (!start.isValid() || !end.isValid()) return "";
  if (start.month() === end.month()) {
    return `${start.format("MMM D")} — ${end.format("D")}`;
  }
  return `${start.format("MMM D")} — ${end.format("MMM D")}`;
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/** Minutes logged for a day (`value` from LISTENING frame). */
export function getQuranFrameDayMinutes(day: QuranGoalFrameDay): number {
  const minutes = toFiniteNumber(day.value);
  return minutes != null && minutes >= 0 ? Math.round(minutes) : 0;
}

function normalizeFrameDate(value?: string | null): string | null {
  if (!value) return null;
  const raw = String(value).trim();
  // Prefer plain YYYY-MM-DD — moment-hijri breaks on moment.ISO_8601 formats.
  const slice = raw.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(slice)) return slice;
  const parsed = moment(raw, "YYYY-MM-DD", true);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : null;
}

function resolveIsToday(day: QuranGoalFrameDay): boolean {
  const dateKey = normalizeFrameDate(day.date);
  if (dateKey) return dateKey === moment().format("YYYY-MM-DD");
  return Boolean(day.isToday);
}

function hasQuranFrameDayActivity(day: QuranGoalFrameDay): boolean {
  const state = String(day.state ?? "").toUpperCase();
  // MISSED / UPCOMING / EMPTY / NONE are not logged activity — do not paint green.
  if (
    state === "MISSED" ||
    state === "UPCOMING" ||
    state === "EMPTY" ||
    state === "NONE"
  ) {
    return false;
  }
  return (
    getQuranFrameDayMinutes(day) > 0 ||
    state === "LOGGED" ||
    state === "COMPLETE" ||
    state === "BEST_DAY" ||
    state === "PARTIAL" ||
    Boolean(day.valueDisplay?.trim())
  );
}

/**
 * Prefer calendar date for today/future so:
 * - grey tab only on real today
 * - past empty days stay solid grey (not future outlines)
 * - past logged days stay green + muted (no today chrome)
 */
function resolveIsFutureDay(day: QuranGoalFrameDay): boolean {
  if (resolveIsToday(day)) return false;
  if (hasQuranFrameDayActivity(day)) return false;

  const state = String(day.state ?? "").toUpperCase();
  if (state === "UPCOMING") return true;
  const dateKey = normalizeFrameDate(day.date);
  if (dateKey) {
    return moment(dateKey, "YYYY-MM-DD").isAfter(moment(), "day");
  }
  return false;
}

export function mapQuranHoursFrameWeekDays(
  frame: QuranGoalFrameData,
): QuranHoursDayProgress[] {
  return frame.week.days.map((day) => {
    const minutesLogged = getQuranFrameDayMinutes(day);
    const isToday = resolveIsToday(day);
    const isFuture = resolveIsFutureDay(day);
    const state = String(day.state ?? "").toUpperCase();
    const isMissed = state === "MISSED";
    const isLogged = !isFuture && !isMissed && hasQuranFrameDayActivity(day);
    const apiDuration = day.valueDisplay?.trim() || undefined;

    return {
      day: day.dayLabel,
      minutesLogged,
      isLogged,
      isBestDay: Boolean(day.isBestDay) || state === "BEST_DAY",
      isToday,
      isFuture,
      showDurationLabel: !isMissed && (minutesLogged > 0 || !!apiDuration),
      date: normalizeFrameDate(day.date) ?? day.date,
      durationLabel: apiDuration,
      canDelete:
        !isMissed && day.canDelete !== false && (minutesLogged > 0 || isLogged),
    };
  });
}

/** Map MEMORIZATION_* frame week days → memorisation weekly rings. */
export function mapQuranMemorisationFrameWeekDays(
  frame: QuranGoalFrameData,
): MemorisationDayProgress[] {
  return frame.week.days.map((day) => {
    const ayahsLogged = getQuranFrameDayMinutes(day);
    const isToday = resolveIsToday(day);
    const isFuture = resolveIsFutureDay(day);
    const state = String(day.state ?? "").toUpperCase();
    const isMissed = state === "MISSED";
    const isLogged = !isFuture && !isMissed && hasQuranFrameDayActivity(day);
    const countLabel = day.valueDisplay?.trim() || undefined;

    return {
      day: day.dayLabel,
      date: normalizeFrameDate(day.date) ?? day.date,
      ayahsLogged,
      isLogged,
      isBestDay: false,
      isToday,
      isFuture,
      countLabel,
      canDelete:
        !isMissed && day.canDelete !== false && (ayahsLogged > 0 || isLogged),
    };
  });
}

/** Map RECITATION_SURAH frame week days → recitation weekly rings. */
export function mapQuranRecitationFrameWeekDays(
  frame: QuranGoalFrameData,
): QuranRecitationDayProgress[] {
  return frame.week.days.map((day) => {
    const recitationsCompleted = getQuranFrameDayMinutes(day);
    const isToday = resolveIsToday(day);
    const isFuture = resolveIsFutureDay(day);
    const state = String(day.state ?? "").toUpperCase();
    const isMissed = state === "MISSED";
    const isLogged = !isFuture && !isMissed && hasQuranFrameDayActivity(day);

    return {
      day: day.dayLabel,
      recitationsCompleted,
      dayType: isToday ? "today" : isFuture ? "future" : "past",
      isBestDay: false,
      date: normalizeFrameDate(day.date) ?? day.date,
      canDelete:
        !isMissed &&
        day.canDelete !== false &&
        (recitationsCompleted > 0 || isLogged),
    };
  });
}

function normalizeJuzCaption(raw: string): string {
  return raw
    .replace(/^BEST\s*DAY!?\s*/i, "")
    .trim()
    .replace(/J(\d)/g, "j$1")
    .replace(/j(\d+)\s*[-–]\s*j(\d+)/i, "j$1-$2");
}

/**
 * Parse pack captions: j5 · j5* · j6-7 · j6–7.
 * Also accept a bare "5*" / "6-7" if the API omits the `j` prefix.
 */
function parseJuzWeekCaption(caption: string): {
  fullJuzRanges?: { start: number; end: number }[];
  partialJuz?: number[];
} {
  if (!caption) return {};

  const rangeMatch = caption.match(/^j?(\d+)\s*[-–]\s*(\d+)$/i);
  if (rangeMatch) {
    return {
      fullJuzRanges: [
        { start: Number(rangeMatch[1]), end: Number(rangeMatch[2]) },
      ],
    };
  }

  const partialMatch = caption.match(/^j?(\d+)(\*?)$/i);
  if (partialMatch) {
    const juz = Number(partialMatch[1]);
    if (partialMatch[2] === "*") {
      return { partialJuz: [juz] };
    }
    return { fullJuzRanges: [{ start: juz, end: juz }] };
  }

  return {};
}

/** Map RECITATION_JUZ AGGREGATE frame week → juz strip (j5 / j6-7 / j8*). */
export function mapQuranJuzFrameWeekDays(
  frame: QuranGoalFrameData,
): QuranCompletionDayProgress[] {
  const days = frame.week.days.map((day, index) => {
    const isToday = resolveIsToday(day);
    const isFuture = resolveIsFutureDay(day);
    const state = String(day.state ?? "").toUpperCase();
    const isMissed = state === "MISSED";
    const caption = normalizeJuzCaption(day.valueDisplay?.trim() || "");
    const frameHasActivity = hasQuranFrameDayActivity(day);
    const apiBestDay = Boolean(day.isBestDay) || state === "BEST_DAY";

    const parsed = parseJuzWeekCaption(caption);

    const progress = buildCompletionDayProgress({
      day: day.dayLabel,
      dayType: isToday ? "today" : isFuture ? "future" : "past",
      completionNumber: frameHasActivity ? index + 1 : null,
      fullJuzRanges: parsed.fullJuzRanges,
      partialJuz: parsed.partialJuz,
    });

    // Frame day activity is the source of truth. Caption parsing can fail
    // (verse spans, missing `j` prefix, etc.) — still paint the day logged.
    if (frameHasActivity) {
      progress.hasActivity = true;
      progress.completionNumber = progress.completionNumber ?? index + 1;
      if (progress.activityScore < 1) {
        progress.activityScore = 1;
      }
      if (caption) {
        progress.computedLabel = caption;
      } else if (!progress.computedLabel) {
        const minutes = getQuranFrameDayMinutes(day);
        progress.computedLabel =
          minutes > 0 && !Number.isInteger(minutes)
            ? String(Number(minutes.toFixed(1)))
            : "";
      }
    }

    return {
      ...progress,
      date: normalizeFrameDate(day.date) ?? day.date,
      isBestDay: frameHasActivity && apiBestDay ? true : progress.isBestDay,
      canDelete:
        !isMissed &&
        day.canDelete !== false &&
        (frameHasActivity || progress.hasActivity),
    };
  });

  return applyCompletionBestDayFlags(days);
}

/**
 * Parse attempt number from day `valueDisplay` (C1) or week `totalLabel`
 * ("1.43 juz from C1 this week").
 */
function parseCompletionAttemptNumber(
  valueDisplay: string | null | undefined,
  weekTotalLabel?: string | null,
): number | null {
  const fromDay = (valueDisplay ?? "").match(/\bC\s*(\d+)\b/i);
  if (fromDay) {
    const n = Number(fromDay[1]);
    if (Number.isFinite(n) && n > 0) return n;
  }
  const fromWeek = (weekTotalLabel ?? "").match(
    /(?:from\s+)?C\s*(\d+)(?:\s+this\s+week)?/i,
  );
  if (fromWeek) {
    const n = Number(fromWeek[1]);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

/**
 * Prefer structured `day.completion` (attemptLabel / attempts / juzLabel).
 * Fall back to parsing `valueDisplay` for older payloads.
 */
function parseCompletionDayCaptions(valueDisplay: string | null | undefined): {
  attempt: number | null;
  juzLabel: string | null;
} {
  const raw = (valueDisplay ?? "").trim();
  if (!raw) return { attempt: null, juzLabel: null };

  const attemptMatch = raw.match(/\bC\s*(\d+)\b/i);
  const attempt =
    attemptMatch && Number.isFinite(Number(attemptMatch[1]))
      ? Number(attemptMatch[1])
      : null;

  const withoutAttempt = raw
    .replace(/\bC\s*\d+\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const juzParts = withoutAttempt
    .split(/[,|\n]+/)
    .map((part) => normalizeJuzCaption(part.trim()))
    .filter(Boolean);

  return {
    attempt,
    juzLabel: juzParts.length > 0 ? juzParts.join(", ") : null,
  };
}

function resolveCompletionDayCaptions(day: QuranGoalFrameDay): {
  attempt: number | null;
  attempts: number[];
  attemptLabel: string | null;
  juzLabel: string | null;
} {
  const fromDisplay = parseCompletionDayCaptions(day.valueDisplay);
  const structured = day.completion;

  if (structured) {
    const attempts: number[] = [];
    for (const raw of structured.attempts ?? []) {
      const n = Number(raw);
      if (Number.isFinite(n) && n > 0) attempts.push(Math.round(n));
    }
    if (attempts.length === 0) {
      const labelMatches = structured.attemptLabel?.matchAll(/\bC\s*(\d+)\b/gi);
      if (labelMatches) {
        for (const match of labelMatches) {
          const n = Number(match[1]);
          if (Number.isFinite(n) && n > 0) attempts.push(Math.round(n));
        }
      }
    }
    if (attempts.length === 0 && fromDisplay.attempt != null) {
      attempts.push(fromDisplay.attempt);
    }

    const uniqueAttempts = [...new Set(attempts)].sort((a, b) => a - b);
    const fromApiLabel = structured.attemptLabel?.trim() || null;
    const attemptLabel =
      uniqueAttempts.length > 1
        ? uniqueAttempts.map((n) => `C${n}`).join(", ")
        : fromApiLabel && /\bC\s*\d+/i.test(fromApiLabel)
          ? fromApiLabel.replace(/\s+/g, " ")
          : uniqueAttempts.length === 1
            ? `C${uniqueAttempts[0]}`
            : fromApiLabel;

    const juzRaw = structured.juzLabel?.trim() || null;
    // Fall back to valueDisplay juz tokens when API omits completion.juzLabel
    // (common when only attempts/attemptLabel are populated).
    const juzLabel = juzRaw
      ? normalizeJuzCaption(juzRaw)
      : fromDisplay.juzLabel;

    if (uniqueAttempts.length > 0 || juzLabel || attemptLabel) {
      return {
        attempt: uniqueAttempts[0] ?? fromDisplay.attempt,
        attempts: uniqueAttempts,
        attemptLabel,
        juzLabel,
      };
    }
  }

  return {
    attempt: fromDisplay.attempt,
    attempts: fromDisplay.attempt != null ? [fromDisplay.attempt] : [],
    attemptLabel: fromDisplay.attempt != null ? `C${fromDisplay.attempt}` : null,
    juzLabel: fromDisplay.juzLabel,
  };
}

/**
 * Map RECITATION_COMPLETION frame week → weekday + C# / juz under-ring.
 * Prefers `day.completion` from the updated frame API.
 */
export function mapQuranCompletionFrameWeekDays(
  frame: QuranGoalFrameData,
): QuranCompletionDayProgress[] {
  const days = frame.week.days.map((day) => {
    const isToday = resolveIsToday(day);
    const isFuture = resolveIsFutureDay(day);
    const state = String(day.state ?? "").toUpperCase();
    const isMissed = state === "MISSED";
    const frameHasActivity = hasQuranFrameDayActivity(day);
    const apiBestDay = Boolean(day.isBestDay) || state === "BEST_DAY";
    console.log("is the best day from api", apiBestDay);
    const {
      attempt: dayAttempt,
      attemptLabel,
      juzLabel,
    } = resolveCompletionDayCaptions(day);
    const attempt = frameHasActivity ? dayAttempt : null;

    // Merge structured tokens when possible ("j1, j2*" → full + partial).
    const juzTokens = (juzLabel ?? "")
      .split(/[,|\n]+/)
      .map((part) => part.trim())
      .filter(Boolean);
    const mergedRanges: { start: number; end: number }[] = [];
    const mergedPartial: number[] = [];
    for (const token of juzTokens) {
      const parsed = parseJuzWeekCaption(token);
      if (parsed.fullJuzRanges) mergedRanges.push(...parsed.fullJuzRanges);
      if (parsed.partialJuz) mergedPartial.push(...parsed.partialJuz);
    }
    const hasStructuredJuz =
      mergedRanges.length > 0 || mergedPartial.length > 0;

    const progress = buildCompletionDayProgress({
      day: day.dayLabel,
      dayType: isToday ? "today" : isFuture ? "future" : "past",
      completionNumber: attempt,
      attemptLabel: frameHasActivity ? attemptLabel : null,
      fullJuzRanges: hasStructuredJuz ? mergedRanges : undefined,
      partialJuz: hasStructuredJuz ? mergedPartial : undefined,
    });

    if (frameHasActivity) {
      progress.hasActivity = true;
      progress.completionNumber = attempt;
      progress.attemptLabel =
        attemptLabel ||
        (attempt != null ? `C${attempt}` : progress.attemptLabel);
      if (progress.activityScore < 1) {
        progress.activityScore = 1;
      }
      if (juzLabel) {
        progress.computedLabel = juzLabel;
      }
    }

    return {
      ...progress,
      date: normalizeFrameDate(day.date) ?? day.date,
      isBestDay: frameHasActivity && apiBestDay ? true : progress.isBestDay,
      canDelete:
        !isMissed &&
        day.canDelete !== false &&
        (frameHasActivity || progress.hasActivity),
    };
  });

  // Prefer API BEST_DAY when present; otherwise score-based fallback.
  const hasApiBestDay = days.some((day) => day.isBestDay);
  if (hasApiBestDay) {
    return days.map((day) => ({
      ...day,
      isBestDay: Boolean(day.isBestDay),
    }));
  }

  return applyCompletionBestDayFlags(days);
}

/**
 * Week stats for completion strip — prefer API `completionTotal`
 * (segments + juz), then `totalLabel` / `totalDisplay`.
 * e.g. segments `[{text:"1.43",emphasis:"primary"},{text:" juz from C1 this week"}]`.
 */
export function getQuranFrameCompletionWeekStats(frame: QuranGoalFrameData): {
  totalDisplay: string | null;
  totalLabel: string | null;
  juzThisWeek: number;
  completionsThisWeek: number;
  attemptNumber: number | null;
} {
  const completionTotal = frame.week.completionTotal ?? null;
  const segments = completionTotal?.segments ?? null;

  const primarySegment =
    segments
      ?.find(
        (segment) =>
          String(segment.emphasis ?? "").toLowerCase() === "primary" &&
          segment.text?.trim(),
      )
      ?.text?.trim() ?? null;

  const segmentsLabel =
    segments && segments.length > 0
      ? segments
          .map((segment) => segment.text ?? "")
          .join("")
          .replace(/\s+/g, " ")
          .trim() || null
      : null;

  const totalLabel = segmentsLabel || frame.week.totalLabel?.trim() || null;

  const juzFromTotal = toFiniteNumber(completionTotal?.juz);
  const totalDisplay =
    primarySegment ||
    (juzFromTotal != null ? formatCompletionJuzDisplay(juzFromTotal) : null) ||
    frame.week.totalDisplay?.trim() ||
    null;

  const juzThisWeek =
    juzFromTotal ??
    toFiniteNumber(totalDisplay) ??
    toFiniteNumber(frame.week.totalMinutes) ??
    0;

  const completionsThisWeek = Math.max(
    0,
    Math.floor(toFiniteNumber(completionTotal?.completions) ?? 0),
  );

  const attemptFromTotal = parseCompletionAttemptFromJuzAttempts(
    completionTotal?.juzAttempts,
  );

  return {
    totalDisplay,
    totalLabel,
    juzThisWeek,
    completionsThisWeek,
    attemptNumber:
      attemptFromTotal ?? parseCompletionAttemptNumber(null, totalLabel),
  };
}

function formatCompletionJuzDisplay(juz: number): string {
  if (!Number.isFinite(juz)) return "0";
  if (Number.isInteger(juz)) return String(juz);
  // Keep short fractional display (matches frame totalDisplay style).
  return String(Number(juz.toFixed(2)));
}

function parseCompletionAttemptFromJuzAttempts(
  juzAttempts: number | number[] | null | undefined,
): number | null {
  if (juzAttempts == null) return null;
  if (typeof juzAttempts === "number") {
    return Number.isFinite(juzAttempts) && juzAttempts > 0
      ? Math.round(juzAttempts)
      : null;
  }
  if (Array.isArray(juzAttempts)) {
    for (const raw of juzAttempts) {
      const n = Number(raw);
      if (Number.isFinite(n) && n > 0) return Math.round(n);
    }
  }
  return null;
}

/** Completions target / completed from frame. */
export function getQuranFrameCompletionProgress(frame: QuranGoalFrameData): {
  targetCompletions: number;
  completedCompletions: number;
  completedJuz: number;
  achievementPct: number;
} {
  const targetFromLabel = frame.goal.targetLabel?.match(/(\d+)\s*completion/i);
  const rawTarget = toFiniteNumber(frame.goal.target) ?? 1;
  const targetCompletions = Math.max(
    1,
    targetFromLabel
      ? Number(targetFromLabel[1])
      : rawTarget >= 30
        ? Math.round(rawTarget / 30)
        : Math.round(rawTarget),
  );
  const completedJuz = Math.max(0, toFiniteNumber(frame.goal.completed) ?? 0);
  const completedCompletions = Math.min(
    targetCompletions,
    Math.floor(completedJuz / 30),
  );
  const achievementPct = Math.round(
    toFiniteNumber(frame.goal.achievementPct) ??
      (targetCompletions > 0
        ? (completedJuz / (targetCompletions * 30)) * 100
        : 0),
  );

  return {
    targetCompletions,
    completedCompletions,
    completedJuz,
    achievementPct,
  };
}

/**
 * Juz already logged in a completion frame week (from `day.completion.juzLabel`).
 * One week alone is not enough for resume — earlier weeks must be merged too.
 *
 * When `attemptNumber` is set, only days for that Khatm (C1/C2/…) count —
 * otherwise finishing C1 (juz 1–30 logged) would still exclude them on C2.
 */
export function collectCompletionLoggedJuzFromFrame(
  frame: QuranGoalFrameData | null | undefined,
  options?: { attemptNumber?: number | null },
): { fullyLogged: number[]; openPartialJuz: number[] } {
  const fullyLogged = new Set<number>();
  const openPartialJuz = new Set<number>();
  if (!frame) return { fullyLogged: [], openPartialJuz: [] };
  const attemptFilter =
    options?.attemptNumber != null &&
    Number.isFinite(options.attemptNumber) &&
    options.attemptNumber > 0
      ? Math.round(options.attemptNumber)
      : null;

  for (const day of frame.week.days ?? []) {
    const captions = resolveCompletionDayCaptions(day);
    if (attemptFilter != null) {
      const dayAttempts =
        captions.attempts.length > 0
          ? captions.attempts
          : captions.attempt != null
            ? [captions.attempt]
            : [];
      if (dayAttempts.length > 0) {
        if (!dayAttempts.includes(attemptFilter)) continue;
      } else {
        // Day has juz but no attempt tag — only include when week totalLabel
        // implies this attempt (legacy payloads).
        const weekAttempt = parseCompletionAttemptNumber(
          null,
          frame.week.totalLabel,
        );
        if (weekAttempt != null && weekAttempt !== attemptFilter) continue;
      }
    }

    const labels = [
      captions.juzLabel,
      day.completion?.juzLabel,
      day.valueDisplay,
    ];
    for (const label of labels) {
      if (!label?.trim()) continue;
      const parsed = parseJuzNumbersFromCompletionLabel(label);
      for (const juz of parsed.full) fullyLogged.add(juz);
      for (const juz of parsed.partialJuz) openPartialJuz.add(juz);
    }

    // Day marked PARTIAL with a bare juz number (no *) → treat as open partial.
    const state = String(day.state ?? "").toUpperCase();
    if (state === "PARTIAL") {
      const bare = parseJuzNumbersFromCompletionLabel(
        captions.juzLabel || day.valueDisplay || "",
      );
      for (const juz of bare.full) openPartialJuz.add(juz);
      for (const juz of bare.partialJuz) openPartialJuz.add(juz);
    }
  }

  // Open partals must not also count as fully logged (e.g. "j2" + "j2*" noise).
  for (const juz of openPartialJuz) {
    fullyLogged.delete(juz);
  }

  return {
    fullyLogged: [...fullyLogged],
    openPartialJuz: [...openPartialJuz].sort((a, b) => a - b),
  };
}

/**
 * Merge logged juz across multiple week frames for the open Khatm.
 * Later frames contribute additional open partials; fully logged wins over partial.
 */
export function mergeCompletionLoggedJuzFromFrames(
  frames: ReadonlyArray<QuranGoalFrameData | null | undefined>,
  options?: { attemptNumber?: number | null },
): { fullyLogged: number[]; openPartialJuz: number[] } {
  const fullyLogged = new Set<number>();
  const openPartialJuz = new Set<number>();

  for (const frame of frames) {
    const collected = collectCompletionLoggedJuzFromFrame(frame, options);
    for (const juz of collected.fullyLogged) fullyLogged.add(juz);
    for (const juz of collected.openPartialJuz) openPartialJuz.add(juz);
  }

  // Open partals win over "full" tags for the same juz (cannot Full-log a partial).
  for (const juz of openPartialJuz) {
    fullyLogged.delete(juz);
  }

  return {
    fullyLogged: [...fullyLogged],
    openPartialJuz: [...openPartialJuz].sort((a, b) => a - b),
  };
}

function computeOpenPartialMinAyatByJuz(
  sources: ReadonlyArray<QuranGoalFrameData | null | undefined>,
  openPartialJuzList: ReadonlyArray<number>,
): Record<number, number> {
  const result: Record<number, number> = {};
  if (openPartialJuzList.length === 0) return result;

  const openSet = new Set(openPartialJuzList);
  const ayahsDoneByJuz = new Map<number, number>();

  for (const source of sources) {
    if (!source) continue;
    for (const day of source.week.days ?? []) {
      const label =
        day.completion?.juzLabel?.trim() ||
        resolveCompletionDayCaptions(day).juzLabel?.trim() ||
        day.valueDisplay?.trim() ||
        "";
      const parsed = parseJuzNumbersFromCompletionLabel(label);
      for (const juz of parsed.partialJuz) {
        if (!openSet.has(juz)) continue;
        const verseCount = Math.max(1, getJuzVerseCountFromMap(juz));
        const raw = toFiniteNumber(day.value);
        if (raw == null || raw <= 0) continue;
        let ayahsDone = 0;
        if (raw < 1) {
          ayahsDone = Math.floor(raw * verseCount);
        } else if (raw <= verseCount) {
          ayahsDone = Math.floor(raw);
        } else {
          // Fraction of a juz expressed as >1 absolute? treat as ayahs if plausible.
          ayahsDone = Math.min(verseCount, Math.floor(raw));
        }
        ayahsDoneByJuz.set(
          juz,
          Math.max(ayahsDoneByJuz.get(juz) ?? 0, ayahsDone),
        );
      }
    }
  }

  for (const juz of openPartialJuzList) {
    const verseCount = Math.max(1, getJuzVerseCountFromMap(juz));
    const ayahsDone = ayahsDoneByJuz.get(juz) ?? 0;
    result[juz] =
      ayahsDone > 0 ? Math.min(verseCount, ayahsDone + 1) : 1;
  }

  return result;
}

/**
 * Where the next log may start inside the open Khatm.
 * Prefer `cycleFrames` (weeks 1‥active) so juz logged in prior weeks are
 * excluded; falls back to the displayed `frame` week only.
 *
 * Scopes day captions to the open attempt (C2 after 30 juz, etc.) so a finished
 * Khatm does not leave the full-juz stepper stuck on J30–J30.
 */
export function getQuranFrameCompletionResumeCursor(
  frame: QuranGoalFrameData,
  cycleFrames?: ReadonlyArray<QuranGoalFrameData | null | undefined>,
): CompletionResumeCursor {
  const progress = getQuranFrameCompletionProgress(frame);
  const safeCompleted = Math.max(0, progress.completedJuz);
  // Open Khatm index from juz progress. While still inside C1 (< 30 juz),
  // do NOT attempt-filter — otherwise missing/wrong C# tags drop open partals
  // and Full still offers partially logged juz.
  const openAttempt = Math.floor(safeCompleted / 30) + 1;
  const attemptOptions =
    safeCompleted >= 30 ? { attemptNumber: openAttempt } : undefined;

  const sources = cycleFrames && cycleFrames.length > 0 ? cycleFrames : [frame];
  let { fullyLogged, openPartialJuz } = mergeCompletionLoggedJuzFromFrames(
    sources,
    attemptOptions,
  );

  // Fallback: if attempt-scoped merge found nothing, retry unscoped so a
  // partial like j2* still excludes juz 2 from Full.
  if (
    attemptOptions &&
    fullyLogged.length === 0 &&
    openPartialJuz.length === 0
  ) {
    const unscoped = mergeCompletionLoggedJuzFromFrames(sources);
    fullyLogged = unscoped.fullyLogged;
    openPartialJuz = unscoped.openPartialJuz;
  }

  const openPartialMinAyatByJuz = computeOpenPartialMinAyatByJuz(
    sources,
    openPartialJuz,
  );
  const primaryOpenPartial =
    openPartialJuz.length > 0
      ? openPartialJuz[openPartialJuz.length - 1]
      : null;

  return getCompletionResumeCursor(safeCompleted, {
    fullyLoggedJuz: fullyLogged,
    openPartialJuz: primaryOpenPartial,
    openPartialJuzList: openPartialJuz,
    openPartialMinAyat:
      primaryOpenPartial != null
        ? openPartialMinAyatByJuz[primaryOpenPartial] ?? 1
        : 1,
    openPartialMinAyatByJuz,
  });
}

/**
 * RECITATION_JUZ — which juz are already fully logged / open partial across
 * weeks 1‥active (from `j5` / `j6-7` / `j8*` day captions).
 */
export function getQuranFrameJuzRecitationResume(
  frame: QuranGoalFrameData,
  cycleFrames?: ReadonlyArray<QuranGoalFrameData | null | undefined>,
): {
  excludedJuz: number[];
  openPartialJuz: number | null;
  /** First selectable ayah when continuing the open partial juz. */
  minStartAyat: number;
} {
  const sources = cycleFrames && cycleFrames.length > 0 ? cycleFrames : [frame];
  const { fullyLogged, openPartialJuz: openPartialList } =
    mergeCompletionLoggedJuzFromFrames(sources);
  const openPartialJuz =
    openPartialList.length > 0
      ? openPartialList[openPartialList.length - 1]
      : null;

  const openPartialMinAyatByJuz = computeOpenPartialMinAyatByJuz(
    sources,
    openPartialList,
  );
  const minStartAyat =
    openPartialJuz != null ? openPartialMinAyatByJuz[openPartialJuz] ?? 1 : 1;

  return {
    excludedJuz: fullyLogged,
    openPartialJuz,
    minStartAyat,
  };
}

/** Fractional juz completed this week from `completionTotal` / `totalLabel` / `totalDisplay`. */
export function getQuranFrameJuzCompletedThisWeek(
  frame: QuranGoalFrameData,
): number {
  const fromCompletionTotal = toFiniteNumber(frame.week.completionTotal?.juz);
  if (fromCompletionTotal != null && fromCompletionTotal >= 0) {
    return fromCompletionTotal;
  }
  const label = frame.week.totalLabel?.trim() || "";
  const display = frame.week.totalDisplay?.trim() || "";
  const match = label.match(/([\d.]+)\s*juz/i) || display.match(/^([\d.]+)/);
  if (match) {
    const n = Number(match[1]);
    if (Number.isFinite(n)) return n;
  }
  const raw = toFiniteNumber(frame.week.totalMinutes);
  if (raw != null && raw >= 0) return raw;
  return 0;
}

export function getQuranFrameMemorisationItem(
  frame: QuranGoalFrameData,
  itemNumber?: number | null,
) {
  const items = frame.items ?? [];
  if (items.length === 0) return null;
  if (itemNumber != null && itemNumber > 0) {
    const match = items.find(
      (item) => Number(item.itemNumber) === Number(itemNumber),
    );
    if (match) return match;
  }
  return items[0] ?? null;
}

export function getQuranFrameMemorisationSurahName(
  frame: QuranGoalFrameData,
  itemNumber?: number | null,
): string {
  const item = getQuranFrameMemorisationItem(frame, itemNumber);
  const title = item?.title?.trim();
  if (title) {
    // "Al-Fatihah (The Opening)" → "Al-Fatihah"
    const bare = title.replace(/\s*\([^)]*\)\s*$/, "").trim();
    return bare || title;
  }
  return frame.title?.trim() || "";
}

export function getQuranFrameMemorisationProgress(
  frame: QuranGoalFrameData,
  itemNumber?: number | null,
) {
  const item = getQuranFrameMemorisationItem(frame, itemNumber);
  const memorizedAyahs = Math.max(
    0,
    Math.round(toFiniteNumber(item?.completed) ?? 0),
  );
  const totalAyahs = Math.max(0, Math.round(toFiniteNumber(item?.target) ?? 0));
  const progressPercent = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        toFiniteNumber(item?.achievementPct) ??
          (totalAyahs > 0
            ? (memorizedAyahs / totalAyahs) * 100
            : (toFiniteNumber(frame.goal.achievementPct) ?? 0)),
      ),
    ),
  );
  const remainingAyahs = Math.max(0, totalAyahs - memorizedAyahs);
  const completed =
    progressPercent >= 100 || (totalAyahs > 0 && memorizedAyahs >= totalAyahs);

  return {
    memorizedAyahs,
    totalAyahs,
    remainingAyahs,
    progressPercent,
    completed,
  };
}

/**
 * Highest ayah already covered in a memorisation day caption.
 * Prefers absolute ranges (`1-78` → 78); falls back to `day.value` as a count.
 */
function memorisationDayAyahHighWater(day: QuranGoalFrameDay): {
  rangeEnd: number;
  valueCount: number;
} {
  const label = day.valueDisplay?.trim() || "";
  const range = label.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (range) {
    const end = Number(range[2]);
    if (Number.isFinite(end) && end > 0) {
      return { rangeEnd: Math.round(end), valueCount: 0 };
    }
  }
  const value = toFiniteNumber(day.value);
  return {
    rangeEnd: 0,
    valueCount: value != null && value > 0 ? Math.round(value) : 0,
  };
}

/**
 * Cycle-wide memorised ayah count for a surah/juz/hizb item.
 * Merges `item.completed` with week-day captions across weeks 1‥active so
 * logs from prior weeks still lock the slider start (same issue as completion).
 */
export function getQuranFrameMemorisationProgressFromCycle(
  frame: QuranGoalFrameData,
  cycleFrames?: ReadonlyArray<QuranGoalFrameData | null | undefined>,
  itemNumber?: number | null,
) {
  const base = getQuranFrameMemorisationProgress(frame, itemNumber);
  const sources = cycleFrames && cycleFrames.length > 0 ? cycleFrames : [frame];

  let itemCompleted = 0;
  let rangeHighWater = 0;
  let valueSum = 0;
  let sawAbsoluteRange = false;
  let totalAyahs = base.totalAyahs;

  for (const source of sources) {
    if (!source) continue;
    const item = getQuranFrameMemorisationItem(source, itemNumber);
    const completed = Math.round(toFiniteNumber(item?.completed) ?? 0);
    if (completed > itemCompleted) itemCompleted = completed;
    const target = Math.round(toFiniteNumber(item?.target) ?? 0);
    if (target > totalAyahs) totalAyahs = target;

    for (const day of source.week.days ?? []) {
      const { rangeEnd, valueCount } = memorisationDayAyahHighWater(day);
      if (rangeEnd > 0) {
        sawAbsoluteRange = true;
        if (rangeEnd > rangeHighWater) rangeHighWater = rangeEnd;
      }
      valueSum += valueCount;
    }
  }

  const memorizedAyahs = Math.max(
    base.memorizedAyahs,
    itemCompleted,
    rangeHighWater,
    // Only sum day.value counts when the API never sent absolute `1-N` ranges
    // (otherwise max-of-ends is the correct high-water mark).
    sawAbsoluteRange ? 0 : valueSum,
  );
  const safeTotal = Math.max(totalAyahs, base.totalAyahs);
  const remainingAyahs = Math.max(0, safeTotal - memorizedAyahs);
  const progressPercent =
    safeTotal > 0
      ? Math.min(100, Math.round((memorizedAyahs / safeTotal) * 100))
      : base.progressPercent;
  const completed =
    progressPercent >= 100 || (safeTotal > 0 && memorizedAyahs >= safeTotal);

  return {
    memorizedAyahs,
    totalAyahs: safeTotal,
    remainingAyahs,
    progressPercent,
    completed,
  };
}

/** Ring label for memorisation — prefer API targetLabel ("Goal: 2 juz"). */
export function getQuranFrameMemorisationRingLabel(
  frame: QuranGoalFrameData,
): string {
  const label = frame.goal.targetLabel?.trim();
  if (label) {
    return label.replace(/^Goal:\s*/i, "").trim() || label;
  }
  const target = toFiniteNumber(frame.goal.target);
  if (target != null && target > 0) {
    const type = String(frame.quranGoalType ?? "").toUpperCase();
    if (type.includes("JUZ")) {
      return `${target} juz`;
    }
    if (type.includes("HIZB")) {
      return target === 1 ? "1 hizb" : `${target} hizbs`;
    }
    return target === 1 ? "1 surah" : `${target} surahs`;
  }
  return getQuranFrameGoalTitle(frame);
}

/**
 * Ring label for recitation — multiline to match design:
 * "Goal: 100" / "recitations" (caller wraps with weeklyProgress_goalLabel).
 */
export function getQuranFrameRecitationRingLabel(
  frame: QuranGoalFrameData,
  unitRecitations: string,
): string {
  const label = frame.goal.targetLabel?.trim();
  if (label) {
    const cleaned = label.replace(/^Goal:\s*/i, "").trim() || label;
    const match = cleaned.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
    if (match) return `${match[1]}\n${match[2]}`;
    return cleaned;
  }
  const target = toFiniteNumber(frame.goal.target);
  if (target != null && target > 0) {
    return `${Math.round(target)}\n${unitRecitations}`;
  }
  return getQuranFrameGoalTitle(frame);
}

/**
 * Ring label for RECITATION_COMPLETION — multiline to match design:
 * "Goal: 3" / "Completions" (caller wraps with weeklyProgress_goalLabel).
 */
export function getQuranFrameCompletionRingLabel(
  frame: QuranGoalFrameData,
  unitCompletions: string,
): string {
  const unit =
    unitCompletions.charAt(0).toUpperCase() + unitCompletions.slice(1);
  const label = frame.goal.targetLabel?.trim();
  if (label) {
    const cleaned = label.replace(/^Goal:\s*/i, "").trim() || label;
    const match = cleaned.match(/^(\d+(?:\.\d+)?)\s+(.+)$/i);
    if (match) {
      const count = match[1];
      const rest = match[2]!.trim();
      // Prefer "Completions" unit line when API says "3 Completions".
      if (/^completions?$/i.test(rest)) return `${count}\n${unit}`;
      return `${count}\n${rest}`;
    }
    return cleaned;
  }
  const fromProgress = getQuranFrameCompletionProgress(frame).targetCompletions;
  if (fromProgress > 0) return `${fromProgress}\n${unit}`;
  const target = toFiniteNumber(frame.goal.target);
  if (target != null && target > 0) {
    return `${Math.round(target)}\n${unit}`;
  }
  return getQuranFrameGoalTitle(frame);
}

export function getQuranFrameTodayIndex(frame: QuranGoalFrameData): number {
  const days = mapQuranHoursFrameWeekDays(frame);
  const todayIndex = days.findIndex((day) => day.isToday);
  return todayIndex >= 0 ? todayIndex : days.length - 1;
}

export function getQuranFrameWeekFraction(frame: QuranGoalFrameData): string {
  const label = frame.week.label?.trim();
  if (label) {
    // API: "1/4 WEEKS" → "1/4"
    const match = label.match(/(\d+\s*\/\s*\d+)/);
    if (match) return match[1].replace(/\s+/g, "");
  }
  return `${frame.week.weekNumber}/${frame.week.totalWeeks}`;
}

export function getQuranFrameWeekRangeLabel(frame: QuranGoalFrameData): string {
  if (frame.week.rangeLabel?.trim()) return frame.week.rangeLabel.trim();
  return formatQuranFrameWeekRange(frame.week.weekStart, frame.week.weekEnd);
}

/** True when the viewed week includes today or is entirely in the future. */
export function isQuranFrameWeekCurrentOrFuture(
  frame: QuranGoalFrameData,
): boolean {
  const today = moment().format("YYYY-MM-DD");
  const weekEnd = normalizeFrameDate(frame.week.weekEnd);
  if (weekEnd && weekEnd >= today) return true;
  const weekStart = normalizeFrameDate(frame.week.weekStart);
  if (weekStart && weekStart > today) return true;
  return frame.week.days.some((day) => resolveIsToday(day));
}

/**
 * Forward week chevron: never advance past the calendar current week
 * (e.g. Nov 29 — Dec 5 while today falls in that range).
 */
export function canNavigateQuranFrameWeekNext(
  frame: QuranGoalFrameData,
): boolean {
  if (isQuranFrameWeekCurrentOrFuture(frame)) return false;
  if (frame.week.hasNext === false) return false;
  if (frame.week.hasNext === true) return true;
  return frame.week.weekNumber < frame.week.totalWeeks;
}

export function getQuranFrameWeekStreakDays(frame: QuranGoalFrameData): number {
  const weekStreak = toFiniteNumber(frame.week.streak?.count);
  if (weekStreak != null) return Math.max(0, weekStreak);

  const current = toFiniteNumber(frame.streaks?.currentStreak);
  if (current != null) return Math.max(0, current);

  return 0;
}

export function getQuranFrameWeekTotalMinutes(
  frame: QuranGoalFrameData,
): number {
  const fromWeek = toFiniteNumber(frame.week.totalMinutes);
  if (fromWeek != null && fromWeek >= 0) return Math.round(fromWeek);

  return frame.week.days.reduce(
    (sum, day) => sum + getQuranFrameDayMinutes(day),
    0,
  );
}

export function getQuranFrameWeekTotalLabel(
  frame: QuranGoalFrameData,
): string | null {
  return frame.week.totalLabel?.trim() || null;
}

export function getQuranFrameWeekTotalDisplay(
  frame: QuranGoalFrameData,
): string | null {
  return frame.week.totalDisplay?.trim() || null;
}

export function getQuranFrameMotivationalQuote(
  frame: QuranGoalFrameData,
): string {
  return frame.week.motivation?.message?.trim() ?? "";
}

/**
 * Signed minutes delta for the weekly footer caret.
 * `null` = week 1 / no comparison. DOWN → negative, UP → positive.
 */
export function getQuranFrameVsLastWeekDelta(
  frame: QuranGoalFrameData,
): number | null {
  const raw = frame.week.vsLastWeek;
  if (raw == null) return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;

  const value = Math.abs(toFiniteNumber(raw.value) ?? 0);
  const direction = String(raw.direction ?? "").toUpperCase();
  if (direction === "DOWN") return -value;
  if (direction === "UP") return value;
  return value === 0 ? 0 : value;
}

/** Prefer API display string (e.g. "2h 0m") for the comparison badge. */
export function getQuranFrameVsLastWeekDisplay(
  frame: QuranGoalFrameData,
): string | null {
  const raw = frame.week.vsLastWeek;
  if (raw == null || typeof raw === "number") return null;
  const display = raw.display?.trim();
  if (display) return display;
  const value = toFiniteNumber(raw.value);
  if (value == null || value <= 0) return null;
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${hours}h ${minutes}m`;
}

export function normalizeQuranGoalFrameStatus(
  status: string | undefined | null,
): QuranGoalFrameStatus {
  const normalized = (status ?? "NOT_STARTED").toUpperCase().replace(/-/g, "_");
  if (normalized === "IN_PROGRESS") return "IN_PROGRESS";
  if (normalized === "COMPLETED") return "COMPLETED";
  return "NOT_STARTED";
}

type TranslateFn = (
  key: string,
  options?: Record<string, string | number>,
) => string;

export function getQuranFrameAchievementLabel(
  frame: QuranGoalFrameData,
  t: TranslateFn,
): { text: string; type: "in-progress" | "completed" | "not-started" } {
  const status = normalizeQuranGoalFrameStatus(frame.goal.status);
  const pct = frame.goal.achievementPct ?? 0;
  const completedMinutes = toFiniteNumber(frame.goal.completed) ?? 0;

  if (status === "COMPLETED" || pct >= 100) {
    return { text: t("progressLogging.fullyAchieved"), type: "completed" };
  }
  if (completedMinutes > 0 || pct > 0) {
    return { text: t("progressLogging.inProgress"), type: "in-progress" };
  }
  return { text: t("progressLogging.notStarted"), type: "not-started" };
}

/** Hours target for HOURS goals (LISTENING / TAJWEED). */
export function getQuranFrameTargetHours(frame: QuranGoalFrameData): number {
  return toFiniteNumber(frame.goal.target) ?? 0;
}

/** Prefer API card title, then targetLabel, then "N hours". */
export function getQuranFrameGoalTitle(frame: QuranGoalFrameData): string {
  const itemTitle = frame.items?.[0]?.title?.trim();
  if (itemTitle) return itemTitle;
  if (frame.goal.targetLabel?.trim()) return frame.goal.targetLabel.trim();
  const hours = getQuranFrameTargetHours(frame);
  return hours > 0 ? `${hours} hours` : frame.title?.trim() || "";
}

/** Compact ring inner label, e.g. "12 hours". */
export function getQuranFrameRingGoalCountLabel(
  frame: QuranGoalFrameData,
  unitLabel: string,
): string {
  const count = getQuranFrameTargetHours(frame);
  return `${count} ${unitLabel}`;
}

/**
 * True when the 28-day cycle is over (last day reached / flagged / past endDate).
 */
export function quranFrameCycleEnded(frame: QuranGoalFrameData): boolean {
  const dayNumber = frame.cycle?.dayNumber;
  const totalDays = frame.cycle?.totalDays;
  if (
    dayNumber != null &&
    totalDays != null &&
    totalDays > 0 &&
    dayNumber >= totalDays
  ) {
    return true;
  }

  if (frame.cycle?.isEnded) return true;

  const cycleEnd = frame.cycle?.endDate;
  if (cycleEnd) {
    const today = moment().format("YYYY-MM-DD");
    const end = moment(cycleEnd).format("YYYY-MM-DD");
    if (end && today >= end) return true;
  }

  return false;
}

/**
 * Show VIEW INSIGHTS when:
 * 1) the goal ring is at 100% (goal completed), or
 * 2) today is on/after the last day of the 28-day cycle.
 * Ignore `items[].showInsights` — API may set it before those conditions.
 */
export function quranFrameShowsInsights(frame: QuranGoalFrameData): boolean {
  const pct = frame.goal.achievementPct ?? 0;
  if (pct >= 100) return true;

  const status = normalizeQuranGoalFrameStatus(frame.goal.status);
  if (status === "COMPLETED") return true;

  return quranFrameCycleEnded(frame);
}

export function getQuranFrameCycleStart(frame: QuranGoalFrameData): string {
  return frame.cycle.startDate?.slice(0, 10) ?? "";
}

export function getQuranFrameCycleEnd(frame: QuranGoalFrameData): string {
  return frame.cycle.endDate?.slice(0, 10) ?? "";
}

/**
 * 1-based cycle week for a calendar date (same math as prayer logging).
 * Used so the weekly dashboard follows the day being logged in the green card.
 */
export function getQuranFrameWeekNumberForDate(
  frame: QuranGoalFrameData,
  date: string,
): number | null {
  const start = getQuranFrameCycleStart(frame);
  if (!start || !date) return null;
  const dayDiff = moment(date.slice(0, 10), "YYYY-MM-DD").diff(
    moment(start, "YYYY-MM-DD"),
    "days",
  );
  if (!Number.isFinite(dayDiff)) return null;
  const week = Math.floor(dayDiff / 7) + 1;
  const totalWeeks = frame.week?.totalWeeks;
  if (totalWeeks != null && totalWeeks > 0) {
    return Math.min(Math.max(1, week), totalWeeks);
  }
  return Math.max(1, week);
}

/**
 * RECITATION_JUZ AGGREGATE card title: "From Juz X to Juz Y (total N Juz)".
 * Used to constrain logging steppers when detail items are not yet loaded.
 */
export function getQuranFrameJuzGoalRange(
  frame: QuranGoalFrameData | null | undefined,
): { start: number; end: number } | null {
  if (!frame) return null;
  const title = frame.items?.[0]?.title?.trim() || frame.title?.trim() || "";
  const match = title.match(/from\s+juz\s+(\d+)\s+to\s+juz\s+(\d+)/i);
  if (!match) return null;
  const start = Number(match[1]);
  const end = Number(match[2]);
  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    start < 1 ||
    end < start ||
    end > 30
  ) {
    return null;
  }
  return { start, end };
}
