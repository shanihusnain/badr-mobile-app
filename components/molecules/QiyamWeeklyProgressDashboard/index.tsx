import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export type QiyamDayProgress = {
  day: string;
  isLogged?: boolean;
  prayersLogged: number;
  isBestDay?: boolean;
  isMenstruation?: boolean;
  isFuture?: boolean;
  isMissedStrict?: boolean;
  isMissedFlexible?: boolean;
  
  loggedTime?: "after-isha" | "before-fajr" | "both";
  gender?: "male" | "female";
  isWitrPending?: boolean;
};

export type QiyamWeeklyProgressDashboardProps = {
  weekDays: QiyamDayProgress[];
  weekRangeLabel?: string;
  weekFraction?: string;
  totalPrayersThisWeek?: number;
  streakDays?: number;
  motivationalQuote?: string;
  selectedDayIndex?: number;
  statsIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onDayPress?: (index: number) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
};

const CARD_HORIZONTAL_PADDING = 16;
const WRAPPER_WIDTH_RATIO = 0.92;
const RING_SIZE_MAX = 34;

type DayIconProps = {
  day: QiyamDayProgress;
  size: number;
};

function QiyamDayIcon({ day, size }: DayIconProps) {
  const innerSizeStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  };

  if (day.isMenstruation) {
    return (
      <View style={[innerSizeStyle, styles.ringMenstruation]} />
    );
  }

  if (day.isFuture) {
    return (
      <View style={[innerSizeStyle, styles.ringFuture]} />
    );
  }

  if (day.isMissedStrict) {
    return (
      <View style={[innerSizeStyle, styles.ringMissedStrict]} />
    );
  }

  if (day.isMissedFlexible) {
    return (
      <View style={[innerSizeStyle, styles.ringMissedFlexible]} />
    );
  }

  if (day.isLogged || day.loggedTime) {
    const isWitrPending = day.isWitrPending;
    return (
      <View style={[
        innerSizeStyle,
        styles.ringLogged,
        isWitrPending && styles.ringWitrPending
      ]}>
        {renderLoggedIcon(day)}
      </View>
    );
  }

  return (
    <View style={[innerSizeStyle, styles.ringEmpty]} />
  );
}

function renderLoggedIcon(day: QiyamDayProgress) {
  const iconColor = Colors.light.white;
  const iconSize = 14;

  const moonIcon = <MaterialCommunityIcons name="star-crescent" size={iconSize} color={iconColor} />;
  const malePrayIcon = <MaterialCommunityIcons name="human-handsdown" size={iconSize} color={iconColor} />;
  const femalePrayIcon = <MaterialCommunityIcons name="human-female" size={iconSize} color={iconColor} />; // Alternative: just use prayer beads or something if needed, but human-female provides distinction. Actually, if they are the same in the library, we can just use "pray" or "human-handsdown" for both if gender specific doesn't exist, but we have "human-female" as a fallback. Let's use human-handsdown for both if no female specific praying exists, or human-female for female. Let's use human-handsdown as it represents praying best.

  const prayingIcon = day.gender === "female" ? femalePrayIcon : malePrayIcon;

  if (day.loggedTime === "after-isha") {
    return moonIcon;
  }
  if (day.loggedTime === "before-fajr") {
    return prayingIcon;
  }
  if (day.loggedTime === "both") {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <MaterialCommunityIcons name="star-crescent" size={10} color={iconColor} style={{ marginRight: -2 }} />
        <MaterialCommunityIcons name={day.gender === "female" ? "human-female" : "human-handsdown"} size={10} color={iconColor} />
      </View>
    );
  }
  return null;
}

