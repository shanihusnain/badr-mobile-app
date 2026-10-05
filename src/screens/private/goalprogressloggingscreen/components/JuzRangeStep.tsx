import React, { useState } from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { JuzStepper } from "./JuzStepper";
import {
  MAX_JUZ,
  MIN_JUZ,
  snapJuzOffExcluded,
} from "../quranRecitationCompletionTarget";

type Props = {
  startJuz: number;
  endJuz: number;
  onChangeStartJuz: (value: number) => void;
  onChangeEndJuz: (value: number) => void;
  styles: Record<string, object>;
  /** Inclusive goal range — steppers cannot leave these bounds. */
  minJuz?: number;
  maxJuz?: number;
  /** Fully logged juz — skipped so they cannot be re-selected. */
  excludedJuz?: number[];
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
  excludedJuz = [],
}: Props) {
  const { t } = useTranslation();
  const [focused, setFocused] = useState<FocusedStepper>("start");
  const goalMin = Math.max(MIN_JUZ, Math.min(minJuz, maxJuz));
  const goalMax = Math.min(MAX_JUZ, Math.max(minJuz, maxJuz));

  const handleStartChange = (value: number) => {
    const nextStart = snapJuzOffExcluded(value, goalMin, goalMax, excludedJuz);
    onChangeStartJuz(nextStart);
    if (nextStart > endJuz) {
      onChangeEndJuz(nextStart);
    }
  };

  const handleEndChange = (value: number) => {
    const nextEnd = snapJuzOffExcluded(
      value,
      Math.max(goalMin, startJuz),
      goalMax,
      excludedJuz,
    );
    onChangeEndJuz(nextEnd);
  };

  return (
    <View style={{ marginTop: 12, alignItems: "center" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <View style={{ alignItems: "center", gap: 4 }}>
          <JuzStepper
            value={startJuz}
            min={goalMin}
            max={goalMax}
            excluded={excludedJuz}
            onChange={handleStartChange}
            styles={styles}
            focused={focused === "start"}
            onFocus={() => setFocused("start")}
          />
          <Text
            style={{
              color: Colors.light.white,
              fontSize: 10.5,
              fontWeight: "500",
              opacity: 0.6,
              textAlign: "center",
            }}
          >
            {t("progressLogging.juzPrefixLegend")}
          </Text>
        </View>
        <View style={{ height: 24, justifyContent: "center" }}>
          <Text
            style={{
              color: Colors.light.white,
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            {t("progressLogging.juzRangeTo")}
          </Text>
        </View>
        <JuzStepper
          value={endJuz}
          min={Math.max(goalMin, startJuz)}
          max={goalMax}
          excluded={excludedJuz}
          onChange={handleEndChange}
          styles={styles}
          focused={focused === "end"}
          onFocus={() => setFocused("end")}
        />
      </View>
    </View>
  );
}
