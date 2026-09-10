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
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Colors } from "@/constants/theme";
import { FastingFlowCardRamadanCalender } from "@/assets/icons/FastingFlowCardRamadanCalender";
import { FastingDashboardIcon } from "@/assets/icons/FastingDashboardIcon";
import { GoalData } from "../../home/components/goalsData";
import { FlowCard } from "../components/FlowCard";
import { FlowDropdownSelect } from "../components/FlowDropdownSelect";
import { StartTimeStep } from "../components/TimePickerSteps";
import { MissedRamadanFastsInsightsModal } from "../components/MissedRamadanFastsInsightsModal";
import { styles as commonStyles } from "../components/DailyProgressLogging.styles";
import { fonts } from "@/assets/fonts";
import { isValidStartTime } from "../quranRecitationTarget";
import {
  formatMissedRamadanFastDateLabel,
  formatMissedRamadanFastTimeLabel,
  getActualEarlyFastDateOptions,
  getFuturePlannedFastOptions,
  getMissedRamadanFastGoalTarget,
  getMissedRamadanFastInsights,
  getPendingPlannedFastOptions,
  getSkippedFastOptions,
  getTodayDateString,
  getAvailableMissedRamadanFastLogTypes,
  hasMissedRamadanFastLoggingAvailable,
  isActualDateBeforePlannedDate,
  isMissedRamadanFastEndTimeAfterStartTime,
  isMissedRamadanFastGoalCompleted,
  isMissedRamadanFastPlannedDate,
  submitMissedRamadanFastBranchLog,
  type MissedRamadanFastDateOption,
  type MissedRamadanFastLogType,
} from "../missedRamadanFastsData";
import type { MissedRamadanFastsLogEntry } from "../types";

type MissedRamadanFastsStepId =
  | "logType"
  | "selectPlannedFast"
  | "selectActualDate"
  | "selectSkippedDate"
  | "startTime"
  | "endTime";

function getStepsForLogType(
  logType: MissedRamadanFastLogType | null,
): MissedRamadanFastsStepId[] {
  switch (logType) {
    case "completed_early":
      return [
        "logType",
        "selectPlannedFast",
        "selectActualDate",
        "startTime",
        "endTime",
      ];
    case "made_up_skipped":
      return ["logType", "selectSkippedDate", "startTime", "endTime"];
    case "completed_planned":
      return ["logType", "selectPlannedFast", "startTime", "endTime"];
    default:
      return ["logType"];
  }
}

type Props = {
  goalData: GoalData;
  onLogComplete?: (entry: MissedRamadanFastsLogEntry) => void;
  onDropdownOpenChange?: (open: boolean) => void;
};

type FlowMode = "collapsed" | "active";

