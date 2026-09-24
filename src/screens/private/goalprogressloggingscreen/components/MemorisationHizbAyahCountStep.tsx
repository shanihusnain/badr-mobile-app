import React, { useCallback } from "react";
import { QuranAyatRangeSlider } from "./QuranAyatRangeSlider";
import { formatHizbVerseLabel } from "../quranJuzVerseMap";

type Props = {
  hizbId: string;
  totalAyahs: number;
  minStartAyah: number;
  startAyah: number;
  endAyah: number;
  onChangeStartAyah: (value: number) => void;
  onChangeEndAyah: (value: number) => void;
  styles: any;
};

export function MemorisationHizbAyahCountStep({
  hizbId,
  totalAyahs,
  minStartAyah,
  startAyah,
  endAyah,
  onChangeStartAyah,
  onChangeEndAyah,
  styles,
}: Props) {
  const formatVerseLabel = useCallback(
    (ayah: number) => formatHizbVerseLabel(hizbId, ayah),
    [hizbId],
  );

  return (
    <QuranAyatRangeSlider
      juz={1}
      startAyat={startAyah}
      endAyat={endAyah}
      minStartAyat={minStartAyah}
      freezeStartHandle
      verseCount={totalAyahs}
      formatVerseLabel={formatVerseLabel}
      onChangeStartAyat={onChangeStartAyah}
      onChangeEndAyat={onChangeEndAyah}
      styles={styles}
    />
  );
}
