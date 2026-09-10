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
import { GoalData } from "../../home/components/goalsData";
import { FlowCard } from "../components/FlowCard";
import { StartTimeStep } from "../components/TimePickerSteps";
import { WhiteDaysFastDateStep } from "../components/WhiteDaysFastDateStep";
import { styles as commonStyles } from "../components/DailyProgressLogging.styles";
import { fonts } from "@/assets/fonts";
import { isValidStartTime } from "../quranRecitationTarget";
import {
  canLogProphetDawoodFastOnDate,
  formatProphetDawoodFastDateLabel,
  formatProphetDawoodFastTimeLabel,
  getCurrentLoggableProphetDawoodFast,
  getProphetDawoodFastCompletedCount,
  getProphetDawoodFastDateNavigationOptions,
  isProphetDawoodFastEndTimeAfterStartTime,
  isProphetDawoodFastGoalCompleted,
  submitProphetDawoodFastLog,
} from "../prophetDawoodFastsData";
import { getTodayDateString } from "../whiteDaysFastsData";
import type { ProphetDawoodFastsLogEntry } from "../types";

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

export default function ProphetDawoodFastsLoggingFlow({
  goalData,
  onLogComplete,
  onDropdownOpenChange,
}: Props) {
  const { t } = useTranslation();
  const [flowMode, setFlowMode] = useState<FlowMode>("collapsed");
  const [stepIndex, setStepIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
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

  const today = getTodayDateString();
  const currentStep = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  const navigationOptions = useMemo(
    () => getProphetDawoodFastDateNavigationOptions(),
    [refreshKey, flowMode],
  );

  const completedCount = getProphetDawoodFastCompletedCount();
  const goalCompleted = isProphetDawoodFastGoalCompleted();
  const summaryTitle = t("progressLogging.dawoodCardSubtitle");

  const badgeStatus = useMemo(() => {
    if (completedCount === 0) {
      return {
        text: t("progressLogging.notStarted"),
        type: "not-started" as const,
      };
    }
    if (goalCompleted) {
      return {
        text: t("progressLogging.fullyAchieved"),
        type: "completed" as const,
      };
    }
    return {
      text: t("progressLogging.inProgress"),
      type: "in-progress" as const,
    };
  }, [completedCount, goalCompleted, t, refreshKey]);

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

    const defaultDate =
      getCurrentLoggableProphetDawoodFast() ??
      navigationOptions.find((option) =>
        canLogProphetDawoodFastOnDate(option.date),
      )?.date ??
      navigationOptions[0]?.date ??
      "";

    setSelectedDate(defaultDate);
  }, [flowMode, navigationOptions]);

  const selectedOptionIndex = useMemo(
    () => navigationOptions.findIndex((option) => option.date === selectedDate),
    [navigationOptions, selectedDate],
  );

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
          : navigationOptions.findIndex(
            (option) => option.date === getCurrentLoggableProphetDawoodFast(),
          );
      const resolvedIndex =
        currentIndex >= 0 ? currentIndex : navigationOptions.length - 1;
      const nextIndex = resolvedIndex + direction;
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

  const resetFlow = useCallback(() => {
    setFlowMode("collapsed");
    setStepIndex(0);
    setSelectedDate("");
    setStartHour("5");
    setStartMinute("00");
    setStartPeriod("am");
    setEndHour("5");
    setEndMinute("30");
    setEndPeriod("pm");
    setIsStartPeriodDropdownOpen(false);
    setIsEndPeriodDropdownOpen(false);
    onDropdownOpenChange?.(false);
  }, [onDropdownOpenChange]);

  const handleConfirm = useCallback(() => {
    if (!selectedDate) return;

    const startTime = formatProphetDawoodFastTimeLabel(
      startHour,
      startMinute,
      startPeriod,
    );
    const endTime = formatProphetDawoodFastTimeLabel(
      endHour,
      endMinute,
      endPeriod,
    );

    const result = submitProphetDawoodFastLog({
      plannedDate: selectedDate,
      startTime,
      endTime,
    });

    if (!result) return;

    onLogComplete?.({
      type: "prophet-dawood-fasts",
      goalType: "prophet_dawood",
      goalId: goalData.id as "fasting-Dawwod",
      plannedDate: result.plannedDate,
      date: result.plannedDate,
      startTime: result.startTime,
      endTime: result.endTime,
      cycleDay: result.cycleDay,
      completed: result.completed,
      goalTarget: result.goalTarget,
      completedCount: result.completedCount,
      remainingCount: result.remainingCount,
      goalCompleted: result.goalCompleted,
    });

    setRefreshKey((current) => current + 1);
    resetFlow();
  }, [
    endHour,
    endMinute,
    endPeriod,
    goalData.id,
    onLogComplete,
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
    if (!isLastStep) {
      setStepIndex((index) => index + 1);
    }
  }, [isLastStep]);

  const handleOpenFlow = useCallback(() => {
    if (goalCompleted) return;
    setStepIndex(0);
    setFlowMode("active");
  }, [goalCompleted]);

  const getStepHeader = (step: ProphetDawoodFastsStepId) => {
    const calendarIcon = (
      <FlowCardCallender size={18} color={Colors.light.white} />
    );
    const timeIcon = (
      <TimeSpentIcon size={19} color={Colors.light.white} />
    );

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
            isPeriodDropdownOpen={isStartPeriodDropdownOpen}
            setIsPeriodDropdownOpen={setIsStartPeriodDropdownOpen}
            styles={commonStyles}
          />
        );
      case "endTime":
        return (
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
          />
        );
    }
  };

  const canProceed = (() => {
    switch (currentStep) {
      case "selectPlannedFast":
        return (
          Boolean(selectedDate) && canLogProphetDawoodFastOnDate(selectedDate)
        );
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
    Boolean(selectedDate) &&
    canLogProphetDawoodFastOnDate(selectedDate) &&
    isStartTimeValid &&
    isEndTimeValid &&
    isEndAfterStart;

  const stepHeader = getStepHeader(currentStep);
  const isDropdownOpen = isStartPeriodDropdownOpen || isEndPeriodDropdownOpen;

  return (
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
        {flowMode === "active" && (
          <Pressable style={commonStyles.backdrop} onPress={resetFlow} />
        )}
        {flowMode === "active" && (
          <TouchableOpacity
            style={commonStyles.cancelButton}
            onPress={resetFlow}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={20} color={Colors.light.white} />
          </TouchableOpacity>
        )}

        {flowMode === "collapsed" ? (
          <View style={localStyles.summaryCard}>
            <View style={localStyles.summaryBody}>
              <View style={localStyles.dawoodIconCircle}>
                <FastingFlowCardProphetDawoodCalender
                  size={20}
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
                    { alignSelf: "flex-start", marginBottom: 4 },
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
                <Text style={localStyles.summaryTitle}>{summaryTitle}</Text>
              </View>
            </View>

            <View style={localStyles.footerRow}>
              <View style={localStyles.spacer} />
              {!goalCompleted ? (
                <TouchableOpacity
                  style={localStyles.addButton}
                  onPress={handleOpenFlow}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={22} color={Colors.light.white} />
                </TouchableOpacity>
              ) : null}
            </View>
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
              canGoForward={!isLastStep && canProceed}
              canConfirm={canConfirm}
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
    marginTop: -6,
  },
  badgeNotStarted: {
    backgroundColor: Colors.light.dullWhiteOpacity,
  },
  badgeInProgress: {
    backgroundColor: Colors.light.lightpurple,
  },
  badgeCompleted: {
    backgroundColor: Colors.light.lightgreenbadgecolor,
  },
  badgeText: {
    fontFamily: fonts.primary.semiBold,
    fontSize: 10,
    fontWeight: "600",
  },
  badgeTextNotStarted: {
    color: Colors.light.white,
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
    gap: 12,
  },
  dawoodIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 38,
    backgroundColor: Colors.light.darkgrey,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 2,
  },
  summaryTitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 4,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.light.white,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateY: -4 }],
  },
  spacer: {
    flex: 1,
  },
});
