import { Colors } from "@/constants/theme";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import moment from "moment-hijri";
import { fonts } from "@/assets/fonts";

export type MenstruationCalendarProps = {
  currentDate: string;
  onDayPress?: (dateString: string) => void;
  selectedDate?: string;
  isMenstruating: boolean;
};

export const MenstruationCalendar = ({
  currentDate,
  onDayPress,
  selectedDate,
  isMenstruating,
}: MenstruationCalendarProps) => {
  const today = moment().format("YYYY-MM-DD");
  // When switch is OFF, always lock selection to today
  const effectiveSelected = isMenstruating ? (selectedDate ?? today) : today;
  const textColor = isMenstruating ? Colors.light.white : Colors.light.subtext;

  return (
    <View style={styles.wrapper}>
      <Calendar
        key={`${currentDate}-${isMenstruating}-${effectiveSelected}`}
        current={currentDate}
        hideArrows
        renderHeader={() => null}
        markingType="custom"
        markedDates={{}}
        theme={{
          calendarBackground: Colors.light.calendarBg,
          dayTextColor: textColor,
          textDisabledColor: Colors.light.grey,
          monthTextColor: textColor,
          textSectionTitleColor: textColor,
          todayTextColor: isMenstruating ? Colors.light.white : Colors.light.subtext,
          selectedDayBackgroundColor: Colors.light.green,
          selectedDayTextColor: Colors.light.white,
        }}
        dayComponent={({ date }: { date?: DateData }) => {
          if (!date) return null;
          const ds = date.dateString;

          const hijriDay = moment(ds, "YYYY-MM-DD").iDate();
          const isSelected = ds === effectiveSelected;

          let cellBg: ViewStyle = {};
          if (isSelected) {
            cellBg = { backgroundColor: Colors.light.calendarTodayBg };
          }

          return (
            <TouchableOpacity
              onPress={() => {
                if (isMenstruating) onDayPress?.(ds);
              }}
              activeOpacity={isMenstruating ? 0.7 : 1}
              disabled={!isMenstruating}
            >
              <View style={[styles.dayCell, cellBg]}>
                {isSelected && <View style={styles.redDot} />}
                <View style={styles.circle}>
                  <Text style={[styles.dayGregorian, { color: textColor }]}>
                    {date.day}
                  </Text>
                </View>
                <Text style={[styles.dayHijri, { color: textColor }]}>{hijriDay}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: "hidden",
  },
  dayCell: {
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 48,
    paddingVertical: 2,
    borderRadius: 6,
    position: "relative",
  },
  redDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.red,
    position: "absolute",
    top: 2,
    right: 6,
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  dayGregorian: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: fonts.primary.semiBold,
  },
  dayHijri: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: "500",
    fontFamily: fonts.primary.semiBold,
  },
});

export default MenstruationCalendar;
