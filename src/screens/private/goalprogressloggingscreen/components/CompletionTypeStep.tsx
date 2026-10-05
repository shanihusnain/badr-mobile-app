import React from "react";
import { useTranslation } from "react-i18next";
import { OptionSelectStep } from "./OptionSelectStep";
import type { CompletionType } from "../quranRecitationCompletionTarget";

type Props = {
  selectedType: CompletionType;
  onSelectType: (type: CompletionType) => void;
  styles: Record<string, object>;
};

const COMPLETION_TYPE_OPTIONS: CompletionType[] = ["full", "partial", "both"];

export function CompletionTypeStep({
  selectedType,
  onSelectType,
  styles,
}: Props) {
  const { t } = useTranslation();

  return (
    <OptionSelectStep
      options={COMPLETION_TYPE_OPTIONS}
      selectedValue={selectedType}
      onSelectValue={onSelectType}
      getLabel={(option) => t(`progressLogging.completionType_${option}`)}
      styles={styles}
    />
  );
}
