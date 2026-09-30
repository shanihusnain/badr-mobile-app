import React, { useCallback, useMemo } from "react";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { QuranAyatRangeSlider } from "./QuranAyatRangeSlider";
import {
  parseItemVerseSpan,
  type ApiVerseSpan,
} from "../quranApiVerseSpan";

type Props = {
  surahName: string;
  /** Surah id / number — unused for totals (API only). */
  surahId?: string;
  totalAyahs: number;
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
 * Surah memorisation ayah step.
 * Totals from API. Labels stay numeric ayah numbers (historical surah UI).
 * Footer (shared slider): overall progress = end handle / total verses.
 */
export function MemorisationAyahCountStep({
  surahName: _surahName,
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
  const verseSpan = useMemo(
    () =>
      verseSpanProp ??
      parseItemVerseSpan({
        title: title ?? _surahName,
        subtitle,
        rangeLabel,
        totalAyahs,
        target: totalAyahs > 0 ? totalAyahs : null,
      }),
    [_surahName, rangeLabel, subtitle, title, totalAyahs, verseSpanProp],
  );
  const verseCount = useMemo(
    () => Math.max(0, totalAyahs > 0 ? totalAyahs : verseSpan.total),
    [totalAyahs, verseSpan.total],
  );
  // Surah flow has always shown bare ayah numbers on chips (not Surah:ayah).
  const formatVerseLabel = useCallback(
    (ayah: number) => formatNumber(ayah),
    [formatNumber],
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
      chipVariant="surah"
      styles={styles}
    />
  );
}
