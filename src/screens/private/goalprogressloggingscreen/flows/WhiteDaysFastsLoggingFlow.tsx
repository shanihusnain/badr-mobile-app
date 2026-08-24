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
import { GoalData } from "../../home/components/goalsData";
import { FlowCard } from "../components/FlowCard";
import { StartTimeStep } from "../components/TimePickerSteps";
import { WhiteDaysFastDateStep } from "../components/WhiteDaysFastDateStep";

import { styles as commonStyles } from "../components/DailyProgressLogging.styles";
import { fonts } from "@/assets/fonts";
import { isValidStartTime } from "../quranRecitationTarget";
import {
  formatWhiteDaysFastDateLabel,
  formatWhiteDaysFastTimeLabel,
  getTodayDateString,
  getWhiteDaysFastCompletedCount,
  getWhiteDaysFastDateNavigationOptions,
  getWhiteDaysFastInsights,
  isWhiteDaysFastDateInNavigationOptions,
  isWhiteDaysFastEndTimeAfterStartTime,
  isWhiteDaysFastGoalCompleted,
  submitWhiteDaysFastLog,
} from "../whiteDaysFastsData";
import type { WhiteDaysFastsLogEntry } from "../types";
import { WhiteDaysFastsInsightsModal } from "../components/WhiteDaysFastsInsightsModal";
import { FlowCardCallender } from "@/assets/icons";
import { TimeSpentIcon } from "@/assets/icons";

type WhiteDaysFastsStepId = "selectPlannedFast" | "startTime" | "endTime";
const STEPS: WhiteDaysFastsStepId[] = [
  "selectPlannedFast",
  "startTime",
  "endTime",
];

type Props = {
  goalData: GoalData;
  onLogComplete?: (entry: WhiteDaysFastsLogEntry) => void;
  onDropdownOpenChange?: (open: boolean) => void;
};

type FlowMode = "collapsed" | "active";

export default function WhiteDaysFastsLoggingFlow({
  goalData,
  onLogComplete,
  onDropdownOpenChange,
}: Props) {
  const { t } = useTranslation();
  const [flowMode, setFlowMode] = useState<FlowMode>("collapsed");
  const [stepIndex, setStepIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [insightsVisible, setInsightsVisible] = useState(false);
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
    () => getWhiteDaysFastDateNavigationOptions(),
    [refreshKey, flowMode],
  );

  const completedCount = getWhiteDaysFastCompletedCount();
  const goalCompleted = isWhiteDaysFastGoalCompleted();
  const insights = useMemo(
    () => getWhiteDaysFastInsights(),
    [refreshKey, goalCompleted, completedCount],
  );

  const summaryTitle = t("progressLogging.whiteDaysCardSubtitle");

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
      navigationOptions[navigationOptions.length - 1]?.date ?? "";
    setSelectedDate(defaultDate);
  }, [flowMode, navigationOptions]);

  const selectedOptionIndex = useMemo(
    () => navigationOptions.findIndex((option) => option.date === selectedDate),
    [navigationOptions, selectedDate],
  );

  const dateLabel = useMemo(() => {
    if (!selectedDate) return "";
    const raw = formatWhiteDaysFastDateLabel(selectedDate, today);
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
  const isEndAfterStart = isWhiteDaysFastEndTimeAfterStartTime(
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

    const startTime = formatWhiteDaysFastTimeLabel(
      startHour,
      startMinute,
      startPeriod,
    );
    const endTime = formatWhiteDaysFastTimeLabel(endHour, endMinute, endPeriod);

    const result = submitWhiteDaysFastLog({
      date: selectedDate,
      startTime,
      endTime,
    });

    if (!result) return;

    onLogComplete?.({
      type: "white-days-fasts",
      goalId: goalData.id as "fasting-whiteDays",
      date: result.date,
      completed: result.completed,
      startTime: result.startTime,
      endTime: result.endTime,
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

  const getStepHeader = (step: WhiteDaysFastsStepId) => {
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
          label: t("progressLogging.whiteDaysSelectPlannedFast"),
        };
      case "startTime":
        return {
          icon: timeIcon,
          label: t("progressLogging.whiteDaysEnterStartTime"),
        };
      case "endTime":
        return {
          icon: timeIcon,
          label: t("progressLogging.whiteDaysEnterEndTime"),
        };
    }
  };

  const renderStepContent = (step: WhiteDaysFastsStepId) => {
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
        return Boolean(selectedDate);
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
    isWhiteDaysFastDateInNavigationOptions(selectedDate) &&
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
              <View style={localStyles.whiteDaysIconCircle} />
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
              {goalCompleted ? (
                <TouchableOpacity
                  style={localStyles.insightsBtn}
                  onPress={() => setInsightsVisible(true)}
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
              ) : (
                <View style={localStyles.spacer} />
              )}

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

      <WhiteDaysFastsInsightsModal
        visible={insightsVisible}
        insights={insights}
        onClose={() => setInsightsVisible(false)}
      />
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
  whiteDaysIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.white,
    borderWidth: 3,
    borderColor: Colors.light.selectcategory,
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
  insightsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingBottom: 4,
    transform: [{ translateY: -4 }],
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
