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
import { FastingFlowCardMondayFasts } from "@/assets/icons/FastingFlowCardMondayFasts";
import { FastingDashboardIcon } from "@/assets/icons/FastingDashboardIcon";
import { GoalData } from "../../home/components/goalsData";
import { FlowCard } from "../components/FlowCard";
import { FlowDropdownSelect } from "../components/FlowDropdownSelect";
import { StartTimeStep } from "../components/TimePickerSteps";
import { MondayThursdayFastsInsightsModal } from "../components/MondayThursdayFastsInsightsModal";
import { styles as commonStyles } from "../components/DailyProgressLogging.styles";
import { fonts } from "@/assets/fonts";
import { isValidStartTime } from "../quranRecitationTarget";
import {
  formatMondayThursdayFastDateLabel,
  formatMondayThursdayFastTimeLabel,
  getActualEarlyMondayThursdayFastDateOptions,
  getMondayThursdayFastGoalTarget,
  getMondayThursdayFastInsights,
  getMissedMondayThursdayFastOptions,
  getTodayDateString,
  getMondayThursdayFastDateOptionsForLogType,
  hasMondayThursdayFastLoggingAvailable,
  isActualDateBeforePlannedDate,
  isMondayThursdayFastEndTimeAfterStartTime,
  isMondayThursdayFastGoalCompleted,
  isMondayThursdaySelectedGoalFast,
  submitMondayThursdayFastBranchLog,
  type MondayThursdayFastDateOption,
  type MondayThursdayFastLogType,
} from "../mondayThursdayFastsData";
import type { MondayThursdayFastsLogEntry } from "../types";

type MondayThursdayFastsStepId =
  | "logType"
  | "selectPlannedFast"
  | "selectActualDate"
  | "selectMissedDate"
  | "startTime"
  | "endTime";

function getStepsForLogType(
  logType: MondayThursdayFastLogType | null,
): MondayThursdayFastsStepId[] {
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
      return ["logType", "selectMissedDate", "startTime", "endTime"];
    case "completed_planned":
      return ["logType", "selectPlannedFast", "startTime", "endTime"];
    default:
      return ["logType"];
  }
}

type Props = {
  goalData: GoalData;
  onLogComplete?: (entry: MondayThursdayFastsLogEntry) => void;
  onDropdownOpenChange?: (open: boolean) => void;
};

type FlowMode = "collapsed" | "active";

const MONDAY_THURSDAY_LOG_TYPE_OPTIONS: MondayThursdayFastLogType[] = [
  "completed_early",
  "made_up_skipped",
  "completed_planned",
];

