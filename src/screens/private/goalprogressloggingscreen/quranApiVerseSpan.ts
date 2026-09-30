/**
 * Parse Quran frame/detail item verse spans from API title/subtitle/target.
 * Used by verse-selection sliders — no local juz/hizb/surah maps.
 */

export type ApiVerseSpan = {
  /** Display name for the start surah, e.g. "Al-Baqarah". */
  startSurahName: string | null;
  startAyah: number | null;
  endSurahName: string | null;
  endAyah: number | null;
  /** True when start and end are in the same surah (can label as Surah:ayah). */
  sameSurah: boolean;
  /** Ayah count from target or "(total N verses)". */
  total: number;
};

const EMPTY_SPAN: ApiVerseSpan = {
  startSurahName: null,
  startAyah: null,
  endSurahName: null,
  endAyah: null,
  sameSurah: false,
  total: 0,
};

/** Strip "Hizb 3 | " / "Juz 1 | " prefix; keep the range side. */
function rangeSideOfTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return "";
  if (trimmed.includes("|")) {
    return trimmed.split("|").slice(1).join("|").trim();
  }
  return trimmed;
}

/**
 * Parse refs like:
 * - "Al-Baqarah 2:142–202"
 * - "Al-Baqarah 2:142 - Al-Baqarah 2:202"
 * - "Al-Fatiha 1:1 – Al-Baqarah 2:141"
 * - "2:75–141" / "2:75–2:141" (chapter:ayah — surah name supplied separately)
 */
function parseRangeText(raw: string): {
  startSurahName: string | null;
  startAyah: number | null;
  endSurahName: string | null;
  endAyah: number | null;
} {
  const text = raw
    .replace(/^BEST\s*DAY!?\s*/i, "")
    .replace(/\s*[–—]\s*/g, " - ")
    .trim();
  if (!text) {
    return {
      startSurahName: null,
      startAyah: null,
      endSurahName: null,
      endAyah: null,
    };
  }

  // "SurahName N:A - SurahName N:B" or "SurahName N:A - B"
  const full = text.match(
    /^(.+?)\s+(\d+)\s*:\s*(\d+)\s*-\s*(?:(.+?)\s+(\d+)\s*:\s*)?(\d+)\s*$/,
  );
  if (full) {
    const startSurahName = full[1]!.trim();
    const startAyah = Number(full[3]);
    const endSurahName = (full[4]?.trim() || startSurahName).trim();
    const endAyah = Number(full[6]);
    if (
      Number.isFinite(startAyah) &&
      Number.isFinite(endAyah) &&
      startAyah > 0 &&
      endAyah > 0
    ) {
      return { startSurahName, startAyah, endSurahName, endAyah };
    }
  }

  // "2:75 - 141" or "2:75 - 2:141" (API card line under the surah name)
  const chapterRange = text.match(
    /^(\d+)\s*:\s*(\d+)\s*-\s*(?:(\d+)\s*:\s*)?(\d+)\s*$/,
  );
  if (chapterRange) {
    const startAyah = Number(chapterRange[2]);
    const endAyah = Number(chapterRange[4]);
    if (
      Number.isFinite(startAyah) &&
      Number.isFinite(endAyah) &&
      startAyah > 0 &&
      endAyah >= startAyah
    ) {
      return {
        startSurahName: null,
        startAyah,
        endSurahName: null,
        endAyah,
      };
    }
  }

  // Bare "142-202" without surah names
  const bare = text.match(/^(\d+)\s*-\s*(\d+)$/);
  if (bare) {
    const startAyah = Number(bare[1]);
    const endAyah = Number(bare[2]);
    if (
      Number.isFinite(startAyah) &&
      Number.isFinite(endAyah) &&
      startAyah > 0 &&
      endAyah >= startAyah
    ) {
      return {
        startSurahName: null,
        startAyah,
        endSurahName: null,
        endAyah,
      };
    }
  }

  return {
    startSurahName: null,
    startAyah: null,
    endSurahName: null,
    endAyah: null,
  };
}

/** Surah display name from "Hizb 2 | Al-Baqarah" / "Hizb 2 | Al-Baqarah 2:75–141". */
function surahNameFromTitle(title: string | null | undefined): string | null {
  const rangeSide = rangeSideOfTitle(title ?? "");
  if (!rangeSide) return null;
  // Strip trailing chapter:ayah / chapter:ayah–ayah so "Al-Baqarah 2:75–141" → "Al-Baqarah"
  const stripped = rangeSide
    .replace(/\s+\d+\s*:\s*\d+(?:\s*[–—-]\s*(?:\d+\s*:\s*)?\d+)?\s*$/, "")
    .trim();
  return stripped || null;
}

function hasVerseRef(value: string): boolean {
  return /\d+\s*:\s*\d+/.test(value) || /^\d+\s*[–—-]\s*\d+$/.test(value);
}

function parseTotalFromSubtitle(subtitle: string | null | undefined): number {
  const raw = (subtitle ?? "").trim();
  if (!raw) return 0;
  const match = raw.match(/total\s+(\d+)\s*verses?/i) || raw.match(/\((\d+)\)/);
  if (!match) return 0;
  const n = Number(match[1]);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
}

