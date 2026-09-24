import React, { useState } from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { JuzStepper } from "./JuzStepper";
import { MAX_JUZ, MIN_JUZ } from "../quranRecitationCompletionTarget";

type Props = {
  startJuz: number;
  endJuz: number;
  onChangeStartJuz: (value: number) => void;
  onChangeEndJuz: (value: number) => void;
  styles: Record<string, object>;
  /** Inclusive goal range — steppers cannot leave these bounds. */
  minJuz?: number;
  maxJuz?: number;
};

type FocusedStepper = "start" | "end";

export function JuzRangeStep({
  startJuz,
  endJuz,
  onChangeStartJuz,
  onChangeEndJuz,
  styles,
  minJuz = MIN_JUZ,
  maxJuz = MAX_JUZ,
}: Props) {
  const { t } = useTranslation();
  const [focused, setFocused] = useState<FocusedStepper>("start");
  const goalMin = Math.max(MIN_JUZ, Math.min(minJuz, maxJuz));
  const goalMax = Math.min(MAX_JUZ, Math.max(minJuz, maxJuz));

  const handleStartChange = (value: number) => {
    onChangeStartJuz(value);
    if (value > endJuz) {
      onChangeEndJuz(value);
    }
  };

  return (
    <View style={{ alignItems: "center", gap: 8 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <JuzStepper
          value={startJuz}
          min={goalMin}
          max={goalMax}
          onChange={handleStartChange}
          styles={styles}
          focused={focused === "start"}
          onFocus={() => setFocused("start")}
        />
        <Text
          style={{
            color: Colors.light.white,
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          {t("progressLogging.juzRangeTo")}
        </Text>
        <JuzStepper
          value={endJuz}
          min={Math.max(goalMin, startJuz)}
          max={goalMax}
          onChange={onChangeEndJuz}
          styles={styles}
          focused={focused === "end"}
          onFocus={() => setFocused("end")}
        />
      </View>
      <Text
        style={{
          color: Colors.light.white,
          fontSize: 12,
          fontWeight: "500",
          opacity: 0.9,
          alignSelf: "flex-start",
          marginLeft: 4,
        }}
      >
        {t("progressLogging.juzPrefixLegend")}
      </Text>
    </View>
  );
}