export default function MondayThursdayFastsLoggingFlow({
  goalData,
  onLogComplete,
  onDropdownOpenChange,
}: Props) {
  const { t } = useTranslation();
  const [flowMode, setFlowMode] = useState<FlowMode>("collapsed");
  const [stepIndex, setStepIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [insightsVisible, setInsightsVisible] = useState(false);
  const [logType, setLogType] = useState<MondayThursdayFastLogType | null>(
    null,
  );
  const [selectedPlannedFastId, setSelectedPlannedFastId] = useState<
    string | null
  >(null);
  const [selectedActualDateId, setSelectedActualDateId] = useState<
    string | null
  >(null);
  const [selectedMissedDateId, setSelectedMissedDateId] = useState<
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
    () => getMondayThursdayFastDateOptionsForLogType("completed_early"),
    [refreshKey, flowMode],
  );

  const pendingPlannedOptions = useMemo(
    () => getMondayThursdayFastDateOptionsForLogType("completed_planned"),
    [refreshKey, flowMode],
  );

  const plannedFastOptions = useMemo(() => {
    if (!logType || logType === "made_up_skipped") return [];
    return logType === "completed_early"
      ? futurePlannedOptions
      : pendingPlannedOptions;
  }, [futurePlannedOptions, logType, pendingPlannedOptions]);

  const missedOptions = useMemo(
    () => getMissedMondayThursdayFastOptions(),
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
        ? getActualEarlyMondayThursdayFastDateOptions(selectedPlannedFast.date)
        : [],
    [selectedPlannedFast, refreshKey, flowMode],
  );

  const selectedActualDate = useMemo(
    () =>
      actualDateOptions.find((option) => option.id === selectedActualDateId) ??
      null,
    [actualDateOptions, selectedActualDateId],
  );

  const selectedMissedDate = useMemo(
    () =>
      missedOptions.find((option) => option.id === selectedMissedDateId) ??
      null,
    [selectedMissedDateId, missedOptions],
  );

  const goalTarget = getMondayThursdayFastGoalTarget();
  const goalCompleted = isMondayThursdayFastGoalCompleted();
  const insights = useMemo(
    () => getMondayThursdayFastInsights(),
    [refreshKey, goalCompleted],
  );

  const summaryTitle = t("progressLogging.mondayThursdayCardSubtitle", {
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
      MONDAY_THURSDAY_LOG_TYPE_OPTIONS.map((value) => ({
        value,
        label: t(`progressLogging.mondayThursdayLogType_${value}`),
      })),
    [t],
  );

  const toDropdownOptions = useCallback(
    (options: MondayThursdayFastDateOption[]) =>
      options.map((option) => ({
        value: option.id,
        label:
          option.date === today
            ? t("progressLogging.today")
            : formatMondayThursdayFastDateLabel(option.date, today),
      })),
    [t, today],
  );

  const isStartTimeValid = isValidStartTime(
    startHour,
    startMinute,
    startPeriod,
  );
  const isEndTimeValid = isValidStartTime(endHour, endMinute, endPeriod);
  const isEndAfterStart = isMondayThursdayFastEndTimeAfterStartTime(
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
    setSelectedMissedDateId(null);
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

  const handleLogTypeChange = useCallback(
    (value: MondayThursdayFastLogType) => {
      setLogType(value);
      setSelectedPlannedFastId(null);
      setSelectedActualDateId(null);
      setSelectedMissedDateId(null);
      setIsDateDropdownOpen(false);
      setStepIndex(0);
    },
    [],
  );

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

    if (currentStep === "selectMissedDate" && !selectedMissedDateId) {
      if (missedOptions[0]) {
        setSelectedMissedDateId(missedOptions[0].id);
      }
      return;
    }

    if (
      currentStep === "selectActualDate" &&
      !selectedActualDateId &&
      selectedPlannedFast
    ) {
      const options = getActualEarlyMondayThursdayFastDateOptions(
        selectedPlannedFast.date,
      );
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
    plannedFastOptions,
    selectedActualDateId,
    selectedPlannedFast,
    selectedPlannedFastId,
    selectedMissedDateId,
    missedOptions,
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

  const resolveMissedDateSelection = useCallback(() => {
    if (!selectedMissedDateId) return null;
    return (
      missedOptions.find((option) => option.id === selectedMissedDateId) ?? null
    );
  }, [selectedMissedDateId, missedOptions]);

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
    const missedDate = resolveMissedDateSelection();
    const actualDate = resolveActualDateSelection();

    const startTime = formatMondayThursdayFastTimeLabel(
      startHour,
      startMinute,
      startPeriod,
    );
    const endTime = formatMondayThursdayFastTimeLabel(
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

      result = submitMondayThursdayFastBranchLog({
        logType,
        plannedFastDate: plannedFast.date,
        actualCompletedDate: actualDate.date,
        startTime,
        endTime,
      });
    } else if (logType === "made_up_skipped") {
      if (!missedDate) return;

      result = submitMondayThursdayFastBranchLog({
        logType,
        missedFastDate: missedDate.date,
        startTime,
        endTime,
      });
    } else if (logType === "completed_planned") {
      if (!plannedFast) return;

      result = submitMondayThursdayFastBranchLog({
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
      type: "monday-thursday-fasts",
      goalId: "fasting-mondayThursday",
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
      missedFastDate:
        logType === "made_up_skipped" ? missedDate?.date : undefined,
      plannedDate: result.plannedDate,
      reconciledFromPlannedDate: result.reconciledFromPlannedDate,
      goalTarget,
      completedCount: result.completedCount,
      remainingCount: result.remainingCount,
      goalCompleted: result.goalCompleted,
      wasSelected: isMondayThursdaySelectedGoalFast(loggedDate),
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
    step: MondayThursdayFastsStepId,
  ): MondayThursdayFastDateOption[] => {
    switch (step) {
      case "selectPlannedFast":
        return logType === "completed_early"
          ? futurePlannedOptions
          : pendingPlannedOptions;
      case "selectActualDate":
        return actualDateOptions;
      case "selectMissedDate":
        return missedOptions;
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
      } else if (nextStep === "selectMissedDate") {
        setSelectedMissedDateId(nextOptions[0]?.id ?? null);
      }
      setStepIndex((index) => index + 1);
      return;
    }

    if (currentStep === "selectPlannedFast") {
      if (!selectedPlannedFast) return;
      if (nextStep === "selectActualDate") {
        const nextActualOptions = getActualEarlyMondayThursdayFastDateOptions(
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

    if (currentStep === "selectMissedDate" && selectedMissedDate) {
      setStepIndex((index) => index + 1);
      return;
    }

    if (currentStep === "startTime" && isStartTimeValid) {
      setStepIndex((index) => index + 1);
    }
  };

  const handleOpenFlow = useCallback(() => {
    if (goalCompleted || !hasMondayThursdayFastLoggingAvailable()) return;
    setLogType(null);
    setSelectedPlannedFastId(null);
    setSelectedActualDateId(null);
    setSelectedMissedDateId(null);
    setStepIndex(0);
    setFlowMode("active");
  }, [goalCompleted]);

  const getStepHeader = (step: MondayThursdayFastsStepId) => {
    const calendarIcon = (
      <Ionicons name="calendar-outline" size={15} color={Colors.light.white} />
    );
    const timeIcon = (
      <Ionicons name="time-outline" size={15} color={Colors.light.white} />
    );
    const helpIcon = (
      <FastingDashboardIcon
        size={22}
        color={Colors.light.white}
      />
    );

    switch (step) {
      case "logType":
        return {
          icon: helpIcon,
          label: t("progressLogging.mondayThursdayWhatAreYouLogging"),
        };
      case "selectPlannedFast":
        return {
          icon: calendarIcon,
          label:
            logType === "completed_early"
              ? t("progressLogging.mondayThursdaySelectPlannedFastEarly")
              : t("progressLogging.mondayThursdaySelectPlannedFastCompleted"),
        };
      case "selectActualDate":
        return {
          icon: calendarIcon,
          label: t("progressLogging.mondayThursdayWhichDayDidYouFast"),
        };
      case "selectMissedDate":
        return {
          icon: calendarIcon,
          label: t("progressLogging.mondayThursdayMakeupSkippedDateLabel"),
        };
      case "startTime":
        return {
          icon: timeIcon,
          label: t("progressLogging.mondayThursdayEnterStartTime"),
        };
      case "endTime":
        return {
          icon: timeIcon,
          label: t("progressLogging.mondayThursdayEnterEndTime"),
        };
    }
  };

  const renderDateDropdown = (
    options: MondayThursdayFastDateOption[],
    selectedId: string | null,
    onSelect: (id: string) => void,
  ) => {
    if (options.length === 0) {
      return (
        <View style={commonStyles.flowContent}>
          <Text style={commonStyles.flowHeaderText}>
            {t("progressLogging.mondayThursdayNoFastOptions")}
          </Text>
        </View>
      );
    }

    return (
      <FlowDropdownSelect
        options={toDropdownOptions(options)}
        selectedValue={selectedId}
        onSelectValue={onSelect}
        placeholder={t("progressLogging.mondayThursdaySelectDate")}
        isOpen={isDateDropdownOpen}
        setIsOpen={setIsDateDropdownOpen}
        onOpenChange={handleDateDropdownOpenChange}
        styles={commonStyles}
      />
    );
  };

  const renderStepContent = (step: MondayThursdayFastsStepId) => {
    switch (step) {
      case "logType":
        return (
          <FlowDropdownSelect
            options={logTypeDropdownOptions}
            selectedValue={logType}
            onSelectValue={handleLogTypeChange}
            placeholder={t("progressLogging.mondayThursdaySelectLogType")}
            isOpen={isLogTypeDropdownOpen}
            setIsOpen={setIsLogTypeDropdownOpen}
            onOpenChange={handleLogTypeDropdownOpenChange}
            styles={commonStyles}
          />
        );
      case "selectPlannedFast":
        return renderDateDropdown(
          plannedFastOptions,
          selectedPlannedFastId,
          setSelectedPlannedFastId,
        );
      case "selectActualDate":
        return renderDateDropdown(
          actualDateOptions,
          selectedActualDateId,
          setSelectedActualDateId,
        );
      case "selectMissedDate":
        return renderDateDropdown(
          missedOptions,
          selectedMissedDateId,
          setSelectedMissedDateId,
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
      case "selectMissedDate":
        return Boolean(selectedMissedDate);
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
        return Boolean(resolveMissedDateSelection());
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
                <FastingFlowCardMondayFasts
                  size={18}
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
                  disabled={!hasMondayThursdayFastLoggingAvailable()}
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

      <MondayThursdayFastsInsightsModal
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
