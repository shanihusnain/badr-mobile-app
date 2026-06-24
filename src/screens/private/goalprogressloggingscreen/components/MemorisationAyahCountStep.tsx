import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
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
  surahName,
  totalAyahs,
  minStartAyah,
  startAyah,
  endAyah,
  onChangeStartAyah,
  onChangeEndAyah,
  styles,
}: Props) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();

  const formatVerseLabel = useCallback(
    (ayah: number) =>
      t("progressLogging.memorisationAyahLabel", {
        ayah: formatNumber(ayah),
      }),
    [formatNumber, t],
  );

  return (
    <QuranAyatRangeSlider
        juz={1}
        startAyat={startAyah}
        endAyat={endAyah}
        minStartAyat={minStartAyah}
        verseCount={totalAyahs}
        formatVerseLabel={formatVerseLabel}
        onChangeStartAyat={onChangeStartAyah}
        onChangeEndAyat={onChangeEndAyah}
        styles={styles}
    />
  );
}
