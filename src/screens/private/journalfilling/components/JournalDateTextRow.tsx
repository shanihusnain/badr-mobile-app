import React, { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { getMonthShortUpper, getWeekdayShort, parseDateKey } from "../journalFillingDateUtils";

type JournalDateTextRowProps = {
  selectedDateKey: string;
  onPressDate: () => void;
  onPressPrevDay: () => void;
  onPressNextDay: () => void;
};

function JournalDateTextRowComponent({
  selectedDateKey,
  onPressDate,
  onPressPrevDay,
  onPressNextDay,
}: JournalDateTextRowProps) {
  const selectedDate = useMemo(
    () => parseDateKey(selectedDateKey),
    [selectedDateKey],
  );

  const label = useMemo(() => {
    const weekday = getWeekdayShort(selectedDate).toUpperCase();
    const month = getMonthShortUpper(selectedDate);
    const day = selectedDate.getDate();
    return `${weekday}, ${month} ${day}`;
  }, [selectedDate]);

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onPressPrevDay}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Previous day"
        style={styles.arrowBtn}
      >
        <Feather name="chevron-left" size={18} color={Colors.light.white} />
      </Pressable>

      <Pressable
        onPress={onPressDate}
        accessibilityRole="button"
        accessibilityLabel="Open calendar"
        hitSlop={10}
        style={styles.centerBtn}
      >
        <Text style={styles.dateText}>{label}</Text>
      </Pressable>

      <Pressable
        onPress={onPressNextDay}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Next day"
        style={styles.arrowBtn}
      >
        <Feather
          name="chevron-right"
          size={18}
          color={Colors.light.white}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: 6,
  },
  arrowBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  centerBtn: {
    flex: 1,
    alignItems: "center",
  },
  dateText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
});

export const JournalDateTextRow = memo(JournalDateTextRowComponent);

