import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import moment from "moment-hijri";
import { Colors } from "@/constants/theme";
import { GoalData } from "../../home/components/goalsData";
import {
  CongregationOption,
  LogStepId,
  PrayerName,
  TimingOption,
} from "../progressLoggingConfig";
import { DateStep } from "../components/DateStep";
import { PrayerSelectStep } from "../components/PrayerSelectStep";
import { OptionSelectStep } from "../components/OptionSelectStep";
import { StartTimeStep, DurationStep } from "../components/TimePickerSteps";
import { FlowCard } from "../components/FlowCard";
import { styles as commonStyles } from "../components/DailyProgressLogging.styles";
import { fonts } from "@/assets/fonts";
import type { ProgressLogEntry } from "../types";
import { useOptionalPrayerGoalFrameContext } from "../prayerGoalFrameContext";
import {
  getPrayerFrameAchievementLabel,
  prayerFrameShowsInsights,
} from "@/src/utils/prayerGoalFrameMap";
import {
  AddLoggingFlowIcon,
  CalendarFlippingIcon,
  WhiteClockIcon,
  WhiteTimerIcon,
} from "@/assets/icons";
import { FiveDailyPrayerIDetailedIbadhasIcon } from "@/assets/icons/FiveDailyPrayerIDetailedIbadhasIcon";
import { useLogFiveDailyPrayersGoal } from "@/src/api/mutations/useLogFiveDailyPrayersGoal";
import type { FiveDailyPrayerSlot } from "@/src/api/mutations/useLogFiveDailyPrayersGoal";

const STEPS: LogStepId[] = [
  "date",
  "prayerSelect",
  "timing",
  "congregation",
  "startTime",
  "duration",
];

type Props = {
  goalData: GoalData;
  onLogComplete?: (entry: ProgressLogEntry) => void;
};

type FlowMode = "collapsed" | "active";

const PRAYER_TO_SLOT: Record<PrayerName, FiveDailyPrayerSlot> = {
  fajr: "FAJR",
  dhuhr: "DHUHR",
  asr: "ASR",
  maghrib: "MAGHRIB",
  isha: "ISHA",
};

const toDateString = (date: Date) => moment(date).format("YYYY-MM-DD");

