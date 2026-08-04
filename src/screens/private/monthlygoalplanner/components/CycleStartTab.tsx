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
  const cycleStartDate = selectedStartDate;
  const [calMonth, setCalMonth] = useState(() =>
    selectedStartDate
      ? moment(selectedStartDate, "YYYY-MM-DD")
          .startOf("month")
          .format("YYYY-MM-DD")
      : moment().startOf("month").format("YYYY-MM-DD"),
  );
  const {
    mutateAsync: startEditCycle,
    isPending: isStartEditCyclePending,
  } = useStartEditCycleMutation();

  const localizedMonths = useMemo(
    () => [
      t("monthlyGoalPlanner.months.jan"),
      t("monthlyGoalPlanner.months.feb"),
      t("monthlyGoalPlanner.months.mar"),
      t("monthlyGoalPlanner.months.apr"),
      t("monthlyGoalPlanner.months.may"),
      t("monthlyGoalPlanner.months.jun"),
      t("monthlyGoalPlanner.months.jul"),
      t("monthlyGoalPlanner.months.aug"),
      t("monthlyGoalPlanner.months.sep"),
      t("monthlyGoalPlanner.months.oct"),
      t("monthlyGoalPlanner.months.nov"),
      t("monthlyGoalPlanner.months.dec"),
    ],
    [t],
  );

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
    setCalMonth(
      moment(selectedStartDate, "YYYY-MM-DD")
        .startOf("month")
        .format("YYYY-MM-DD"),
    );
  }, [selectedStartDate]);

  const handleDayPress = useCallback(
    (dateString: string) => {
      const endDate = moment(dateString, "YYYY-MM-DD")
        .add(27, "days")
        .format("YYYY-MM-DD");
      setCalMonth(
        moment(dateString, "YYYY-MM-DD").startOf("month").format("YYYY-MM-DD"),
      );
      onDateSelect?.(dateString, endDate);
    },
    [onDateSelect],
  );

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
  const monthLabel = `${localizedMonths[calMonthMoment.month()]} ${localizeNumber(calMonthMoment.year(), i18n.language)}`;

  const cycleEndDateString =
    selectedEndDate ??
    (cycleStartDate
      ? moment(cycleStartDate, "YYYY-MM-DD").add(27, "days").format("YYYY-MM-DD")
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
          .format(i18n.language === "ar" ? "D MMMM, YYYY" : "MMM D, YYYY");
        return localizeNumber(fmt, i18n.language);
      })()
    : null;

  const cycleRangeLabel =
    cycleStartDate && cycleEndDateString
      ? (() => {
          const startFmt = moment(cycleStartDate, "YYYY-MM-DD")
            .clone()
            .locale(i18n.language)
            .format(i18n.language === "ar" ? "D MMMM" : "MMM D")
            .toUpperCase();
          const endFmt = moment(cycleEndDateString, "YYYY-MM-DD")
            .clone()
            .locale(i18n.language)
            .format(i18n.language === "ar" ? "D MMMM, YYYY" : "MMM D, YYYY")
            .toUpperCase();
          return localizeNumber(`${startFmt} – ${endFmt}`, i18n.language);
        })()
      : null;

  const hijriRangeLabel = (() => {
    if (!cycleStartDate || !cycleEndDateString) return null;
    const startH = moment(cycleStartDate, "YYYY-MM-DD");
    const endH = moment(cycleEndDateString, "YYYY-MM-DD");
    if (!startH.isValid() || !endH.isValid()) return null;
    const startMonthNum = startH.iMonth();
    const endMonthNum = endH.iMonth();
    if (!Number.isFinite(startMonthNum) || !Number.isFinite(endMonthNum)) {
      return null;
    }
    const startLabel = `${localizedHijriMonths[startMonthNum]} ${localizeNumber(startH.iYear(), i18n.language)}`;
    const endLabel =
      startMonthNum === endMonthNum && startH.iYear() === endH.iYear()
        ? ""
        : ` · ${localizedHijriMonths[endMonthNum]} ${localizeNumber(endH.iYear(), i18n.language)}`;
    return `${startLabel}${endLabel}`;
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
        {/* {t("monthlyGoalPlanner.cycleStartDescription")} */}
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
              name={i18n.language === "ar" ? "chevron-forward" : "chevron-back"}
              size={20}
              color={Colors.light.white}
            />
          </TouchableOpacity>

          <View style={styles.monthNavCenter}>
            {cycleRangeLabel ? (
              <Text style={styles.rangeLabel}>{cycleRangeLabel}</Text>
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
              name={i18n.language === "ar" ? "chevron-back" : "chevron-forward"}
              size={20}
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
        mode="dob"
        currentDate={calMonth}
        selectedDate={cycleStartDate ?? undefined}
        endDate={cycleEndDateString ?? undefined}
        onDayPress={handleDayPress}
      />

      {/* ── Cycle info footer — visible only after a date is selected ── */}
      {cycleStartDate && (
        <View style={styles.footer}>
          <Text
            style={[
              styles.infoText,
              i18n.language === "ar" && { textAlign: "right" },
            ]}
          >
            {t("monthlyGoalPlanner.cycleStartFooterStart")}
            <Text style={styles.infoHighlight}>{cycleStartFormatted}</Text>
            {t("monthlyGoalPlanner.cycleStartFooterEnd")}
            <Text style={styles.infoHighlight}>{cycleEndFormatted}</Text>
          </Text>
        </View>
      )}

      <TopSpace top={10} />
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
    alignItems: "center",
    justifyContent: "center",
  },
  monthLabel: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  rangeLabel: {
    color: Colors.light.white,
    fontSize: 13,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    textAlign: "center",
  },
  hijriLabel: {
    color: Colors.light.grey,
    fontSize: 12,
    fontFamily: fonts.primary.regular,
    textAlign: "center",
    marginTop: 2,
  },
  navBtn: {
    padding: 4,
  },
  footer: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  infoText: {
    color: Colors.light.white,
    fontSize: 13,
    fontFamily: fonts.primary.regular,
    lineHeight: 20,
  },
  infoHighlight: {
    color: Colors.light.green,
    fontFamily: fonts.primary.semiBold,
  },
});
