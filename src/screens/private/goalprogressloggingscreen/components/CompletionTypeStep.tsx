import React from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { OptionSelectStep } from "./OptionSelectStep";
import type { CompletionType } from "../quranRecitationCompletionTarget";

type Props = {
  currentCompletion: number;
  selectedType: CompletionType;
  onSelectType: (type: CompletionType) => void;
  styles: Record<string, object>;
};

const COMPLETION_TYPE_OPTIONS: CompletionType[] = ["full", "partial", "both"];

export function CompletionTypeStep({
  currentCompletion,
  selectedType,
  onSelectType,
  styles,
}: Props) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();

  return (
    <View style={{ alignItems: "center", gap: 10 }}>
      <Text style={styles.recitationProgressLabel}>
        {t("progressLogging.completionCurrentStep", {
          completion: formatNumber(currentCompletion),
        })}
      </Text>
      <OptionSelectStep
        options={COMPLETION_TYPE_OPTIONS}
        selectedValue={selectedType}
        onSelectValue={onSelectType}
        getLabel={(option) => t(`progressLogging.completionType_${option}`)}
        styles={styles}
      />
    </View>
  );
}