export default function FiveDailyPrayersLoggingFlow({
  goalData,
  onLogComplete,
}: Props) {
  const { t } = useTranslation();
  const { mutateAsync: logFiveDailyPrayers, isPending: isLogging } =
    useLogFiveDailyPrayersGoal();

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

  const prayerFrame = useOptionalPrayerGoalFrameContext();
  const frame = prayerFrame?.frame;
  const frameLoading =
    prayerFrame?.isLoading || (!frame && !prayerFrame?.isError);

  const cycleStartHijri = frame?.cycle?.cycleStart
    ? toDateString(new Date(frame.cycle.cycleStart))
    : undefined;
  const cycleEndHijri = frame?.cycle?.cycleEnd
    ? toDateString(new Date(frame.cycle.cycleEnd))
    : undefined;

  const goalLabel = frame?.goal.label ?? "---";

  const badgeStatus = useMemo(() => {
    if (!frame) {
      return {
        text: "---",
        type: "in-progress" as const,
      };
    }
    return getPrayerFrameAchievementLabel(frame, t);
  }, [frame, t]);

  const showInsights = frame ? prayerFrameShowsInsights(frame) : false;
  const isFullyAchieved = (frame?.goal.achievementPct ?? 0) >= 100;

  const todayString = toDateString(new Date());
  const maxSelectableDate = cycleEndHijri
    ? cycleEndHijri < todayString
      ? cycleEndHijri
      : todayString
    : todayString;

  useEffect(() => {
    if (!cycleStartHijri || !cycleEndHijri) return;
    if (selectedDate < cycleStartHijri) setSelectedDate(cycleStartHijri);
    else if (selectedDate > maxSelectableDate) {
      setSelectedDate(maxSelectableDate);
    }
  }, [cycleStartHijri, cycleEndHijri, maxSelectableDate]);

  const currentStep = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  const dateLabel =
    selectedDate === todayString
      ? t("progressLogging.today")
      : moment(selectedDate, "YYYY-MM-DD").format("MMM DD");

  const shiftDate = (direction: -1 | 1) => {
    const next = moment(selectedDate, "YYYY-MM-DD")
      .add(direction, "days")
      .format("YYYY-MM-DD");

    if (cycleStartHijri && direction === -1 && next < cycleStartHijri) return;
    if (direction === 1 && next > maxSelectableDate) return;

    setSelectedDate(next);
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

  const formatStartTimeForApi = () => {
    const hourNum = parseInt(startHour || "0", 10) || 0;
    const minuteNum = parseInt(startMinute || "0", 10) || 0;

    let hour24 = hourNum % 12;
    if (startPeriod === "pm") hour24 += 12;

    const hh = String(Math.max(0, hour24)).padStart(2, "0");
    const mm = String(Math.max(0, minuteNum)).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const buildDurationMinutesForApi = () => {
    const h = parseInt(durationHours || "0", 10) || 0;
    const m = parseInt(durationMinutes || "0", 10) || 0;
    return h * 60 + m;
  };

  const handleConfirm = () => {
    if (isLogging) return;

    const run = async () => {
      const prayedOnTime = timing === "onTime";
      const payload = {
        date: selectedDate,
        prayerSlot: PRAYER_TO_SLOT[selectedPrayer],
        prayedOnTime,
        wasQadha: !prayedOnTime,
        wasCongregational: congregation === "yes",
        startTime: formatStartTimeForApi(),
        durationMinutes: buildDurationMinutesForApi(),
      };

      try {
        await logFiveDailyPrayers(payload);
        await prayerFrame?.refetch();

        onLogComplete?.({
          type: "five-daily-prayers",
          goalId: goalData.id,
          date: selectedDate,
          prayer: selectedPrayer,
          timing,
          congregation,
          startTime: payload.startTime,
          duration: `${durationHours}h ${durationMinutes}m`,
        });
        resetFlow();
      } catch {
        // onError handler already shows toast.
      }
    };

    void run();
  };

  const handleBack = () => {
    if (stepIndex === 0) {
      resetFlow();
      return;
    }
    setStepIndex((index) => index - 1);
  };

  const handleForward = () => {
    if (!isLastStep) setStepIndex((index) => index + 1);
  };

  const handleOpenFlow = useCallback(() => {
    if (frameLoading || isFullyAchieved) return;
    setFlowMode("active");
  }, [frameLoading, isFullyAchieved]);

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

  const getStepHeader = (step: LogStepId) => {
    switch (step) {
      case "date":
        return {
          icon: <CalendarFlippingIcon />,
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
            <Ionicons
              name="checkmark-circle-outline"
              size={15}
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
          icon: <WhiteClockIcon />,
          label: t("progressLogging.enterStartTime"),
        };
      case "duration":
        return {
          icon: <WhiteTimerIcon />,
          label: t("progressLogging.enterTimeSpent"),
        };
      default:
        return { icon: null, label: "" };
    }
  };

  const renderStepContent = (step: LogStepId) => {
    switch (step) {
      case "date":
        return (
          <DateStep
            dateLabel={dateLabel}
            selectedDate={selectedDate}
            todayString={todayString}
            onShiftDate={shiftDate}
            styles={commonStyles}
          />
        );
      case "prayerSelect":
        return (
          <PrayerSelectStep
            selectedPrayer={selectedPrayer}
            onSelectPrayer={setSelectedPrayer}
            categoryColor={Colors.light.green}
            t={t}
            styles={commonStyles}
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
            styles={commonStyles}
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
            styles={commonStyles}
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
            styles={commonStyles}
          />
        );
      case "duration":
        return (
          <DurationStep
            durationHours={durationHours}
            setDurationHours={setDurationHours}
            durationMinutes={durationMinutes}
            setDurationMinutes={setDurationMinutes}
            styles={commonStyles}
          />
        );
      default:
        return null;
    }
  };

  const stepHeader = getStepHeader(currentStep);

  return (
    <>
      {flowMode === "active" && (
        <TouchableOpacity
          style={commonStyles.cancelButton}
          onPress={resetFlow}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={20} color={Colors.light.white} />
        </TouchableOpacity>
      )}

      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>
          {t("progressLogging.myProgress")}
        </Text>

        <View style={commonStyles.cardAnchor}>
          {flowMode === "collapsed" ? (
            <View style={localStyles.summaryCard}>
              <View style={localStyles.summaryBody}>
                <View style={localStyles.summaryIconCircle}>
                  <FiveDailyPrayerIDetailedIbadhasIcon
                    color={Colors.light.white}
                    size={18}
                  />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <View
                    style={[
                      localStyles.badge,
                      badgeStatus.type === "completed"
                        ? localStyles.badgeCompleted
                        : badgeStatus.type === "not-started"
                          ? localStyles.badgeNotStarted
                          : localStyles.badgeInProgress,
                      { alignSelf: "flex-start" },
                    ]}
                  >
                    <Text
                      style={[
                        localStyles.badgeText,
                        badgeStatus.type === "completed"
                          ? localStyles.badgeTextCompleted
                          : badgeStatus.type === "not-started"
                            ? localStyles.badgeTextNotStarted
                            : localStyles.badgeTextInProgress,
                      ]}
                    >
                      {badgeStatus.text}
                    </Text>
                  </View>
                  <Text
                    style={[
                      localStyles.summaryTitle,
                      { flex: undefined },
                      frameLoading && localStyles.loadingPlaceholderText,
                    ]}
                    numberOfLines={2}
                  >
                    {goalLabel}
                  </Text>
                </View>
              </View>

              <View style={localStyles.footerRow}>
                {showInsights ? (
                  <TouchableOpacity style={localStyles.insightsBtn}>
                    <Text style={localStyles.insightsText}>VIEW INSIGHTS</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={22}
                      color={Colors.light.white}
                    />
                  </TouchableOpacity>
                ) : (
                  <View style={localStyles.spacer} />
                )}

                <TouchableOpacity
                  style={[
                    localStyles.addButton,
                    (frameLoading || isFullyAchieved) &&
                      localStyles.addButtonDisabled,
                  ]}
                  onPress={handleOpenFlow}
                  activeOpacity={0.8}
                  disabled={frameLoading || isFullyAchieved}
                >
                  <AddLoggingFlowIcon />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={commonStyles.flowCardLayer}>
              <FlowCard
                headerIcon={stepHeader.icon}
                headerLabel={stepHeader.label}
                onBack={handleBack}
                onForward={handleForward}
                onConfirm={handleConfirm}
                canGoForward={!isLastStep}
                canConfirm={isLastStep && !isLogging && !isFullyAchieved}
                styles={commonStyles}
                style={commonStyles.inPlaceFlowCard}
              >
                {renderStepContent(currentStep)}
              </FlowCard>
            </View>
          )}
        </View>
      </View>

      {flowMode === "active" && (
        <Pressable style={commonStyles.backdrop} onPress={resetFlow} />
      )}
    </>
  );
}

const localStyles = StyleSheet.create({
  summaryCard: {
    backgroundColor: Colors.light.green,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    height: 145,
    justifyContent: "space-between",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeInProgress: {
    backgroundColor: Colors.light.lightpurple,
  },
  badgeCompleted: {
    backgroundColor: Colors.light.lightgreenbadgecolor,
  },
  badgeNotStarted: {
    backgroundColor: Colors.light.paginationInactiveDot,
  },
  badgeText: {
    fontFamily: fonts.primary.semiBold,
    fontSize: 10,
    fontWeight: "600",
  },
  badgeTextInProgress: {
    color: Colors.light.darkblue,
  },
  badgeTextCompleted: {
    color: Colors.light.green,
  },
  badgeTextNotStarted: {
    color: Colors.light.notStartedTextColor,
  },
  summaryBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.blackBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryTitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
    letterSpacing: 0,
    flex: 1,
  },
  loadingPlaceholderText: {
    opacity: 0.35,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 4,
  },
  insightsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingBottom: 4,
  },
  insightsText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.bold,
    fontSize: 16,
    fontWeight: "700",
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonDisabled: {
    opacity: 0.35,
  },
  spacer: {
    flex: 1,
  },
});
