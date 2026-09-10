import React from "react";
import { View, Text } from "react-native";
import { Colors } from "@/constants/theme";
import { hideMetricsStyles as styles } from "../style";
import { SwitchButton } from "@/components/atoms/SwitchButton";
import { SharedValue } from "react-native-reanimated";

type Props = {
  title: string;
  description: string;
  value: SharedValue<boolean>;
  onToggle: () => void;
};

export default function SettingCard({ title, description, value, onToggle }: Props) {
  return (
    <View style={styles.settingBlock}>
      <View style={styles.settingRow}>
        <Text style={styles.settingTitle}>{title}</Text>
        <SwitchButton
          value={value}
          onPress={onToggle}
          trackColors={{ off: Colors.light.subtext, on: Colors.light.dullWhiteOpacity }}
          thumbColors={{ off: Colors.light.white, on: Colors.light.green }}
          size="small"
        />
      </View>
      <Text style={styles.settingDescription}>{description}</Text>
    </View>
  );
}