export function QiyamWeeklyProgressDashboard({
  weekDays,
  weekRangeLabel = "Nov 29 — Dec 5",
  weekFraction = "1/4",
  totalPrayersThisWeek = 8,
  streakDays = 7,
  motivationalQuote = "Your Qiyam prayer is a beautiful act. May Allah reward you.",
  selectedDayIndex = 6,
  statsIcon = "rug",
  onDayPress,
  onPrevWeek,
  onNextWeek,
}: QiyamWeeklyProgressDashboardProps) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();

  const availableWidth =
    screenWidth * WRAPPER_WIDTH_RATIO - CARD_HORIZONTAL_PADDING;
  const ringSize = Math.min(
    RING_SIZE_MAX,
    Math.floor((availableWidth / 7) * 0.62)
  );

  const [activeDayIndex, setActiveDayIndex] = useState(selectedDayIndex);

  const handleDayPress = (index: number) => () => {
    setActiveDayIndex(index);
    onDayPress?.(index);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={16}
            color={Colors.light.seagreen}
          />
          <Text style={styles.weekFractionText} numberOfLines={1}>
            {weekFraction} WEEKS
          </Text>
        </View>

        <View style={styles.headerNav}>
          <TouchableOpacity
            onPress={onPrevWeek}
            activeOpacity={0.7}
            style={styles.navBtn}
          >
            <Ionicons
              name="chevron-back"
              size={14}
              color={Colors.light.dullWhite}
            />
          </TouchableOpacity>
          <Text style={styles.weekRangeText} numberOfLines={1}>
            {weekRangeLabel}
          </Text>
          <TouchableOpacity
            onPress={onNextWeek}
            activeOpacity={0.7}
            style={styles.navBtn}
          >
            <Ionicons
              name="chevron-forward"
              size={14}
              color={Colors.light.dullWhite}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.daysRow}>
        {weekDays.map((day, index) => {
          const isSelected = index === activeDayIndex;

          return (
            <TouchableOpacity
              key={`${day.day}-${index}`}
              style={styles.dayColumn}
              onPress={handleDayPress(index)}
              activeOpacity={0.75}
            >
              <View style={[styles.dayItemWrapper, isSelected && styles.dayItemSelected]}>
                <QiyamDayIcon day={day} size={ringSize} />

                <Text
                  style={[
                    day.isBestDay ? styles.bestDayLabel : styles.dayLabel,
                  ]}
                  numberOfLines={1}
                >
                  {day.isBestDay ? "BEST DAY!" : day.day}
                </Text>

                <View style={styles.durationSlot}>
                  {!day.isMenstruation && !day.isFuture && !day.isMissedStrict && !day.isMissedFlexible && (
                    <Text
                      style={[
                        day.isBestDay ? styles.durationTextBest : styles.durationTextNormal,
                        styles.durationText,
                      ]}
                      numberOfLines={1}
                    >
                      {day.isBestDay ? day.prayersLogged.toString() : (day.prayersLogged > 0 ? day.prayersLogged.toString() : "")}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.statsRow}>
        <MaterialCommunityIcons
          name={statsIcon}
          size={24}
          color={Colors.light.lightblue}
        />
        <Text style={styles.statsText} numberOfLines={1}>
          <Text style={styles.statsCount}>
            {totalPrayersThisWeek}
          </Text>
          {totalPrayersThisWeek === 1 ? " total prayer this week" : " total prayers this week"}
        </Text>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.streakBadge}>
          <Ionicons name="flash" size={13} color={Colors.light.yellow} />
          <Text style={styles.streakText}>
            {streakDays}-day streak
          </Text>
        </View>

        <View style={styles.quoteBlock}>
          <MaterialCommunityIcons
            name="target"
            size={14}
            color={Colors.light.seagreen}
          />
          <Text style={styles.quoteText}>{motivationalQuote}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    backgroundColor: Colors.light.greybuttonBackground,
    paddingHorizontal: 8,
    paddingVertical: 20,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 1,
  },
  weekFractionText: {
    color: Colors.light.white,
    fontSize: 13,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
  },
  headerNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    flexShrink: 0,
  },
  navBtn: {
    padding: 2,
  },
  weekRangeText: {
    color: Colors.light.white,
    fontSize: 14,
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
    textAlign: "center",
  },
  daysRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  dayColumn: {
    flex: 1,
    alignItems: "center",
    minWidth: 0,
  },
  dayItemWrapper: {
    alignItems: "center",
    paddingVertical: 12, // Increased padding to make a distinct box
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  dayItemSelected: {
    backgroundColor: Colors.light.dayProgressCardBg,
  },
  ringInnerMenstruation: {
    backgroundColor: Colors.light.red,
  },
  ringMenstruation: {
    backgroundColor: Colors.light.red,
  },
  ringFuture: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.light.selectcategory,
  },
  ringMissedStrict: {
    backgroundColor: Colors.light.golden, // Orange equivalent
  },
  ringMissedFlexible: {
    backgroundColor: Colors.light.selectcategory, // Grey equivalent
  },
  ringLogged: {
    backgroundColor: Colors.light.green,
  },
  ringWitrPending: {
    borderWidth: 2,
    borderColor: Colors.light.yellow,
  },
  ringEmpty: {
    backgroundColor: Colors.light.dullWhiteOpacity,
  },
  bestDayLabel: {
    color: Colors.light.green,
    fontSize: 9,
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
    textAlign: "center",
    marginTop: 8,
  },
  dayLabel: {
    color: Colors.light.subtext,
    fontSize: 10,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    marginTop: 8,
    textAlign: "center",
  },
  durationSlot: {
    height: 14,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 2,
  },
  durationText: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
    textAlign: "center",
  },
  durationTextBest: {
    color: Colors.light.green,
  },
  durationTextNormal: {
    color: Colors.light.grey,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexWrap: "nowrap",
  },
  statsText: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.medium,
    flexShrink: 1,
    fontWeight: "500",
  },
  statsCount: {
    color: Colors.light.white,
    fontWeight: "700",
    fontSize: 22,
    fontFamily: fonts.primary.bold,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  streakText: {
    color: Colors.light.white,
    fontSize: 13,
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
  },
  quoteBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    flex: 1,
  },
  quoteText: {
    flex: 1,
    color: Colors.light.white,
    fontSize: 13,
    lineHeight: 16,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
  },
});