export function parseItemVerseSpan(input: {
  title?: string | null;
  subtitle?: string | null;
  /** Frame/detail `items[].target`. */
  target?: number | null;
  /** Already-mapped total when title parse is enough for labels only. */
  totalAyahs?: number | null;
  /** Pre-extracted range string (e.g. goal.rangeLabel). */
  rangeLabel?: string | null;
}): ApiVerseSpan {
  const fromTarget =
    typeof input.target === "number" &&
    Number.isFinite(input.target) &&
    input.target > 0
      ? Math.round(input.target)
      : 0;
  const fromMapped =
    typeof input.totalAyahs === "number" &&
    Number.isFinite(input.totalAyahs) &&
    input.totalAyahs > 0
      ? Math.round(input.totalAyahs)
      : 0;
  const fromSubtitle = parseTotalFromSubtitle(input.subtitle);
  const total = fromTarget || fromMapped || fromSubtitle;

  // Prefer any candidate that includes a verse ref (e.g. "2:75–141" or
  // "Al-Baqarah 2:75–141") over a bare surah name from the title pipe.
  const fromTitle = rangeSideOfTitle(input.title ?? "");
  const fromRangeLabel = (input.rangeLabel ?? "").trim();
  const fromSub = (input.subtitle ?? "").trim();
  const candidates = [fromTitle, fromRangeLabel, fromSub].filter(Boolean);
  const withRef = candidates.find(hasVerseRef) ?? "";
  const rangeRaw = withRef || fromTitle || fromRangeLabel || "";
  const parsed = parseRangeText(rangeRaw);
  if (!parsed.startAyah && !parsed.endAyah && total <= 0) {
    return { ...EMPTY_SPAN };
  }

  const surahFromTitle = surahNameFromTitle(input.title);
  const startSurahName = parsed.startSurahName || surahFromTitle;
  const endSurahName =
    parsed.endSurahName ||
    (parsed.startSurahName ? parsed.startSurahName : surahFromTitle);

  const sameSurah =
    parsed.startAyah != null &&
    parsed.endAyah != null &&
    (startSurahName == null && endSurahName == null
      ? true
      : Boolean(
          startSurahName &&
            endSurahName &&
            startSurahName.toLowerCase() === endSurahName.toLowerCase(),
        ));

  // Prefer API target; if missing, derive from same-surah ayah span.
  const derivedTotal =
    total > 0
      ? total
      : sameSurah && parsed.startAyah != null && parsed.endAyah != null
        ? Math.max(0, parsed.endAyah - parsed.startAyah + 1)
        : 0;

  return {
    startSurahName,
    startAyah: parsed.startAyah,
    endSurahName,
    endAyah: parsed.endAyah,
    sameSurah,
    total: derivedTotal,
  };
}

/**
 * Label for slider position `1..total`.
 * Preserves `Surah:ayah` chip format whenever the API span has surah names.
 * Same-surah: linear from start using API `total` as the bound.
 * Cross-surah: API endpoints for first/last; optional fallback for middles.
 */
export function formatApiVerseLabel(
  span: ApiVerseSpan | null | undefined,
  position: number,
  formatNumber: (value: number) => string = String,
  /** Used for mid-span positions when the API range crosses surahs. */
  fallbackLabel?: (position: number) => string,
): string {
  const pos = Math.max(1, Math.round(position));

  if (
    span &&
    span.sameSurah &&
    span.startAyah != null &&
    span.startSurahName
  ) {
    const maxAyah =
      span.total > 0
        ? span.startAyah + span.total - 1
        : (span.endAyah ?? span.startAyah + pos - 1);
    const ayah = Math.min(span.startAyah + pos - 1, maxAyah);
    return `${span.startSurahName}:${formatNumber(ayah)}`;
  }

  // Cross-surah API span — keep Surah:ayah at the handles when we can.
  if (
    span &&
    !span.sameSurah &&
    span.startAyah != null &&
    span.startSurahName &&
    span.endAyah != null &&
    span.endSurahName
  ) {
    if (pos <= 1) {
      return `${span.startSurahName}:${formatNumber(span.startAyah)}`;
    }
    if (span.total > 0 ? pos >= span.total : false) {
      return `${span.endSurahName}:${formatNumber(span.endAyah)}`;
    }
    if (fallbackLabel) return fallbackLabel(pos);
    return formatNumber(pos);
  }

  if (span && span.sameSurah && span.startAyah != null && !span.startSurahName) {
    const maxAyah =
      span.total > 0
        ? span.startAyah + span.total - 1
        : (span.endAyah ?? span.startAyah + pos - 1);
    const ayah = Math.min(span.startAyah + pos - 1, maxAyah);
    return formatNumber(ayah);
  }

  if (fallbackLabel) return fallbackLabel(pos);
  return formatNumber(pos);
}

/**
 * Prefer frame/detail `target` (or title/subtitle span) for a juz item.
 * Returns 0 when the API does not expose a count for that juz.
 */
export function resolveApiJuzVerseCount(input: {
  juzNumber: number;
  items?: Array<{
    itemNumber?: number | null;
    title?: string | null;
    subtitle?: string | null;
    target?: number | null;
    targetCount?: number | null;
    verseStart?: number | null;
    verseEnd?: number | null;
  } | null | undefined> | null;
}): number {
  const juz = Math.round(input.juzNumber);
  if (!Number.isFinite(juz) || juz <= 0) return 0;
  const items = input.items ?? [];
  for (const item of items) {
    if (!item) continue;
    const itemNumber = Number(item.itemNumber);
    if (!Number.isFinite(itemNumber) || itemNumber !== juz) continue;
    const fromTarget =
      typeof item.target === "number" && item.target > 0
        ? Math.round(item.target)
        : typeof item.targetCount === "number" && item.targetCount > 0
          ? Math.round(item.targetCount)
          : 0;
    if (fromTarget > 0) return fromTarget;
    const span = parseItemVerseSpan({
      title: item.title,
      subtitle: item.subtitle,
      target: fromTarget || null,
    });
    if (span.total > 0) return span.total;
    if (
      item.verseStart != null &&
      item.verseEnd != null &&
      Number(item.verseEnd) >= Number(item.verseStart)
    ) {
      return Math.max(
        0,
        Math.round(Number(item.verseEnd) - Number(item.verseStart) + 1),
      );
    }
  }
  return 0;
}
