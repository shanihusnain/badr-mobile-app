import React, { useCallback, useMemo, useState } from "react";
import { Text, TouchableOpacity, View, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import moment from "moment-hijri";
import { Colors } from "@/constants/theme";
import { GoalData } from "../../home/components/goalsData";
import {
  getProgressLogConfig,
  LogStepId,
  PrayerName,
  PRAYER_OPTIONS,
  TimingOption,
  CongregationOption,
} from "../progressLoggingConfig";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { DateStep } from "./DateStep";
import { PrayerSelectStep } from "./PrayerSelectStep";
import { OptionSelectStep } from "./OptionSelectStep";
import { StartTimeStep, DurationStep } from "./TimePickerSteps";
import { FlowCard } from "./FlowCard";
import { styles } from "./DailyProgressLogging.styles";

export type ProgressLogEntry = {
  date: string;
  prayer?: PrayerName;
  timing?: TimingOption;
  congregation?: CongregationOption;
  startTime?: string;
  duration?: string;
};

type Props = {
  goalData: GoalData;
  onLogComplete?: (entry: ProgressLogEntry) => void;
};

type FlowMode = "collapsed" | "active";

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

const toDateString = (date: Date) => moment(date).format("YYYY-MM-DD");

export default function DailyProgressLogging({
  goalData,
  onLogComplete,
}: Props) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const config = useMemo(
    () => getProgressLogConfig(goalData.id),
    [goalData.id],
  );

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "PRAYER":
        return Colors.light.ringPrayer;
      case "QURAN":
        return Colors.light.ringQuran;
      case "FASTING":
        return Colors.light.green;
      case "SADAQAH":
        return Colors.light.ringSadaqah;
      default:
        return Colors.light.green;
    }
  };

  const categoryColor = getCategoryColor(goalData.category);

  const [flowMode, setFlowMode] = useState<FlowMode>("collapsed");
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerName>("fajr");
  const [timing, setTiming] = useState<TimingOption>("onTime");
  const [congregation, setCongregation] = useState<CongregationOption>("yes");
  const [startHour, setStartHour] = useState("06");
  const [startMinute, setStartMinute] = useState("15");
  const [startPeriod, setStartPeriod] = useState<"am" | "pm">("am");
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [durationHours, setDurationHours] = useState("0");
  const [durationMinutes, setDurationMinutes] = useState("10");

  const todayString = toDateString(new Date());
  const steps = config.steps;
  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const dateLabel =
    selectedDate === todayString
      ? t("progressLogging.today")
      : moment(selectedDate, "YYYY-MM-DD").format("MMM DD");

  const shiftDate = (direction: -1 | 1) => {
    const next = moment(selectedDate, "YYYY-MM-DD")
      .add(direction, "days")
      .format("YYYY-MM-DD");
    if (direction === 1 && next > todayString) return;
    setSelectedDate(next);
  };

  const openFlow = () => {
    setFlowMode("active");
  };

  const resetFlow = useCallback(() => {
    setFlowMode("collapsed");
    setStepIndex(0);
    setSelectedDate(toDateString(new Date()));
    setSelectedPrayer("fajr");
    setTiming("onTime");
    setCongregation("yes");
    setStartHour("06");
    setStartMinute("15");
    setStartPeriod("am");
    setIsPeriodDropdownOpen(false);
    setDurationHours("0");
    setDurationMinutes("10");
  }, []);
  const handleConfirm = () => {
    const entry: ProgressLogEntry = { date: selectedDate };
    if (steps.includes("prayerSelect")) entry.prayer = selectedPrayer;
    if (steps.includes("timing")) entry.timing = timing;
    if (steps.includes("congregation")) entry.congregation = congregation;
    if (steps.includes("startTime")) {
      entry.startTime = `${startHour}:${startMinute} ${startPeriod}`;
    }
    if (steps.includes("duration")) {
      entry.duration = `${durationHours}h ${durationMinutes}m`;
    }

    onLogComplete?.(entry);
    resetFlow();
  };

  const handleBack = () => {
    if (stepIndex === 0) {
      resetFlow();
      return;
    }
    setStepIndex((i) => i - 1);
  };

  const handleForward = () => {
    if (!isLastStep) setStepIndex((i) => i + 1);
  };

  const getStepHeader = (step: LogStepId) => {
    switch (step) {
      case "date":
        return {
          icon: (
            <Ionicons
              name="calendar-outline"
              size={15}
              color={Colors.light.white}
            />
          ),
          label: t("progressLogging.whichDay"),
        };
      case "prayerSelect":
        return {
          icon: (
            <FontAwesome6
              name="person-praying"
              size={13}
              color={Colors.light.white}
            />
          ),
          label: t("progressLogging.selectPrayer"),
        };
      case "timing":
        return {
          icon: (
            <MaterialCommunityIcons
              name="clock-check-outline"
              size={16}
              color={Colors.light.white}
            />
          ),
          label: t("progressLogging.prayedOnTime"),
        };
      case "congregation":
        return {
          icon: (
            <FontAwesome6 name="mosque" size={13} color={Colors.light.white} />
          ),
          label: t("progressLogging.prayedInMosque"),
        };
      case "startTime":
        return {
          icon: (
            <Ionicons
              name="time-outline"
              size={15}
              color={Colors.light.white}
            />
          ),
          label: t("progressLogging.enterStartTime"),
        };
      case "duration":
        return {
          icon: (
            <MaterialCommunityIcons
              name="history"
              size={16}
              color={Colors.light.white}
            />
          ),
          label: t("progressLogging.enterTimeSpent"),
        };
      default:
        return { icon: null, label: "" };
    }
  };

  const getTimingLabel = useCallback(
    (option: TimingOption) =>
      option === "onTime"
        ? t("progressLogging.onTime")
        : t("progressLogging.qadha"),
    [t],
  );

  const getCongregationLabel = useCallback(
    (option: CongregationOption) =>
      option === "yes" ? t("progressLogging.yes") : t("progressLogging.no"),
    [t],
  );

  const renderStepContent = (step: LogStepId) => {
    switch (step) {
      case "date":
        return (
          <DateStep
            dateLabel={dateLabel}
            selectedDate={selectedDate}
            todayString={todayString}
            onShiftDate={shiftDate}
            styles={styles}
          />
        );

      case "prayerSelect":
        return (
          <PrayerSelectStep
            selectedPrayer={selectedPrayer}
            onSelectPrayer={setSelectedPrayer}
            categoryColor={categoryColor}
            t={t}
            styles={styles}
          />
        );

      case "timing":
        return (
          <OptionSelectStep<TimingOption>
            options={["onTime", "qadha"]}
            selectedValue={timing}
            onSelectValue={setTiming}
            getLabel={getTimingLabel}
            radioInnerColor={Colors.light.white}
            styles={styles}
          />
        );

      case "congregation":
        return (
          <OptionSelectStep<CongregationOption>
            options={["yes", "no"]}
            selectedValue={congregation}
            onSelectValue={setCongregation}
            getLabel={getCongregationLabel}
            radioInnerColor={Colors.light.white}
            styles={styles}
          />
        );

      case "startTime":
        return (
          <StartTimeStep
            startHour={startHour}
            setStartHour={setStartHour}
            startMinute={startMinute}
            setStartMinute={setStartMinute}
            startPeriod={startPeriod}
            setStartPeriod={setStartPeriod}
            isPeriodDropdownOpen={isPeriodDropdownOpen}
            setIsPeriodDropdownOpen={setIsPeriodDropdownOpen}
            styles={styles}
          />
        );

      case "duration":
        return (
          <DurationStep
            durationHours={durationHours}
            setDurationHours={setDurationHours}
            durationMinutes={durationMinutes}
            setDurationMinutes={setDurationMinutes}
            styles={styles}
          />
        );

      default:
        return null;
    }
  };

  const header = getStepHeader(currentStep);

  return (
    <View
      style={[styles.section, flowMode === "active" && styles.activeSection]}
    >
      <Text style={styles.sectionTitle}>{t("progressLogging.myProgress")}</Text>

      <View style={styles.cardAnchor}>
        {flowMode === "collapsed" ? (
          <View style={styles.summaryCard}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {t("progressLogging.inProgress")}
              </Text>
            </View>

            <View style={styles.summaryBody}>
              <View style={styles.summaryIconCircle}>
                <FontAwesome6
                  name="person-praying"
                  size={18}
                  color={Colors.light.white}
                />
              </View>
              <View style={styles.summaryTextBlock}>
                <Text style={styles.summaryTitle}>
                  {t(config.summaryTitleKey, { defaultValue: goalData.title })}
                </Text>
                <Text style={styles.summarySubtext}>
                  <Text style={styles.summarySubtextRegular}>
                    ({t("progressLogging.total")}
                  </Text>
                  <Text style={styles.summarySubtextBold}>
                    {" "}
                    {formatNumber(config.totalCount)}{" "}
                  </Text>
                  <Text style={styles.summarySubtextRegular}>
                    {t(config.totalUnitKey)})
                  </Text>
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={openFlow}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={22} color={Colors.light.white} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Pressable style={styles.backdrop} onPress={resetFlow} />

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={resetFlow}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={20} color={Colors.light.white} />
            </TouchableOpacity>

            <View style={styles.flowCardLayer}>
              <FlowCard
                headerIcon={header.icon}
                headerLabel={header.label}
                onBack={handleBack}
                onForward={handleForward}
                onConfirm={handleConfirm}
                canGoForward={!isLastStep}
                styles={styles}
                style={styles.inPlaceFlowCard}
              >
                {renderStepContent(currentStep)}
              </FlowCard>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
