import React, { useCallback } from "react";
import { QuranAyatRangeSlider } from "./QuranAyatRangeSlider";
import { formatJuzVerseLabel } from "../quranJuzVerseMap";

type Props = {
  juzId: string;
  juzNumber: number;
  totalAyahs: number;
  minStartAyah: number;
  startAyah: number;
  endAyah: number;
  onChangeStartAyah: (value: number) => void;
  onChangeEndAyah: (value: number) => void;
  styles: any;
};

export function MemorisationJuzAyahCountStep({
  juzId,
  juzNumber,
  totalAyahs,
  minStartAyah,
  startAyah,
  endAyah,
  onChangeStartAyah,
  onChangeEndAyah,
  styles,
}: Props) {
  const formatVerseLabel = useCallback(
    (ayah: number) => formatJuzVerseLabel(juzNumber, ayah),
    [juzNumber],
  );

  return (
    <QuranAyatRangeSlider
      juz={juzNumber}
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