export default function MissedRamadanFastsLoggingFlow({
  goalData,
  onLogComplete,
  onDropdownOpenChange,
}: Props) {
  const { t } = useTranslation();
  const [flowMode, setFlowMode] = useState<FlowMode>("collapsed");
  const [stepIndex, setStepIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [insightsVisible, setInsightsVisible] = useState(false);
  const [logType, setLogType] = useState<MissedRamadanFastLogType | null>(null);
  const [selectedPlannedFastId, setSelectedPlannedFastId] = useState<
    string | null
  >(null);
  const [selectedActualDateId, setSelectedActualDateId] = useState<
    string | null
  >(null);
  const [selectedSkippedDateId, setSelectedSkippedDateId] = useState<
    string | null
  >(null);
  const [isLogTypeDropdownOpen, setIsLogTypeDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [startHour, setStartHour] = useState("5");
  const [startMinute, setStartMinute] = useState("00");
  const [startPeriod, setStartPeriod] = useState<"am" | "pm">("am");
  const [isStartPeriodDropdownOpen, setIsStartPeriodDropdownOpen] =
    useState(false);
  const [endHour, setEndHour] = useState("5");
  const [endMinute, setEndMinute] = useState("30");
  const [endPeriod, setEndPeriod] = useState<"am" | "pm">("pm");
  const [isEndPeriodDropdownOpen, setIsEndPeriodDropdownOpen] = useState(false);

  const steps = useMemo(() => getStepsForLogType(logType), [logType]);
  const currentStep = steps[stepIndex] ?? "logType";
  const isLastStep = stepIndex === steps.length - 1;

  const handleLogTypeDropdownOpenChange = useCallback((open: boolean) => {
    setIsLogTypeDropdownOpen(open);
    if (open) setIsDateDropdownOpen(false);
  }, []);

  const handleDateDropdownOpenChange = useCallback((open: boolean) => {
    setIsDateDropdownOpen(open);
    if (open) setIsLogTypeDropdownOpen(false);
  }, []);

  useEffect(() => {
    onDropdownOpenChange?.(
      isLogTypeDropdownOpen ||
      isDateDropdownOpen ||
      isStartPeriodDropdownOpen ||
      isEndPeriodDropdownOpen,
    );
  }, [
    isDateDropdownOpen,
    isEndPeriodDropdownOpen,
    isLogTypeDropdownOpen,
    isStartPeriodDropdownOpen,
    onDropdownOpenChange,
  ]);

  useEffect(
    () => () => {
      onDropdownOpenChange?.(false);
    },
    [onDropdownOpenChange],
  );

  const today = getTodayDateString();

  const futurePlannedOptions = useMemo(
    () => getFuturePlannedFastOptions(),
    [refreshKey, flowMode],
  );

  const pendingPlannedOptions = useMemo(
    () => getPendingPlannedFastOptions(),
    [refreshKey, flowMode],
  );

  const skippedOptions = useMemo(
    () => getSkippedFastOptions(),
    [refreshKey, flowMode],
  );

  const selectedPlannedFast = useMemo(() => {
    const options =
      logType === "completed_early"
        ? futurePlannedOptions
        : pendingPlannedOptions;
    return (
      options.find((option) => option.id === selectedPlannedFastId) ?? null
    );
  }, [
    futurePlannedOptions,
    logType,
    pendingPlannedOptions,
    selectedPlannedFastId,
  ]);

  const actualDateOptions = useMemo(
    () =>
      selectedPlannedFast
        ? getActualEarlyFastDateOptions(selectedPlannedFast.date)
        : [],
    [selectedPlannedFast, refreshKey, flowMode],
  );

  const selectedActualDate = useMemo(
    () =>
      actualDateOptions.find((option) => option.id === selectedActualDateId) ??
      null,
    [actualDateOptions, selectedActualDateId],
  );

  const selectedSkippedDate = useMemo(
    () =>
      skippedOptions.find((option) => option.id === selectedSkippedDateId) ??
      null,
    [selectedSkippedDateId, skippedOptions],
  );

  const goalTarget = getMissedRamadanFastGoalTarget();
  const goalCompleted = isMissedRamadanFastGoalCompleted();
  const insights = useMemo(
    () => getMissedRamadanFastInsights(),
    [refreshKey, goalCompleted],
  );

  const summaryTitle = t("progressLogging.missedRamadanCardSubtitle", {
    count: goalTarget,
  });

  const badgeStatus = useMemo(() => {
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
  }, [goalCompleted, t, refreshKey]);

  const logTypeDropdownOptions = useMemo(
    () =>
      getAvailableMissedRamadanFastLogTypes().map((value) => ({
        value,
        label: t(`progressLogging.missedRamadanLogType_${value}`),
      })),
    [t, refreshKey, flowMode],
  );

  const toDropdownOptions = useCallback(
    (options: MissedRamadanFastDateOption[]) =>
      options.map((option) => ({
        value: option.id,
        label:
          option.date === today
            ? t("progressLogging.today")
            : formatMissedRamadanFastDateLabel(option.date, today),
      })),
    [t, today],
  );

  const isStartTimeValid = isValidStartTime(
    startHour,
    startMinute,
    startPeriod,
  );
  const isEndTimeValid = isValidStartTime(endHour, endMinute, endPeriod);
  const isEndAfterStart = isMissedRamadanFastEndTimeAfterStartTime(
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
    setLogType(null);
    setSelectedPlannedFastId(null);
    setSelectedActualDateId(null);
    setSelectedSkippedDateId(null);
    setStartHour("5");
    setStartMinute("00");
    setStartPeriod("am");
    setEndHour("5");
    setEndMinute("30");
    setEndPeriod("pm");
    setIsLogTypeDropdownOpen(false);
    setIsDateDropdownOpen(false);
    setIsStartPeriodDropdownOpen(false);
    setIsEndPeriodDropdownOpen(false);
    onDropdownOpenChange?.(false);
  }, [onDropdownOpenChange]);

  const handleLogTypeChange = useCallback((value: MissedRamadanFastLogType) => {
    setLogType(value);
    setSelectedPlannedFastId(null);
    setSelectedActualDateId(null);
    setSelectedSkippedDateId(null);
    setIsDateDropdownOpen(false);
    setStepIndex(0);
  }, []);

  useEffect(() => {
    if (logType && !getAvailableMissedRamadanFastLogTypes().includes(logType)) {
      setLogType(null);
      setStepIndex(0);
    }
  }, [logType, refreshKey, flowMode]);

  useEffect(() => {
    if (flowMode !== "active" || !logType) return;

    if (currentStep === "selectPlannedFast" && !selectedPlannedFastId) {
      const options =
        logType === "completed_early"
          ? futurePlannedOptions
          : pendingPlannedOptions;
      if (options[0]) {
        setSelectedPlannedFastId(options[0].id);
      }
      return;
    }

    if (currentStep === "selectSkippedDate" && !selectedSkippedDateId) {
      if (skippedOptions[0]) {
        setSelectedSkippedDateId(skippedOptions[0].id);
      }
      return;
    }

    if (
      currentStep === "selectActualDate" &&
      !selectedActualDateId &&
      selectedPlannedFast
    ) {
      const options = getActualEarlyFastDateOptions(selectedPlannedFast.date);
      if (options[0]) {
        setSelectedActualDateId(options[0].id);
      }
    }
  }, [
    currentStep,
    flowMode,
    futurePlannedOptions,
    logType,
    pendingPlannedOptions,
    selectedActualDateId,
    selectedPlannedFast,
    selectedPlannedFastId,
    selectedSkippedDateId,
    skippedOptions,
  ]);

  const resolvePlannedFastSelection = useCallback(() => {
    if (!selectedPlannedFastId) return null;
    const options =
      logType === "completed_early"
        ? futurePlannedOptions
        : pendingPlannedOptions;
    return (
      options.find((option) => option.id === selectedPlannedFastId) ?? null
    );
  }, [
    futurePlannedOptions,
    logType,
    pendingPlannedOptions,
    selectedPlannedFastId,
  ]);

  const resolveSkippedDateSelection = useCallback(() => {
    if (!selectedSkippedDateId) return null;
    return (
      skippedOptions.find((option) => option.id === selectedSkippedDateId) ??
      null
    );
  }, [selectedSkippedDateId, skippedOptions]);

  const resolveActualDateSelection = useCallback(() => {
    if (!selectedActualDateId) return null;
    return (
      actualDateOptions.find((option) => option.id === selectedActualDateId) ??
      null
    );
  }, [actualDateOptions, selectedActualDateId]);

  const handleConfirm = () => {
    if (!logType || !isStartTimeValid || !isEndTimeValid || !isEndAfterStart) {
      return;
    }

    const plannedFast = resolvePlannedFastSelection();
    const skippedDate = resolveSkippedDateSelection();
    const actualDate = resolveActualDateSelection();

    const startTime = formatMissedRamadanFastTimeLabel(
      startHour,
      startMinute,
      startPeriod,
    );
    const endTime = formatMissedRamadanFastTimeLabel(
      endHour,
      endMinute,
      endPeriod,
    );

    let result = null;

    if (logType === "completed_early") {
      if (!plannedFast || !actualDate) return;
      if (!isActualDateBeforePlannedDate(actualDate.date, plannedFast.date)) {
        return;
      }

      result = submitMissedRamadanFastBranchLog({
        logType,
        plannedFastDate: plannedFast.date,
        actualCompletedDate: actualDate.date,
        startTime,
        endTime,
      });
    } else if (logType === "made_up_skipped") {
      if (!skippedDate) return;

      result = submitMissedRamadanFastBranchLog({
        logType,
        completedDate: skippedDate.date,
        startTime,
        endTime,
      });
    } else if (logType === "completed_planned") {
      if (!plannedFast) return;

      result = submitMissedRamadanFastBranchLog({
        logType,
        plannedFastDate: plannedFast.date,
        startTime,
        endTime,
      });
    }

    if (!result) return;

    setRefreshKey((current) => current + 1);

    const loggedDate = result.date;

    onLogComplete?.({
      type: "missed-ramadan-fasts",
      goalId: "fasting-ramadan",
      logType,
      date: loggedDate,
      completed: result.completed,
      startTime,
      endTime,
      plannedFastDate:
        logType === "completed_early"
          ? plannedFast?.date
          : logType === "completed_planned"
            ? plannedFast?.date
            : undefined,
      actualCompletedDate:
        logType === "completed_early" ? actualDate?.date : undefined,
      completedDate:
        logType === "made_up_skipped" ? skippedDate?.date : undefined,
      plannedDate: result.plannedDate,
      reconciledFromPlannedDate: result.reconciledFromPlannedDate,
      goalTarget,
      completedCount: result.completedCount,
      remainingCount: result.remainingCount,
      goalCompleted: result.goalCompleted,
      wasPlanned: isMissedRamadanFastPlannedDate(loggedDate),
    });

    resetFlow();
  };

  const handleBack = () => {
    if (stepIndex === 0) {
      resetFlow();
      return;
    }
    setIsDateDropdownOpen(false);
    setIsLogTypeDropdownOpen(false);
    setIsStartPeriodDropdownOpen(false);
    setIsEndPeriodDropdownOpen(false);
    setStepIndex((index) => index - 1);
  };

  const getDateOptionsForStep = (
    step: MissedRamadanFastsStepId,
  ): MissedRamadanFastDateOption[] => {
    switch (step) {
      case "selectPlannedFast":
        return logType === "completed_early"
          ? futurePlannedOptions
          : pendingPlannedOptions;
      case "selectActualDate":
        return actualDateOptions;
      case "selectSkippedDate":
        return skippedOptions;
      default:
        return [];
    }
  };

  const handleForward = () => {
    if (isLastStep) return;

    setIsDateDropdownOpen(false);
    setIsLogTypeDropdownOpen(false);
    setIsStartPeriodDropdownOpen(false);
    setIsEndPeriodDropdownOpen(false);

    const nextStep = steps[stepIndex + 1];
    if (!nextStep) return;

    if (currentStep === "logType" && logType) {
      const nextOptions = getDateOptionsForStep(nextStep);
      if (nextStep === "selectPlannedFast") {
        setSelectedPlannedFastId(nextOptions[0]?.id ?? null);
      } else if (nextStep === "selectSkippedDate") {
        setSelectedSkippedDateId(nextOptions[0]?.id ?? null);
      }
      setStepIndex((index) => index + 1);
      return;
    }

    if (currentStep === "selectPlannedFast" && selectedPlannedFast) {
      if (nextStep === "selectActualDate") {
        const nextActualOptions = getActualEarlyFastDateOptions(
          selectedPlannedFast.date,
        );
        setSelectedActualDateId(nextActualOptions[0]?.id ?? null);
      }
      setStepIndex((index) => index + 1);
      return;
    }

    if (currentStep === "selectActualDate" && selectedActualDate) {
      setStepIndex((index) => index + 1);
      return;
    }

    if (currentStep === "selectSkippedDate" && selectedSkippedDate) {
      setStepIndex((index) => index + 1);
      return;
    }

    if (currentStep === "startTime" && isStartTimeValid) {
      setStepIndex((index) => index + 1);
    }
  };

  const handleOpenFlow = useCallback(() => {
    if (goalCompleted || !hasMissedRamadanFastLoggingAvailable()) return;
    setLogType(null);
    setSelectedPlannedFastId(null);
    setSelectedActualDateId(null);
    setSelectedSkippedDateId(null);
    setStepIndex(0);
    setFlowMode("active");
  }, [goalCompleted]);

  const getStepHeader = (step: MissedRamadanFastsStepId) => {
    const calendarIcon = (
      <Ionicons name="calendar-outline" size={15} color={Colors.light.white} />
    );
    const timeIcon = (
      <Ionicons name="time-outline" size={15} color={Colors.light.white} />
    );
    const helpIcon = (
      <FastingDashboardIcon
        size={20}
        color={Colors.light.white}
      />
    );

    switch (step) {
      case "logType":
        return {
          icon: helpIcon,
          label: t("progressLogging.missedRamadanWhatAreYouLogging"),
        };
      case "selectPlannedFast":
        return {
          icon: calendarIcon,
          label:
            logType === "completed_early"
              ? t("progressLogging.missedRamadanSelectPlannedFastEarly")
              : t("progressLogging.missedRamadanSelectPlannedFastCompleted"),
        };
      case "selectActualDate":
        return {
          icon: calendarIcon,
          label: t("progressLogging.missedRamadanWhichDayDidYouFast"),
        };
      case "selectSkippedDate":
        return {
          icon: calendarIcon,
          label: t("progressLogging.missedRamadanMakeupSkippedDateLabel"),
        };
      case "startTime":
        return {
          icon: timeIcon,
          label: t("progressLogging.missedRamadanEnterStartTime"),
        };
      case "endTime":
        return {
          icon: timeIcon,
          label: t("progressLogging.missedRamadanEnterEndTime"),
        };
    }
  };

  const renderDateDropdown = (
    options: MissedRamadanFastDateOption[],
    selectedId: string | null,
    onSelect: (id: string) => void,
  ) => {
    if (options.length === 0) {
      return (
        <View style={commonStyles.flowContent}>
          <Text style={commonStyles.flowHeaderText}>
            {t("progressLogging.missedRamadanNoFastOptions")}
          </Text>
        </View>
      );
    }

    return (
      <FlowDropdownSelect
        options={toDropdownOptions(options)}
        selectedValue={selectedId}
        onSelectValue={onSelect}
        placeholder={t("progressLogging.missedRamadanSelectDate")}
        isOpen={isDateDropdownOpen}
        setIsOpen={setIsDateDropdownOpen}
        onOpenChange={handleDateDropdownOpenChange}
        styles={commonStyles}
      />
    );
  };

  const renderStepContent = (step: MissedRamadanFastsStepId) => {
    switch (step) {
      case "logType":
        return (
          <FlowDropdownSelect
            options={logTypeDropdownOptions}
            selectedValue={logType}
            onSelectValue={handleLogTypeChange}
            placeholder={t("progressLogging.missedRamadanSelectLogType")}
            isOpen={isLogTypeDropdownOpen}
            setIsOpen={setIsLogTypeDropdownOpen}
            onOpenChange={handleLogTypeDropdownOpenChange}
            styles={commonStyles}
          />
        );
      case "selectPlannedFast":
        return renderDateDropdown(
          logType === "completed_early"
            ? futurePlannedOptions
            : pendingPlannedOptions,
          selectedPlannedFastId,
          setSelectedPlannedFastId,
        );
      case "selectActualDate":
        return renderDateDropdown(
          actualDateOptions,
          selectedActualDateId,
          setSelectedActualDateId,
        );
      case "selectSkippedDate":
        return renderDateDropdown(
          skippedOptions,
          selectedSkippedDateId,
          setSelectedSkippedDateId,
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
      case "logType":
        return Boolean(logType);
      case "selectPlannedFast":
        return Boolean(selectedPlannedFast);
      case "selectActualDate":
        return (
          Boolean(selectedActualDate) &&
          Boolean(selectedPlannedFast) &&
          isActualDateBeforePlannedDate(
            selectedActualDate!.date,
            selectedPlannedFast!.date,
          )
        );
      case "selectSkippedDate":
        return Boolean(selectedSkippedDate);
      case "startTime":
        return isStartTimeValid;
      case "endTime":
        return isEndTimeValid && isEndAfterStart;
      default:
        return false;
    }
  })();

  const isBranchDataValid = (() => {
    if (!logType) return false;

    switch (logType) {
      case "completed_early": {
        const plannedFast = resolvePlannedFastSelection();
        const actualDate = resolveActualDateSelection();
        return (
          Boolean(plannedFast) &&
          Boolean(actualDate) &&
          isActualDateBeforePlannedDate(actualDate!.date, plannedFast!.date)
        );
      }
      case "made_up_skipped":
        return Boolean(resolveSkippedDateSelection());
      case "completed_planned":
        return Boolean(resolvePlannedFastSelection());
      default:
        return false;
    }
  })();

  const canConfirm =
    isLastStep &&
    isStartTimeValid &&
    isEndTimeValid &&
    isEndAfterStart &&
    isBranchDataValid;

  const stepHeader = getStepHeader(currentStep);
  const isDropdownOpen = isLogTypeDropdownOpen || isDateDropdownOpen;

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
              <View style={localStyles.summaryIconCircle}>
                <FastingFlowCardRamadanCalender
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
                      : localStyles.badgeInProgress,
                    { alignSelf: "flex-start", marginBottom: 4 },
                  ]}
                >
                  <Text
                    style={[
                      localStyles.badgeText,
                      badgeStatus.type === "completed"
                        ? localStyles.badgeTextCompleted
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
                  disabled={!hasMissedRamadanFastLoggingAvailable()}
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
                isDropdownOpen ? commonStyles.flowContentDropdownOpen : undefined
              }
            >
              {renderStepContent(currentStep)}
            </FlowCard>
          </View>
        )}
      </View>

      <MissedRamadanFastsInsightsModal
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
  summaryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.blackBackground,
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
