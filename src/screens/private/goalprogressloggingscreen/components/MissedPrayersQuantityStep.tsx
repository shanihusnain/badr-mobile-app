import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Colors } from "@/constants/theme";
import { PrayerName, PRAYER_OPTIONS } from "../progressLoggingConfig";
import { fonts } from "@/assets/fonts";

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

interface MissedPrayersQuantityStepProps {
  quantities: Record<PrayerName, number>;
  onIncrement: (prayer: PrayerName) => void;
  categoryColor: string;
  totalRequired: number;
}

const PrayerItem = React.memo(({
  prayer,
  quantity,
  onIncrement,
  categoryColor,
  totalRequired,
}: {
  prayer: PrayerName;
  quantity: number;
  onIncrement: (prayer: PrayerName) => void;
  categoryColor: string;
  totalRequired: number;
}) => {
  const handlePress = React.useCallback(() => {
    onIncrement(prayer);
  }, [onIncrement, prayer]);

  const hasQuantity = quantity > 0;

  return (
    <TouchableOpacity
      style={localStyles.prayerColumn}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={localStyles.prayerLabel}>
        {prayer.toUpperCase()}
      </Text>
      <View
        style={[
          localStyles.prayerIconBox,
          hasQuantity ? localStyles.prayerIconBoxSelected : localStyles.prayerIconBoxIdle,
        ]}
      >
        <MaterialCommunityIcons
          name={PRAYER_ICONS[prayer]}
          size={18}
          color={hasQuantity ? categoryColor : Colors.light.white}
        />
      </View>
      <Text style={localStyles.qtyLabel}>
        {quantity}/{totalRequired}
      </Text>
    </TouchableOpacity>
  );
});

export const MissedPrayersQuantityStep: React.FC<MissedPrayersQuantityStepProps> = ({
  quantities,
  onIncrement,
  categoryColor,
  totalRequired,
}) => {
  return (
    <View style={localStyles.prayerGrid}>
      {PRAYER_OPTIONS.map((prayer) => (
        <PrayerItem
          key={prayer}
          prayer={prayer}
          quantity={quantities[prayer] || 0}
          onIncrement={onIncrement}
          categoryColor={categoryColor}
          totalRequired={totalRequired}
        />
      ))}
    </View>
  );
};

const localStyles = StyleSheet.create({
  prayerGrid: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    width: "100%",
    paddingHorizontal: 8,
  },
  prayerColumn: {
    alignItems: "center",
    gap: 6,
  },
  prayerLabel: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 10,
    fontWeight: "600",
  },
  prayerIconBox: {
    width: 44,
    height: 26,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  prayerIconBoxSelected: {
    backgroundColor: Colors.light.white,
  },
  prayerIconBoxIdle: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  qtyLabel: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 10,
    fontWeight: "600",
  },
});
