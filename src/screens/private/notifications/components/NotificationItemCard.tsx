import React from "react";
import { View, Text } from "react-native";
import { Colors } from "@/constants/theme";
import { notificationsStyles as styles } from "../style";
import { SwitchButton } from "@/components/atoms/SwitchButton";
import { SharedValue } from "react-native-reanimated";

type Props = {
  title: string;
  description: React.ReactNode;
  value: SharedValue<boolean>;
  onToggle: () => void;
};

export default function NotificationItemCard({ title, description, value, onToggle }: Props) {
  return (
    <View style={styles.notificationItem}>
      <View style={styles.row}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <SwitchButton
          value={value}
          onPress={onToggle}
          trackColors={{ off: Colors.light.subtext, on: Colors.light.dullWhiteOpacity }}
          thumbColors={{ off: Colors.light.white, on: Colors.light.green }}
          size="small"
        />
      </View>
      <Text style={styles.descriptionText}>{description}</Text>
    </View>
  );
}
