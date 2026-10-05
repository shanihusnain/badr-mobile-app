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
import {
  AddLoggingFlowIcon,
  FlowCardCallender,
  TimeSpentIcon,
} from "@/assets/icons";
import { GoalData } from "../../home/components/goalsData";
import { FlowCard } from "../components/FlowCard";
import { FlowDropdownSelect } from "../components/FlowDropdownSelect";
import {
  StartTimeStep,
  getCurrentStartTimeParts,
} from "../components/TimePickerSteps";
import { WhiteDaysFastDateStep } from "../components/WhiteDaysFastDateStep";
import { MondayThursdayFastsInsightsModal } from "../components/MondayThursdayFastsInsightsModal";
import {
  FLOW_CARD_HEIGHT,
  styles as commonStyles,
} from "../components/DailyProgressLogging.styles";
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
  const [startHour, setStartHour] = useState(
    () => getCurrentStartTimeParts().hour,
  );
  const [startMinute, setStartMinute] = useState(
    () => getCurrentStartTimeParts().minute,
  );
  const [startPeriod, setStartPeriod] = useState<"am" | "pm">(
    () => getCurrentStartTimeParts().period,
  );
  const [isStartPeriodDropdownOpen, setIsStartPeriodDropdownOpen] =
    useState(false);
  const [endHour, setEndHour] = useState(
    () => getCurrentStartTimeParts().hour,
  );
  const [endMinute, setEndMinute] = useState(
    () => getCurrentStartTimeParts().minute,
  );
  const [endPeriod, setEndPeriod] = useState<"am" | "pm">(
    () => getCurrentStartTimeParts().period,
  );
  const [isEndPeriodDropdownOpen, setIsEndPeriodDropdownOpen] = useState(false);

  const steps = useMemo(() => getStepsForLogType(logType), [logType]);
  const currentStep = steps[stepIndex] ?? "logType";
  const isLastStep = stepIndex === steps.length - 1;

  const handleLogTypeDropdownOpenChange = useCallback((open: boolean) => {
    setIsLogTypeDropdownOpen(open);
  }, []);

  useEffect(() => {
    onDropdownOpenChange?.(
      isLogTypeDropdownOpen ||
      isStartPeriodDropdownOpen ||
      isEndPeriodDropdownOpen,
    );
  }, [
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

  const toDateLabel = useCallback(
    (option: MondayThursdayFastDateOption | null | undefined) => {
      if (!option) return "";
      if (option.date === today) return t("progressLogging.today");
      const raw = formatMondayThursdayFastDateLabel(option.date, today);
      if (raw === "Yesterday") return t("progressLogging.yesterday");
      return raw;
    },
    [t, today],
  );

  const shiftOptionId = useCallback(
    (
      options: MondayThursdayFastDateOption[],
      selectedId: string | null,
      direction: -1 | 1,
      onSelect: (id: string) => void,
    ) => {
      if (options.length === 0) return;
      const currentIndex = Math.max(
        0,
        options.findIndex((option) => option.id === selectedId),
      );
      const nextIndex = currentIndex + direction;
      if (nextIndex < 0 || nextIndex >= options.length) return;
      onSelect(options[nextIndex].id);
    },
    [],
  );

  const renderDateStep = (
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

    const selectedIndex = options.findIndex(
      (option) => option.id === selectedId,
    );
    const selectedOption =
      (selectedIndex >= 0 ? options[selectedIndex] : options[0]) ?? null;

    return (
      <WhiteDaysFastDateStep
        dateLabel={toDateLabel(selectedOption)}
        canGoPrev={selectedIndex > 0}
        canGoNext={selectedIndex >= 0 && selectedIndex < options.length - 1}
        onShiftDate={(direction) =>
          shiftOptionId(options, selectedId, direction, onSelect)
        }
        styles={commonStyles}
      />
    );
  };

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

  const applyCurrentTimeDefaults = useCallback(() => {
    const now = getCurrentStartTimeParts();
    setStartHour(now.hour);
    setStartMinute(now.minute);
    setStartPeriod(now.period);
    setEndHour(now.hour);
    setEndMinute(now.minute);
    setEndPeriod(now.period);
  }, []);

  const resetFlow = useCallback(() => {
    setFlowMode("collapsed");
    setStepIndex(0);
    setLogType(null);
    setSelectedPlannedFastId(null);
    setSelectedActualDateId(null);
    setSelectedMissedDateId(null);
    applyCurrentTimeDefaults();
    setIsLogTypeDropdownOpen(false);
    setIsStartPeriodDropdownOpen(false);
    setIsEndPeriodDropdownOpen(false);
    onDropdownOpenChange?.(false);
  }, [applyCurrentTimeDefaults, onDropdownOpenChange]);

  const handleLogTypeChange = useCallback(
    (value: MondayThursdayFastLogType) => {
      setLogType(value);
      setSelectedPlannedFastId(null);
      setSelectedActualDateId(null);
      setSelectedMissedDateId(null);
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
    applyCurrentTimeDefaults();
    setLogType(null);
    setSelectedPlannedFastId(null);
    setSelectedActualDateId(null);
    setSelectedMissedDateId(null);
    setStepIndex(0);
    setFlowMode("active");
  }, [applyCurrentTimeDefaults, goalCompleted]);

  const getStepHeader = (step: MondayThursdayFastsStepId) => {
    const calendarIcon = (
      <FlowCardCallender size={18} color={Colors.light.white} />
    );
    const timeIcon = <TimeSpentIcon size={19} color={Colors.light.white} />;
    const helpIcon = (
      <FastingDashboardIcon size={22} color={Colors.light.white} />
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
        return renderDateStep(
          plannedFastOptions,
          selectedPlannedFastId,
          setSelectedPlannedFastId,
        );
      case "selectActualDate":
        return renderDateStep(
          actualDateOptions,
          selectedActualDateId,
          setSelectedActualDateId,
        );
      case "selectMissedDate":
        return renderDateStep(
          missedOptions,
          selectedMissedDateId,
          setSelectedMissedDateId,
        );
      case "startTime":
        return (
          <View style={localStyles.timeStepWrap}>
            <Text style={localStyles.timeSectionLabel}>
              {t("progressLogging.mondayThursdayStartTimeLabel")}
            </Text>
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
          </View>
        );
      case "endTime":
        return (
          <View style={localStyles.timeStepWrap}>
            <Text style={localStyles.timeSectionLabel}>
              {t("progressLogging.mondayThursdayEndTimeLabel")}
            </Text>
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
          </View>
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
  const isDropdownOpen =
    isLogTypeDropdownOpen ||
    isStartPeriodDropdownOpen ||
    isEndPeriodDropdownOpen;

  return (
    <>
      {flowMode === "active" && (
        <Pressable style={commonStyles.backdrop} />
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
                  <Text style={localStyles.summaryTitle} numberOfLines={2}>
                    {summaryTitle}
                  </Text>
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
                ) : null}
              </View>

              {!goalCompleted ? (
                <TouchableOpacity
                  style={[
                    localStyles.addButton,
                    !hasMondayThursdayFastLoggingAvailable() &&
                      localStyles.addButtonDisabled,
                  ]}
                  onPress={handleOpenFlow}
                  activeOpacity={0.8}
                  disabled={!hasMondayThursdayFastLoggingAvailable()}
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
                canGoForward={!isLastStep && canProceed}
                canGoBack={stepIndex > 0}
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
  addButtonDisabled: {
    opacity: 0.35,
  },
  timeStepWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 6,
  },
  timeSectionLabel: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    fontSize: 10,
    lineHeight: 13,
    textAlign: "center",
    opacity: 0.95,
  },
});
