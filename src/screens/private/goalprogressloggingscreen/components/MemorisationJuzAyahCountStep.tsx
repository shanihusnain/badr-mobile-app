import React, { useCallback, useMemo } from "react";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { QuranAyatRangeSlider } from "./QuranAyatRangeSlider";
import { formatJuzVerseLabel } from "../quranJuzVerseMap";
import {
  formatApiVerseLabel,
  parseItemVerseSpan,
  type ApiVerseSpan,
} from "../quranApiVerseSpan";

function hasVerseRefIn(value: string) {
  return /\d+\s*:\s*\d+/.test(value) || /^\d+\s*[–—-]\s*\d+$/.test(value.trim());
}

type Props = {
  juzId: string;
  juzNumber: number;
  totalAyahs: number;
  /** Frame/detail title, e.g. "Juz 1 | Al-Fatiha 1:1 – Al-Baqarah 2:141". */
  title?: string | null;
  subtitle?: string | null;
  rangeLabel?: string | null;
  verseSpan?: ApiVerseSpan | null;
  minStartAyah: number;
  startAyah: number;
  endAyah: number;
  onChangeStartAyah: (value: number) => void;
  onChangeEndAyah: (value: number) => void;
  styles: any;
};

/**
 * Juz memorisation ayah step.
 * Totals from API target. Chip format stays `Surah:ayah` (API span when
 * same-surah; juz geography only as label fallback for cross-surah middles).
 */
export function MemorisationJuzAyahCountStep({
  juzNumber,
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
  const verseCount = useMemo(
    () => Math.max(0, totalAyahs > 0 ? totalAyahs : verseSpan.total),
    [totalAyahs, verseSpan.total],
  );
  const formatVerseLabel = useCallback(
    (ayah: number) =>
      formatApiVerseLabel(verseSpan, ayah, formatNumber, (pos) =>
        formatJuzVerseLabel(juzNumber, pos),
      ),
    [formatNumber, juzNumber, verseSpan],
  );

  return (
    <QuranAyatRangeSlider
      juz={juzNumber}
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
