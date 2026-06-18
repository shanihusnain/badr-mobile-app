import React from "react";
import { useTranslation } from "react-i18next";
import { OptionSelectStep } from "./OptionSelectStep";
import type { JuzCompletionType } from "../quranRecitationJuzData";

type Props = {
  selectedType: JuzCompletionType;
  onSelectType: (type: JuzCompletionType) => void;
  styles: Record<string, object>;
};

const LOGGING_TYPE_OPTIONS: JuzCompletionType[] = ["full", "partial", "both"];

export function JuzLoggingTypeStep({
  selectedType,
  onSelectType,
  styles,
}: Props) {
  const { t } = useTranslation();

  return (
    <OptionSelectStep
      options={LOGGING_TYPE_OPTIONS}
      selectedValue={selectedType}
      onSelectValue={onSelectType}
      getLabel={(option) => t(`progressLogging.completionType_${option}`)}
      styles={styles}
    />
  );
}
