import React, { useCallback, useMemo } from "react";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { QuranAyatRangeSlider } from "./QuranAyatRangeSlider";
import {
  formatApiVerseLabel,
  parseItemVerseSpan,
  type ApiVerseSpan,
} from "../quranApiVerseSpan";

function hasVerseRefIn(value: string) {
  return /\d+\s*:\s*\d+/.test(value) || /^\d+\s*[–—-]\s*\d+$/.test(value.trim());
}

type Props = {
  hizbId: string;
  totalAyahs: number;
  /** Frame/detail title, e.g. "Hizb 3 | Al-Baqarah 2:142–202". */
  title?: string | null;
  subtitle?: string | null;
  rangeLabel?: string | null;
  /** Pre-parsed span from the parent; preferred when provided. */
  verseSpan?: ApiVerseSpan | null;
  minStartAyah: number;
  startAyah: number;
  endAyah: number;
  onChangeStartAyah: (value: number) => void;
  onChangeEndAyah: (value: number) => void;
  styles: any;
};

/**
 * Hizb memorisation ayah step.
 * Totals and handle labels come from API target + title range only.
 * Footer (shared slider): overall progress = end handle / total verses.
 */
export function MemorisationHizbAyahCountStep({
  totalAyahs,
  title,
  subtitle,
  rangeLabel,
  verseSpan: verseSpanProp,
  minStartAyah,
  startAyah,
  endAyah,
  onChangeStartAyah,
  onChangeEndAyah,
  styles,
}: Props) {
  const formatNumber = useLocaleNumber();
  const verseSpan = useMemo(() => {
    if (verseSpanProp) return verseSpanProp;
    // Compose title+range so "Hizb 2 | Al-Baqarah" + "2:75–141" still parses.
    const composedTitle =
      title && rangeLabel && !hasVerseRefIn(title) && hasVerseRefIn(rangeLabel)
        ? `${title} | ${rangeLabel}`
        : title;
    return parseItemVerseSpan({
      title: composedTitle,
      subtitle,
      rangeLabel,
      totalAyahs,
      target: totalAyahs > 0 ? totalAyahs : null,
    });
  }, [rangeLabel, subtitle, title, totalAyahs, verseSpanProp]);
  // API target only — never inflate from a parsed local-style range length.
  const verseCount = useMemo(
    () => Math.max(0, totalAyahs > 0 ? totalAyahs : verseSpan.total),
    [totalAyahs, verseSpan.total],
  );
  const formatVerseLabel = useCallback(
    (ayah: number) => formatApiVerseLabel(verseSpan, ayah, formatNumber),
    [formatNumber, verseSpan],
  );

  return (
    <QuranAyatRangeSlider
      juz={1}
      startAyat={startAyah}
      endAyat={endAyah}
      minStartAyat={minStartAyah}
      freezeStartHandle
      verseCount={verseCount}
      formatVerseLabel={formatVerseLabel}
      onChangeStartAyat={onChangeStartAyah}
      onChangeEndAyat={onChangeEndAyah}
      styles={styles}
    />
  );
}
