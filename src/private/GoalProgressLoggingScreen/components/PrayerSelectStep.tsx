import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { PrayerName, PRAYER_OPTIONS } from "../progressLoggingConfig";

const PRAYER_ICONS: Record<
  PrayerName,
  keyof typeof MaterialCommunityIcons.glyphMap
> = {
  fajr: "weather-sunset-up",
  dhuhr: "white-balance-sunny",
  asr: "weather-partly-cloudy",
  maghrib: "weather-sunset",
  isha: "weather-night",
};

interface PrayerSelectStepProps {
  selectedPrayer: PrayerName;
  onSelectPrayer: (prayer: PrayerName) => void;
  categoryColor: string;
  t: (key: string) => string;
  styles: any;
}

interface PrayerItemProps {
  prayer: PrayerName;
  isSelected: boolean;
  onSelectPrayer: (prayer: PrayerName) => void;
  categoryColor: string;
  t: (key: string) => string;
  styles: any;
}

const PrayerItem = React.memo(({
  prayer,
  isSelected,
  onSelectPrayer,
  categoryColor,
  t,
  styles,
}: PrayerItemProps) => {
  const handlePress = React.useCallback(() => {
    onSelectPrayer(prayer);
  }, [onSelectPrayer, prayer]);

  return (
    <TouchableOpacity
      style={styles.prayerColumn}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={styles.prayerLabel}>
        {t(`prayerGoals.${prayer}`).toUpperCase()}
      </Text>
      <View
        style={[
          styles.prayerIconBox,
          isSelected
            ? styles.prayerIconBoxSelected
            : styles.prayerIconBoxIdle,
        ]}
      >
        <MaterialCommunityIcons
          name={PRAYER_ICONS[prayer]}
          size={18}
          color={isSelected ? categoryColor : Colors.light.white}
        />
      </View>
      {isSelected && (
        <View style={styles.prayerCheckBadge}>
          <Ionicons
            name="checkmark"
            size={8}
            color={categoryColor}
          />
        </View>
      )}
    </TouchableOpacity>
  );
});

export const PrayerSelectStep: React.FC<PrayerSelectStepProps> = ({
  selectedPrayer,
  onSelectPrayer,
  categoryColor,
  t,
  styles,
}) => {
  return (
    <View style={styles.prayerGrid}>
      {PRAYER_OPTIONS.map((prayer) => (
        <PrayerItem
          key={prayer}
          prayer={prayer}
          isSelected={selectedPrayer === prayer}
          onSelectPrayer={onSelectPrayer}
          categoryColor={categoryColor}
          t={t}
          styles={styles}
        />
      ))}
    </View>
  );
};
