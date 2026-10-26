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
import { Colors } from "@/constants/theme";
import { FastingFlowCardProphetDawoodCalender } from "@/assets/icons/FastingFlowCardProphetDawoodCalender";
import { FlowCardCallender } from "@/assets/icons/FlowCardCallender";
import { TimeSpentIcon } from "@/assets/icons/TimeSpentIcon";
import { AddLoggingFlowIcon } from "@/assets/icons";
import { GoalData } from "../../home/components/goalsData";
import { FlowCard } from "../components/FlowCard";
import { StartTimeStep } from "../components/TimePickerSteps";
import { WhiteDaysFastDateStep } from "../components/WhiteDaysFastDateStep";
import {
  styles as commonStyles,
  FLOW_CARD_HEIGHT,
} from "../components/DailyProgressLogging.styles";
import { fonts } from "@/assets/fonts";
import { isValidStartTime } from "../quranRecitationTarget";
import {
  formatProphetDawoodFastDateLabel,
  isProphetDawoodFastEndTimeAfterStartTime,
} from "../prophetDawoodFastsData";
import {
  getTodayDateString,
  normalizeDateString,
} from "../whiteDaysFastsData";
import type { ProphetDawoodFastsLogEntry } from "../types";
import { usePrefillFastingTimesFromApi } from "../hooks/usePrefillFastingTimesFromApi";
import { useOptionalFastingGoalFrameContext } from "../fastingGoalFrameContext";
import { useLogFastingGoal } from "@/src/api/mutations/useLogFastingGoal";
import { useGetFastingLoggableDates } from "@/src/api/queries/useGetFastingLoggableDates";
import {
  fastingFrameShowsInsights,
  getFastingFrameAchievementLabel,
  getFastingFrameAchievementPct,
} from "@/src/utils/fastingGoalFrameMap";

type ProphetDawoodFastsStepId = "selectPlannedFast" | "startTime" | "endTime";
const STEPS: ProphetDawoodFastsStepId[] = [
  "selectPlannedFast",
  "startTime",
  "endTime",
];

type Props = {
  goalData: GoalData;
  onLogComplete?: (entry: ProphetDawoodFastsLogEntry) => void;
  onDropdownOpenChange?: (open: boolean) => void;
};

type FlowMode = "collapsed" | "active";

function formatTimeForApi(
  hour: string,
  minute: string,
  period: "am" | "pm",
): string {
  const hourNum = parseInt(hour || "0", 10) || 0;
  const minuteNum = parseInt(minute || "0", 10) || 0;
  let hour24 = hourNum % 12;
  if (period === "pm") hour24 += 12;
  return `${String(Math.max(0, hour24)).padStart(2, "0")}:${String(
    Math.max(0, minuteNum),
  ).padStart(2, "0")}`;
}

