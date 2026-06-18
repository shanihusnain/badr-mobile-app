import React from "react";
import { Text, View } from "react-native";
import { Colors } from "@/constants/theme";
import { JuzStepper } from "./JuzStepper";
import { MAX_JUZ, MIN_JUZ } from "../quranRecitationCompletionTarget";

type Props = {
  startJuz: number;
  endJuz: number;
  onChangeStartJuz: (value: number) => void;
  onChangeEndJuz: (value: number) => void;
  styles: Record<string, object>;
};

export function JuzRangeStep({
  startJuz,
  endJuz,
  onChangeStartJuz,
  onChangeEndJuz,
  styles,
}: Props) {
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
          min={MIN_JUZ}
          max={MAX_JUZ}
          onChange={handleStartChange}
          styles={styles}
        />
        <Text
          style={{
            color: Colors.light.white,
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          to
        </Text>
        <JuzStepper
          value={endJuz}
          min={Math.max(MIN_JUZ, startJuz)}
          max={MAX_JUZ}
          onChange={onChangeEndJuz}
          styles={styles}
        />
      </View>
    </View>
  );
}
