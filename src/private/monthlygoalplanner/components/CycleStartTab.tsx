import { fonts } from "@/assets/fonts";
import { CalendarGrid } from "@/components/molecules/CalendarGrid";
import PrimaryButton from "@/components/atoms/Primary-button";
import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment-hijri";
import { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// ── Constants ─────────────────────────────────────────────────────────────────

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const HIJRI_MONTHS_SHORT = [
  "Muh.",
  "Saf.",
  "Rab. I",
  "Rab. II",
  "Jum. I",
  "Jum. II",
  "Raj.",
  "Sha.",
  "Ram.",
  "Shaw.",
  "Dhul Q.",
  "Dhul H.",
];

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  onCommit?: (startDate: string, endDate: string) => void;
};

// ── Component ─────────────────────────────────────────────────────────────────

export const CycleStartTab = ({ onCommit }: Props) => {
  const [cycleStartDate, setCycleStartDate] = useState<string | null>(null);
  const [calMonth, setCalMonth] = useState(() =>
    moment().startOf("month").format("YYYY-MM-DD"),
  );

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleDayPress = useCallback((dateString: string) => {
    setCycleStartDate(dateString);
    setCalMonth(
      moment(dateString, "YYYY-MM-DD").startOf("month").format("YYYY-MM-DD"),
    );
  }, []);

  const goToPrevMonth = useCallback(() => {
    setCalMonth((prev) =>
      moment(prev, "YYYY-MM-DD").subtract(1, "month").format("YYYY-MM-DD"),
    );
  }, []);

  const goToNextMonth = useCallback(() => {
    setCalMonth((prev) =>
      moment(prev, "YYYY-MM-DD").add(1, "month").format("YYYY-MM-DD"),
    );
  }, []);

  // ── Derived values ──────────────────────────────────────────────────────────

  const calMonthMoment = moment(calMonth, "YYYY-MM-DD");
  const monthLabel = `${MONTHS[calMonthMoment.month()]} ${calMonthMoment.year()}`;

  const cycleEndDate = cycleStartDate
    ? moment(cycleStartDate, "YYYY-MM-DD").add(27, "days")
    : null;

  const cycleStartFormatted = cycleStartDate
    ? moment(cycleStartDate, "YYYY-MM-DD").format("MMM D")
    : null;

  const cycleEndFormatted = cycleEndDate
    ? cycleEndDate.format("MMM D, YYYY")
    : null;

  const cycleRangeLabel =
    cycleStartDate && cycleEndDate
      ? `${moment(cycleStartDate, "YYYY-MM-DD").format("MMM D").toUpperCase()} – ${cycleEndDate.format("MMM D, YYYY").toUpperCase()}`
      : null;

  const hijriRangeLabel = (() => {
    if (!cycleStartDate || !cycleEndDate) return null;
    const startH = moment(cycleStartDate, "YYYY-MM-DD");
    const endH = cycleEndDate;
    const startMonthNum = startH.iMonth();
    const endMonthNum = endH.iMonth();
    const startLabel = `${HIJRI_MONTHS_SHORT[startMonthNum]} ${startH.iYear()}`;
    const endLabel =
      startMonthNum === endMonthNum && startH.iYear() === endH.iYear()
        ? ""
        : ` · ${HIJRI_MONTHS_SHORT[endMonthNum]} ${endH.iYear()}`;
    return `${startLabel}${endLabel}`;
  })();

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <Text style={styles.description}>
        Choose the day you'd like to begin your commitment. You'll have 4 weeks
        (28 days) from the date to complete your goals.
      </Text>
      <TopSpace top={10} />

      {/* ── Month nav top bar ── */}
      <View style={styles.topBar}>
        <View style={styles.monthNav}>
          <TouchableOpacity
            onPress={goToPrevMonth}
            style={styles.navBtn}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={Colors.light.white}
            />
          </TouchableOpacity>

          <View style={styles.monthNavCenter}>
            {cycleRangeLabel ? (
              <>
                <Text style={styles.rangeLabel}>{cycleRangeLabel}</Text>
                <Text style={styles.hijriLabel}>{hijriRangeLabel}</Text>
              </>
            ) : (
              <Text style={styles.monthLabel}>{monthLabel}</Text>
            )}
          </View>

          <TouchableOpacity
            onPress={goToNextMonth}
            style={styles.navBtn}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.light.white}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Calendar grid ── */}
      <CalendarGrid
        mode="dob"
        currentDate={calMonth}
        selectedDate={cycleStartDate ?? undefined}
        onDayPress={handleDayPress}
      />

      {/* ── Cycle info footer — visible only after a date is selected ── */}
      {cycleStartDate && (
        <View style={styles.footer}>
          <Text style={styles.infoText}>
            {"Your 28-day goal cycle will run from "}
            <Text style={styles.infoHighlight}>{cycleStartFormatted}</Text>
            {" to "}
            <Text style={styles.infoHighlight}>{cycleEndFormatted}</Text>
          </Text>
        </View>
      )}

      <TopSpace top={10} />
      <PrimaryButton
        text={"COMMIT"}
        onPress={() => {
          if (cycleStartDate && cycleEndDate) {
            onCommit?.(cycleStartDate, cycleEndDate.format("YYYY-MM-DD"));
          }
        }}
      />
    </>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  description: {
    fontSize: 13,
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    lineHeight: 20,
  },
  topBar: {
    backgroundColor: Colors.light.calendarBg,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
    alignSelf: "center",
  },
  monthNavCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navBtn: {
    padding: 8,
  },
  monthLabel: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  rangeLabel: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    textAlign: "center",
  },
  hijriLabel: {
    color: Colors.light.grey,
    fontSize: 11,
    fontFamily: fonts.primary.regular,
    textAlign: "center",
    marginTop: 2,
  },
  footer: {
    backgroundColor: Colors.light.calendarBg,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
  },
  infoText: {
    color: Colors.light.dullWhite,
    fontSize: 14,
    fontFamily: fonts.primary.regular,
    lineHeight: 22,
    flex: 1,
  },
  infoHighlight: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
});
