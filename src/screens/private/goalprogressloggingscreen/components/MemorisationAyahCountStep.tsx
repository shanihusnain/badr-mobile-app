import React, { useCallback } from "react";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { QuranAyatRangeSlider } from "./QuranAyatRangeSlider";

type Props = {
  surahName: string;
  totalAyahs: number;
  minStartAyah: number;
  startAyah: number;
  endAyah: number;
  onChangeStartAyah: (value: number) => void;
  onChangeEndAyah: (value: number) => void;
  styles: any;
};

export function MemorisationAyahCountStep({
  totalAyahs,
  minStartAyah,
  startAyah,
  endAyah,
  onChangeStartAyah,
  onChangeEndAyah,
  styles,
}: Props) {
  const formatNumber = useLocaleNumber();

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
      freezeStartHandle={minStartAyah > 1}
      verseCount={totalAyahs}
      formatVerseLabel={formatVerseLabel}
      onChangeStartAyat={onChangeStartAyah}
      onChangeEndAyat={onChangeEndAyah}
      styles={styles}
    />
  );
}
