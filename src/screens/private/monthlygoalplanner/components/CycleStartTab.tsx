import { fonts } from "@/assets/fonts";
import { CalendarGrid } from "@/components/molecules/CalendarGrid";
import PrimaryButton from "@/components/atoms/Primary-button";
import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment-hijri";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { localizeNumber } from "@/src/utils/localizeNumbers";
import { useStartEditCycleMutation } from "@/src/api/mutations/useStartEditCycle";

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  onCommit?: (startDate: string, endDate: string) => void;
  onDateSelect?: (startDate: string, endDate: string) => void;
  /** Source-of-truth start date from API or parent (YYYY-MM-DD). */
  selectedStartDate?: string | null;
  /** Source-of-truth end date from API or parent (YYYY-MM-DD). */
  selectedEndDate?: string | null;
};

// ── Component ─────────────────────────────────────────────────────────────────

export const CycleStartTab = ({
  onCommit,
  onDateSelect,
  selectedStartDate = null,
  selectedEndDate = null,
}: Props) => {
  const { t, i18n } = useTranslation();
  const tomorrowDateString = useMemo(
    () => moment().add(1, "day").format("YYYY-MM-DD"),
    [],
  );
  const [localCycleStartDate, setLocalCycleStartDate] = useState<string>(
    selectedStartDate ?? tomorrowDateString,
  );
  const cycleStartDate = selectedStartDate ?? localCycleStartDate;
  const [windowStartDate, setWindowStartDate] =
    useState<string>(cycleStartDate);

  const { mutateAsync: startEditCycle, isPending: isStartEditCyclePending } =
    useStartEditCycleMutation();

  const localizedHijriMonths = useMemo(
    () => [
      t("monthlyGoalPlanner.hijriMonthsShort.muh"),
      t("monthlyGoalPlanner.hijriMonthsShort.saf"),
      t("monthlyGoalPlanner.hijriMonthsShort.rabI"),
      t("monthlyGoalPlanner.hijriMonthsShort.rabII"),
      t("monthlyGoalPlanner.hijriMonthsShort.jumI"),
      t("monthlyGoalPlanner.hijriMonthsShort.jumII"),
      t("monthlyGoalPlanner.hijriMonthsShort.raj"),
      t("monthlyGoalPlanner.hijriMonthsShort.sha"),
      t("monthlyGoalPlanner.hijriMonthsShort.ram"),
      t("monthlyGoalPlanner.hijriMonthsShort.shaw"),
      t("monthlyGoalPlanner.hijriMonthsShort.dhulQ"),
      t("monthlyGoalPlanner.hijriMonthsShort.dhulH"),
    ],
    [t],
  );

  // ── Handlers ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!selectedStartDate) return;
    setLocalCycleStartDate(selectedStartDate);
    setWindowStartDate(selectedStartDate);
  }, [selectedStartDate]);

  // New user path: default cycle starts tomorrow and is lifted to parent once.
  useEffect(() => {
    if (selectedStartDate) return;
    const endDate = moment(localCycleStartDate, "YYYY-MM-DD")
      .add(27, "days")
      .format("YYYY-MM-DD");
    onDateSelect?.(localCycleStartDate, endDate);
  }, [localCycleStartDate, onDateSelect, selectedStartDate]);

  const handleDayPress = useCallback(
    (dateString: string) => {
      const endDate = moment(dateString, "YYYY-MM-DD")
        .add(27, "days")
        .format("YYYY-MM-DD");
      setLocalCycleStartDate(dateString);
      setWindowStartDate(dateString);
      onDateSelect?.(dateString, endDate);
    },
    [onDateSelect],
  );

  const goToPrevMonth = useCallback(() => {
    setWindowStartDate((prev) =>
      moment(prev, "YYYY-MM-DD").subtract(1, "month").format("YYYY-MM-DD"),
    );
  }, []);

  const goToNextMonth = useCallback(() => {
    setWindowStartDate((prev) =>
      moment(prev, "YYYY-MM-DD").add(1, "month").format("YYYY-MM-DD"),
    );
  }, []);

  // ── Derived values ──────────────────────────────────────────────────────────

  const windowStartMoment = moment(windowStartDate, "YYYY-MM-DD");
  const windowEndMoment = windowStartMoment.clone().add(27, "days");

  const cycleEndDateString =
    selectedEndDate ??
    (cycleStartDate
      ? moment(cycleStartDate, "YYYY-MM-DD")
          .add(27, "days")
          .format("YYYY-MM-DD")
      : null);

  const cycleStartFormatted = cycleStartDate
    ? (() => {
        const fmt = moment(cycleStartDate, "YYYY-MM-DD")
          .clone()
          .locale(i18n.language)
          .format(i18n.language === "ar" ? "D MMMM" : "MMM D");
        return localizeNumber(fmt, i18n.language);
      })()
    : null;

  const cycleEndFormatted = cycleEndDateString
    ? (() => {
        const fmt = moment(cycleEndDateString, "YYYY-MM-DD")
          .clone()
          .locale(i18n.language)
          .format(i18n.language === "ar" ? "D MMMM" : "MMM D");
        return localizeNumber(fmt, i18n.language);
      })()
    : null;

  // Gregorian range for the currently displayed 28-day window.
  const monthRangeLabel = (() => {
    const dayFmt = i18n.language === "ar" ? "D MMMM" : "MMM D";
    const endFmt = i18n.language === "ar" ? "D MMMM, YYYY" : "MMM D, YYYY";
    const startFmt = windowStartMoment
      .clone()
      .locale(i18n.language)
      .format(dayFmt)
      .toUpperCase();
    const endLabel = windowEndMoment
      .clone()
      .locale(i18n.language)
      .format(endFmt)
      .toUpperCase();
    return localizeNumber(`${startFmt}  –  ${endLabel}`, i18n.language);
  })();

  const hijriRangeLabel = (() => {
    const startMonthNum = windowStartMoment.iMonth();
    const endMonthNum = windowEndMoment.iMonth();
    if (!Number.isFinite(startMonthNum) || !Number.isFinite(endMonthNum)) {
      return null;
    }
    const endYear = localizeNumber(windowEndMoment.iYear(), i18n.language);
    // Figma: "Jum. I - Jum. II 1445" (year once at end when months differ)
    if (
      startMonthNum === endMonthNum &&
      windowStartMoment.iYear() === windowEndMoment.iYear()
    ) {
      return `${localizedHijriMonths[startMonthNum]} ${endYear}`;
    }
    return `${localizedHijriMonths[startMonthNum]} - ${localizedHijriMonths[endMonthNum]} ${endYear}`;
  })();

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <Text
        style={[
          styles.description,
          i18n.language === "ar" && { textAlign: "right" },
        ]}
      >
        {t("monthlyGoalPlanner.cycleStartDescription")}
      </Text>
      <TopSpace top={36} />

      {/* ── Month nav top bar ── */}
      <View style={styles.topBar}>
        <View style={styles.monthNav}>
          <TouchableOpacity
            onPress={goToPrevMonth}
            style={styles.navBtn}
            activeOpacity={0.7}
          >
            <Ionicons
              name={i18n.language === "ar" ? "chevron-forward" : "chevron-back"}
              size={15}
              color={Colors.light.white}
            />
          </TouchableOpacity>

          <View style={styles.monthNavCenter}>
            <Text style={styles.rangeLabel}>{monthRangeLabel}</Text>
          </View>

          <TouchableOpacity
            onPress={goToNextMonth}
            style={styles.navBtn}
            activeOpacity={0.7}
          >
            <Ionicons
              name={i18n.language === "ar" ? "chevron-back" : "chevron-forward"}
              size={15}
              color={Colors.light.white}
            />
          </TouchableOpacity>
        </View>
        {hijriRangeLabel ? (
          <Text style={styles.hijriLabel}>{hijriRangeLabel}</Text>
        ) : null}
      </View>

      {/* ── Calendar grid ── */}
      <CalendarGrid
        mode="cycle_start"
        borderBottomLeftRadius={12}
        borderBottomRightRadius={12}
        currentDate={windowStartDate}
        windowStartDate={windowStartDate}
        windowEndDate={windowEndMoment.format("YYYY-MM-DD")}
        selectedDate={cycleStartDate ?? undefined}
        endDate={cycleEndDateString ?? undefined}
        onDayPress={handleDayPress}
        footer={
          cycleStartDate ? (
            <Text
              style={[
                styles.infoText,
                i18n.language === "ar" && { textAlign: "right" },
              ]}
            >
              {t("monthlyGoalPlanner.cycleStartFooterStart")}
              <Text style={styles.infoHighlight}>{cycleStartFormatted}</Text>
              {t("monthlyGoalPlanner.cycleStartFooterEnd")}
              <Text style={styles.infoHighlight}>{cycleEndFormatted}.</Text>
            </Text>
          ) : null
        }
      />

      <TopSpace top={32} />
      <PrimaryButton
        text={t("monthlyGoalPlanner.commit")}
        isLoading={isStartEditCyclePending}
        disabled={isStartEditCyclePending || !cycleStartDate}
        onPress={() => {
          if (cycleStartDate && cycleEndDateString) {
            onCommit?.(cycleStartDate, cycleEndDateString);
            startEditCycle({ startDate: cycleStartDate });
          }
        }}
      />
    </>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  description: {
    fontSize: 14,
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    letterSpacing: 0.4,
    lineHeight: 20,
  },
  topBar: {
    backgroundColor: Colors.light.calendarBg,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 12,
    alignSelf: "center",
  },
  monthNavCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  rangeLabel: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  hijriLabel: {
    color: Colors.light.grey,
    fontSize: 12,
    fontFamily: fonts.primary.medium,
    textAlign: "center",
    marginTop: 2,
    fontWeight: "500",
  },
  navBtn: {
    padding: 4,
  },
  infoText: {
    color: Colors.light.white,
    fontSize: 12,
    fontFamily: fonts.primary.regular,
    lineHeight: 18,
    fontWeight: "400",
    letterSpacing: 0.2,
    textAlign: "center",
  },
  infoHighlight: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
});