export default function ProphetDawoodFastsLoggingFlow({
  goalData,
  onLogComplete,
  onDropdownOpenChange,
}: Props) {
  const { t, i18n } = useTranslation();
  const fastingFrame = useOptionalFastingGoalFrameContext();
  const frame = fastingFrame?.frame;
  const { mutateAsync: logFast, isPending: isLogging } = useLogFastingGoal();
  const { data: loggableDatesData, refetch: refetchLoggableDates } =
    useGetFastingLoggableDates("PROPHET_DAWOOD");

  const [flowMode, setFlowMode] = useState<FlowMode>("collapsed");
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [startHour, setStartHour] = useState("5");
  const [startMinute, setStartMinute] = useState("00");
  const [startPeriod, setStartPeriod] = useState<"am" | "pm">("am");
  const [isStartPeriodDropdownOpen, setIsStartPeriodDropdownOpen] =
    useState(false);
  const [endHour, setEndHour] = useState("5");
  const [endMinute, setEndMinute] = useState("30");
  const [endPeriod, setEndPeriod] = useState<"am" | "pm">("pm");
  const [isEndPeriodDropdownOpen, setIsEndPeriodDropdownOpen] = useState(false);

  usePrefillFastingTimesFromApi(
    "PROPHET_DAWOOD",
    selectedDate || null,
    {
      setStartHour,
      setStartMinute,
      setStartPeriod,
      setEndHour,
      setEndMinute,
      setEndPeriod,
    },
    { enabled: flowMode === "active" && Boolean(selectedDate) },
  );

  const today = getTodayDateString();
  const currentStep = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  const navigationOptions = useMemo(() => {
    return (loggableDatesData?.dates ?? []).map((entry) => ({
      date: normalizeDateString(entry.date),
      enabled: entry.enabled,
      description: entry.description,
    }));
  }, [loggableDatesData?.dates]);

  const badgeStatus = useMemo(() => {
    if (!frame) {
      return {
        text: t("progressLogging.notStarted"),
        type: "not-started" as const,
      };
    }
    return getFastingFrameAchievementLabel(frame, t);
  }, [frame, t]);

  const summaryCount = Math.max(1, Number(frame?.goal?.target ?? 14) || 14);
  const summaryTitle = t("progressLogging.dawoodCardSubtitle", {
    count: summaryCount,
  });

  const showInsights = frame ? fastingFrameShowsInsights(frame) : false;
  const canLog =
    Boolean(frame?.items?.[0]?.canLog) && navigationOptions.length > 0;
  const goalCompleted =
    getFastingFrameAchievementPct(frame) >= 100 ||
    String(frame?.goal?.status ?? "").toUpperCase() === "COMPLETED";

  useEffect(() => {
    onDropdownOpenChange?.(
      isStartPeriodDropdownOpen || isEndPeriodDropdownOpen,
    );
  }, [
    isEndPeriodDropdownOpen,
    isStartPeriodDropdownOpen,
    onDropdownOpenChange,
  ]);

  useEffect(
    () => () => {
      onDropdownOpenChange?.(false);
    },
    [onDropdownOpenChange],
  );

  useEffect(() => {
    if (flowMode !== "active") return;
    const selectionValid =
      Boolean(selectedDate) &&
      navigationOptions.some((option) => option.date === selectedDate);
    // Only default when empty/invalid — do not reset on every arrow press.
    if (selectionValid) return;
    const preferred =
      [...navigationOptions].reverse().find((option) => option.enabled) ??
      navigationOptions[navigationOptions.length - 1];
    setSelectedDate(preferred?.date ?? "");
  }, [flowMode, navigationOptions, selectedDate]);

  const selectedOptionIndex = useMemo(
    () => navigationOptions.findIndex((option) => option.date === selectedDate),
    [navigationOptions, selectedDate],
  );

  const selectedNavigationOption =
    selectedOptionIndex >= 0
      ? navigationOptions[selectedOptionIndex]
      : null;
  const isSelectedDateEnabled = selectedNavigationOption?.enabled !== false;

  const dateLabel = useMemo(() => {
    if (!selectedDate) return "";
    const raw = formatProphetDawoodFastDateLabel(selectedDate, today);
    if (raw === "Today") return t("progressLogging.today");
    if (raw === "Yesterday") return t("progressLogging.yesterday");
    return raw;
  }, [selectedDate, t, today]);

  const shiftDate = useCallback(
    (direction: -1 | 1) => {
      if (navigationOptions.length === 0) return;
      const currentIndex =
        selectedOptionIndex >= 0
          ? selectedOptionIndex
          : navigationOptions.length - 1;
      const nextIndex = currentIndex + direction;
      if (nextIndex < 0 || nextIndex >= navigationOptions.length) return;
      setSelectedDate(navigationOptions[nextIndex].date);
    },
    [navigationOptions, selectedOptionIndex],
  );

  const canGoPrev = selectedOptionIndex > 0;
  const canGoNext =
    selectedOptionIndex >= 0 &&
    selectedOptionIndex < navigationOptions.length - 1;

  const isStartTimeValid = isValidStartTime(
    startHour,
    startMinute,
    startPeriod,
  );
  const isEndTimeValid = isValidStartTime(endHour, endMinute, endPeriod);
  const isEndAfterStart = isProphetDawoodFastEndTimeAfterStartTime(
    startHour,
    startMinute,
    startPeriod,
    endHour,
    endMinute,
    endPeriod,
  );

  const applyFastTimeDefaults = useCallback(() => {
    setStartHour("5");
    setStartMinute("00");
    setStartPeriod("am");
    setEndHour("5");
    setEndMinute("30");
    setEndPeriod("pm");
  }, []);

  const ensureEndAfterStart = useCallback(() => {
    if (
      isProphetDawoodFastEndTimeAfterStartTime(
        startHour,
        startMinute,
        startPeriod,
        endHour,
        endMinute,
        endPeriod,
      )
    ) {
      return;
    }
    if (
      isProphetDawoodFastEndTimeAfterStartTime(
        startHour,
        startMinute,
        startPeriod,
        "5",
        "30",
        "pm",
      )
    ) {
      setEndHour("5");
      setEndMinute("30");
      setEndPeriod("pm");
      return;
    }
    if (
      startPeriod === "am" &&
      isProphetDawoodFastEndTimeAfterStartTime(
        startHour,
        startMinute,
        startPeriod,
        startHour,
        startMinute,
        "pm",
      )
    ) {
      setEndHour(startHour);
      setEndMinute(startMinute);
      setEndPeriod("pm");
      return;
    }
    setEndHour("11");
    setEndMinute("59");
    setEndPeriod("pm");
  }, [
    endHour,
    endMinute,
    endPeriod,
    startHour,
    startMinute,
    startPeriod,
  ]);

  const resetFlow = useCallback(() => {
    setFlowMode("collapsed");
    setStepIndex(0);
    setSelectedDate("");
    applyFastTimeDefaults();
    setIsStartPeriodDropdownOpen(false);
    setIsEndPeriodDropdownOpen(false);
    onDropdownOpenChange?.(false);
  }, [applyFastTimeDefaults, onDropdownOpenChange]);

  const handleConfirm = useCallback(() => {
    if (!selectedDate || isLogging) return;

    const startTime = formatTimeForApi(startHour, startMinute, startPeriod);
    const endTime = formatTimeForApi(endHour, endMinute, endPeriod);

    const run = async () => {
      try {
        const result = await logFast({
          fastingType: "PROPHET_DAWOOD",
          date: selectedDate,
          startTime,
          endTime,
        });
        await Promise.all([
          fastingFrame?.refetch(),
          refetchLoggableDates(),
        ]);

        const completedCount = result.goal?.completed ?? 0;
        const target = result.goal?.target ?? frame?.goal?.target ?? 14;
        const remainingCount =
          result.goal?.remaining ?? Math.max(0, target - completedCount);

        onLogComplete?.({
          type: "prophet-dawood-fasts",
          goalType: "prophet_dawood",
          goalId: goalData.id as "fasting-Dawwod",
          plannedDate: result.date ?? selectedDate,
          date: result.date ?? selectedDate,
          startTime: result.startTime ?? startTime,
          endTime: result.endTime ?? endTime,
          cycleDay: 0,
          completed: true,
          goalTarget: target,
          completedCount,
          remainingCount,
          goalCompleted: (result.goal?.achievementPct ?? 0) >= 100,
        });

        resetFlow();
      } catch {
        // Toast handled in mutation onError.
      }
    };

    void run();
  }, [
    endHour,
    endMinute,
    endPeriod,
    fastingFrame,
    frame?.goal?.target,
    goalData.id,
    isLogging,
    logFast,
    onLogComplete,
    refetchLoggableDates,
    resetFlow,
    selectedDate,
    startHour,
    startMinute,
    startPeriod,
  ]);

  const handleBack = useCallback(() => {
    if (stepIndex === 0) {
      resetFlow();
      return;
    }
    setStepIndex((index) => index - 1);
  }, [resetFlow, stepIndex]);

  const handleForward = useCallback(() => {
    if (isLastStep) return;
    if (currentStep === "startTime") {
      ensureEndAfterStart();
    }
    setStepIndex((index) => index + 1);
  }, [currentStep, ensureEndAfterStart, isLastStep]);

  const handleOpenFlow = useCallback(() => {
    if (!canLog || goalCompleted) return;
    applyFastTimeDefaults();
    setStepIndex(0);
    setFlowMode("active");
  }, [applyFastTimeDefaults, canLog, goalCompleted]);

  const getStepHeader = (step: ProphetDawoodFastsStepId) => {
    const calendarIcon = (
      <FlowCardCallender size={18} color={Colors.light.white} />
    );
    const timeIcon = <TimeSpentIcon size={18} color={Colors.light.white} />;

    switch (step) {
      case "selectPlannedFast":
        return {
          icon: calendarIcon,
          label: t("progressLogging.dawoodSelectPlannedFast"),
        };
      case "startTime":
        return {
          icon: timeIcon,
          label: t("progressLogging.dawoodEnterStartTime"),
        };
      case "endTime":
        return {
          icon: timeIcon,
          label: t("progressLogging.dawoodEnterEndTime"),
        };
    }
  };

  const toggleTimeStep = useCallback(() => {
    if (currentStep === "startTime") {
      ensureEndAfterStart();
      setStepIndex(STEPS.indexOf("endTime"));
    } else if (currentStep === "endTime") {
      setStepIndex(STEPS.indexOf("startTime"));
    }
  }, [currentStep, ensureEndAfterStart]);

  const renderTimeStep = (
    sectionLabel: string,
    picker: React.ReactNode,
    nav: { canGoPrev: boolean; canGoNext: boolean },
  ) => (
    <View style={localStyles.timeStepWrap}>
      <Text style={localStyles.timeSectionLabel}>{sectionLabel}</Text>
      <View style={commonStyles.dateRow}>
        <TouchableOpacity
          onPress={toggleTimeStep}
          disabled={!nav.canGoPrev}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={i18n.language === "ar" ? "chevron-forward" : "chevron-back"}
            size={32}
            color={Colors.light.white}
            style={!nav.canGoPrev ? localStyles.chevronDisabled : undefined}
          />
        </TouchableOpacity>

        <View style={localStyles.timePickerCenter}>{picker}</View>

        <TouchableOpacity
          onPress={toggleTimeStep}
          disabled={!nav.canGoNext}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={i18n.language === "ar" ? "chevron-back" : "chevron-forward"}
            size={32}
            color={Colors.light.white}
            style={!nav.canGoNext ? localStyles.chevronDisabled : undefined}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStepContent = (step: ProphetDawoodFastsStepId) => {
    switch (step) {
      case "selectPlannedFast":
        return (
          <WhiteDaysFastDateStep
            dateLabel={dateLabel}
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
            onShiftDate={shiftDate}
            styles={commonStyles}
            enabled={selectedNavigationOption?.enabled !== false}
            description={selectedNavigationOption?.description ?? null}
          />
        );
      case "startTime":
        return renderTimeStep(
          t("progressLogging.dawoodStartTimeLabel", "Start Time"),
          <StartTimeStep
            startHour={startHour}
            setStartHour={setStartHour}
            startMinute={startMinute}
            setStartMinute={setStartMinute}
            startPeriod={startPeriod}
            setStartPeriod={setStartPeriod}
            isPeriodDropdownOpen={isStartPeriodDropdownOpen}
            setIsPeriodDropdownOpen={setIsStartPeriodDropdownOpen}
            styles={commonStyles}
          />,
          { canGoPrev: false, canGoNext: true },
        );
      case "endTime":
        return renderTimeStep(
          t("progressLogging.dawoodEndTimeLabel", "End Time"),
          <StartTimeStep
            startHour={endHour}
            setStartHour={setEndHour}
            startMinute={endMinute}
            setStartMinute={setEndMinute}
            startPeriod={endPeriod}
            setStartPeriod={setEndPeriod}
            isPeriodDropdownOpen={isEndPeriodDropdownOpen}
            setIsPeriodDropdownOpen={setIsEndPeriodDropdownOpen}
            styles={commonStyles}
          />,
          { canGoPrev: true, canGoNext: false },
        );
    }
  };

  const canProceed = (() => {
    switch (currentStep) {
      case "selectPlannedFast":
        return Boolean(selectedDate) && isSelectedDateEnabled;
      case "startTime":
        return isStartTimeValid;
      case "endTime":
        return isEndTimeValid && isEndAfterStart;
      default:
        return false;
    }
  })();

  const canConfirm =
    isLastStep &&
    !isLogging &&
    Boolean(selectedDate) &&
    isSelectedDateEnabled &&
    navigationOptions.some((option) => option.date === selectedDate) &&
    isStartTimeValid &&
    isEndTimeValid &&
    isEndAfterStart;

  const stepHeader = getStepHeader(currentStep);
  const isDropdownOpen = isStartPeriodDropdownOpen || isEndPeriodDropdownOpen;

  return (
    <>
      {flowMode === "active" && <Pressable style={commonStyles.backdrop} />}
      {flowMode === "active" && (
        <TouchableOpacity
          style={commonStyles.cancelButton}
          onPress={resetFlow}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={20} color={Colors.light.white} />
        </TouchableOpacity>
      )}

      <View
        style={[
          commonStyles.section,
          flowMode === "active" && commonStyles.activeSection,
        ]}
      >
        <Text style={commonStyles.sectionTitle}>
          {t("progressLogging.myProgress")}
        </Text>

        <View
          style={[
            commonStyles.cardAnchor,
            isDropdownOpen && commonStyles.flowCardLayerDropdownOpen,
          ]}
        >
          {flowMode === "collapsed" ? (
            <View style={localStyles.summaryCard}>
              <View style={localStyles.summaryBody}>
                <View style={localStyles.summaryIconCircle}>
                  <FastingFlowCardProphetDawoodCalender
                    size={21}
                    color={Colors.light.white}
                  />
                </View>
                <View style={localStyles.titleContainer}>
                  <View
                    style={[
                      localStyles.badge,
                      badgeStatus.type === "completed"
                        ? localStyles.badgeCompleted
                        : badgeStatus.type === "not-started"
                          ? localStyles.badgeNotStarted
                          : localStyles.badgeInProgress,
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
                  <Text style={localStyles.summaryTitle} numberOfLines={2}>
                    {summaryTitle}
                  </Text>
                </View>
              </View>

              <View style={localStyles.footerRow}>
                {showInsights ? (
                  <TouchableOpacity
                    style={localStyles.insightsBtn}
                    onPress={() => fastingFrame?.openInsights?.()}
                    activeOpacity={0.8}
                  >
                    <Text style={localStyles.insightsText}>
                      {t("progressLogging.viewInsights")}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={22}
                      color={Colors.light.white}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>

              {canLog && !goalCompleted ? (
                <TouchableOpacity
                  style={localStyles.addButton}
                  onPress={handleOpenFlow}
                  activeOpacity={0.8}
                >
                  <AddLoggingFlowIcon size={32} />
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <View
              style={[
                commonStyles.flowCardLayer,
                isDropdownOpen && commonStyles.flowCardLayerDropdownOpen,
              ]}
            >
              <FlowCard
                headerIcon={stepHeader.icon}
                headerLabel={stepHeader.label}
                onBack={handleBack}
                onForward={handleForward}
                onConfirm={handleConfirm}
                canGoForward={
                  !isLastStep && canProceed && currentStep !== "startTime"
                }
                canGoBack={stepIndex > 0}
                canConfirm={canConfirm}
                showConfirmButton
                headerSingleLine={
                  currentStep === "startTime" || currentStep === "endTime"
                }
                styles={commonStyles}
                style={[
                  commonStyles.inPlaceFlowCard,
                  isDropdownOpen && commonStyles.flowCardDropdownOpen,
                ]}
                contentStyle={
                  isDropdownOpen
                    ? commonStyles.flowContentDropdownOpen
                    : undefined
                }
              >
                {renderStepContent(currentStep)}
              </FlowCard>
            </View>
          )}
        </View>
      </View>
    </>
  );
}

const localStyles = StyleSheet.create({
  summaryCard: {
    backgroundColor: Colors.light.green,
    borderRadius: 8,
    padding: 16,
    gap: 12,
    height: FLOW_CARD_HEIGHT,
    width: "100%",
    justifyContent: "space-between",
    position: "relative",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 3,
    alignSelf: "flex-start",
  },
  badgeNotStarted: {
    backgroundColor: Colors.light.paginationInactiveDot,
  },
  badgeInProgress: {
    backgroundColor: Colors.light.lightpurple,
  },
  badgeCompleted: {
    backgroundColor: Colors.light.lightgreenbadgecolor,
  },
  badgeText: {
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 12.5,
  },
  badgeTextNotStarted: {
    color: Colors.light.notStartedTextColor,
  },
  badgeTextInProgress: {
    color: Colors.light.darkblue,
  },
  badgeTextCompleted: {
    color: Colors.light.green,
  },
  summaryBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  summaryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.selectcategory,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 33,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 9,
  },
  summaryTitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
    letterSpacing: 0,
  },
  footerRow: {
    flexDirection: "row",
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
    position: "absolute",
    right: 16,
    bottom: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  timeStepWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
  },
  timeSectionLabel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "100%",
    marginBottom: 2,
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: 10,
    lineHeight: 10,
    textAlign: "center",
    opacity: 0.95,
  },
  timePickerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
    transform: [{ translateX: 4 }],
  },
  chevronDisabled: {
    opacity: 0.35,
    transform: [{ scaleX: 0.82 }],
  },
});
