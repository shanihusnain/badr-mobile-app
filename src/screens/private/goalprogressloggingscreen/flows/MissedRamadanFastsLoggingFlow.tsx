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
import { FastingFlowCardRamadanCalender } from "@/assets/icons/FastingFlowCardRamadanCalender";
import { FastingDashboardIcon } from "@/assets/icons/FastingDashboardIcon";
import { GoalData } from "../../home/components/goalsData";
import { FlowCard } from "../components/FlowCard";
import { FlowDropdownSelect } from "../components/FlowDropdownSelect";
import { StartTimeStep } from "../components/TimePickerSteps";
import { styles as commonStyles } from "../components/DailyProgressLogging.styles";
import { fonts } from "@/assets/fonts";
import { isValidStartTime } from "../quranRecitationTarget";
import {
  formatMissedRamadanFastDateLabel,
  getTodayDateString,
  isActualDateBeforePlannedDate,
  isMissedRamadanFastEndTimeAfterStartTime,
  type MissedRamadanFastDateOption,
  type MissedRamadanFastLogType,
} from "../missedRamadanFastsData";
import type { MissedRamadanFastsLogEntry } from "../types";
import { useOptionalFastingGoalFrameContext } from "../fastingGoalFrameContext";
import { useGetFastingLoggableDates } from "@/src/api/queries/useGetFastingLoggableDates";
import { useLogFastingGoal } from "@/src/api/mutations/useLogFastingGoal";
import {
  fastingFrameShowsInsights,
  getFastingFrameAchievementLabel,
  getFastingFrameAchievementPct,
} from "@/src/utils/fastingGoalFrameMap";

function toDateOptions(dates: string[]): MissedRamadanFastDateOption[] {
  return [...dates]
    .map((date) => String(date).slice(0, 10))
    .filter(Boolean)
    .sort()
    .map((date) => ({ id: date, date }));
}

function formatTimeForApi(
  hour: string,
  minute: string,
  period: "am" | "pm",
): string {
  const hourNum = Number.parseInt(hour || "0", 10) || 0;
  const minuteNum = Number.parseInt(minute || "0", 10) || 0;
  let hour24 = hourNum % 12;
  if (period === "pm") hour24 += 12;
  return `${String(Math.max(0, hour24)).padStart(2, "0")}:${String(
    Math.max(0, minuteNum),
  ).padStart(2, "0")}`;
}

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
  const fastingFrame = useOptionalFastingGoalFrameContext();
  const frame = fastingFrame?.frame;
  const frameItem = frame?.items?.[0];
  const { mutateAsync: logFast, isPending: isLogging } = useLogFastingGoal();

  /** Planned-side lists come from the frame; keep-on days still need loggable-dates. */
  const frameLoggableDates = frameItem?.loggableDates;
  const frameEarlyLoggableDates = frameItem?.earlyLoggableDates;
  const frameMakeUpLoggableDates = frameItem?.makeUpLoggableDates;

  const earlyKeepDays = useGetFastingLoggableDates("MISSED_RAMADAN", {
    mode: "EARLIER_THAN_PLANNED",
    enabled: (frameEarlyLoggableDates?.length ?? 0) > 0,
  });
  const makeUpKeepDays = useGetFastingLoggableDates("MISSED_RAMADAN", {
    mode: "MAKE_UP",
    enabled: (frameMakeUpLoggableDates?.length ?? 0) > 0,
  });

  const [flowMode, setFlowMode] = useState<FlowMode>("collapsed");
  const [stepIndex, setStepIndex] = useState(0);
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
    () => toDateOptions(frameEarlyLoggableDates ?? []),
    [frameEarlyLoggableDates],
  );

  const pendingPlannedOptions = useMemo(
    () => toDateOptions(frameLoggableDates ?? []),
    [frameLoggableDates],
  );

  const skippedOptions = useMemo(
    () => toDateOptions(makeUpKeepDays.data?.dates ?? []),
    [makeUpKeepDays.data?.dates],
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

  const actualDateOptions = useMemo(() => {
    if (!selectedPlannedFast) return [];
    return toDateOptions(earlyKeepDays.data?.dates ?? []).filter((option) =>
      isActualDateBeforePlannedDate(option.date, selectedPlannedFast.date),
    );
  }, [earlyKeepDays.data?.dates, selectedPlannedFast]);

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

  const goalTarget = frame?.goal?.target ?? goalData.target ?? 0;
  const goalCompleted =
    getFastingFrameAchievementPct(frame) >= 100 ||
    String(frame?.goal?.status ?? "").toUpperCase() === "COMPLETED";
  const showInsights = frame ? fastingFrameShowsInsights(frame) : false;

  const availableLogTypes = useMemo(() => {
    const types: MissedRamadanFastLogType[] = [];
    if (
      (frameEarlyLoggableDates?.length ?? 0) > 0 &&
      (earlyKeepDays.data?.dates?.length ?? 0) > 0
    ) {
      types.push("completed_early");
    }
    if (
      (frameMakeUpLoggableDates?.length ?? 0) > 0 &&
      skippedOptions.length > 0
    ) {
      types.push("made_up_skipped");
    }
    if (pendingPlannedOptions.length > 0) {
      types.push("completed_planned");
    }
    return types;
  }, [
    earlyKeepDays.data?.dates?.length,
    frameEarlyLoggableDates,
    frameMakeUpLoggableDates,
    pendingPlannedOptions.length,
    skippedOptions.length,
  ]);

  const canLog =
    Boolean(frameItem?.canLog) &&
    availableLogTypes.length > 0 &&
    !goalCompleted;

  const summaryTitle =
    frameItem?.title?.trim() ||
    t("progressLogging.missedRamadanCardSubtitle", {
      count: goalTarget,
    });

  const badgeStatus = useMemo(() => {
    if (!frame) {
      return {
        text: t("progressLogging.notStarted"),
        type: "not-started" as const,
      };
    }
    return getFastingFrameAchievementLabel(frame, t);
  }, [frame, t]);

  const logTypeDropdownOptions = useMemo(
    () =>
      availableLogTypes.map((value) => ({
        value,
        label: t(`progressLogging.missedRamadanLogType_${value}`),
      })),
    [availableLogTypes, t],
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
    if (logType && !availableLogTypes.includes(logType)) {
      setLogType(null);
      setStepIndex(0);
    }
  }, [availableLogTypes, logType]);

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
      actualDateOptions[0]
    ) {
      setSelectedActualDateId(actualDateOptions[0].id);
    }
  }, [
    actualDateOptions,
    currentStep,
    flowMode,
    futurePlannedOptions,
    logType,
    pendingPlannedOptions,
    selectedActualDateId,
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

  const handleConfirm = useCallback(() => {
    if (
      !logType ||
      !isStartTimeValid ||
      !isEndTimeValid ||
      !isEndAfterStart ||
      isLogging
    ) {
      return;
    }

    const plannedFast = resolvePlannedFastSelection();
    const skippedDate = resolveSkippedDateSelection();
    const actualDate = resolveActualDateSelection();

    const startTime = formatTimeForApi(startHour, startMinute, startPeriod);
    const endTime = formatTimeForApi(endHour, endMinute, endPeriod);

    const run = async () => {
      try {
        let result;

        if (logType === "completed_early") {
          if (!plannedFast || !actualDate) return;
          if (
            !isActualDateBeforePlannedDate(actualDate.date, plannedFast.date)
          ) {
            return;
          }
          result = await logFast({
            fastingType: "MISSED_RAMADAN",
            date: actualDate.date,
            startTime,
            endTime,
            mode: "EARLIER_THAN_PLANNED",
            plannedDate: plannedFast.date,
          });
        } else if (logType === "made_up_skipped") {
          if (!skippedDate) return;
          result = await logFast({
            fastingType: "MISSED_RAMADAN",
            date: skippedDate.date,
            startTime,
            endTime,
            mode: "MAKE_UP",
          });
        } else if (logType === "completed_planned") {
          if (!plannedFast) return;
          result = await logFast({
            fastingType: "MISSED_RAMADAN",
            date: plannedFast.date,
            startTime,
            endTime,
          });
        } else {
          return;
        }

        await Promise.all([
          fastingFrame?.refetch(),
          earlyKeepDays.refetch(),
          makeUpKeepDays.refetch(),
        ]);

        const loggedDate = result.date ?? (
          logType === "completed_early"
            ? actualDate?.date
            : logType === "made_up_skipped"
              ? skippedDate?.date
              : plannedFast?.date
        ) ?? "";
        const completedCount = Number(result.goal?.completed ?? 0);
        const target = Number(result.goal?.target ?? goalTarget ?? 0);
        const remainingCount =
          result.goal?.remaining != null
            ? Number(result.goal.remaining)
            : Math.max(0, target - completedCount);

        onLogComplete?.({
          type: "missed-ramadan-fasts",
          goalId: "fasting-ramadan",
          logType,
          date: loggedDate,
          completed: true,
          startTime: result.startTime ?? startTime,
          endTime: result.endTime ?? endTime,
          plannedFastDate:
            logType === "completed_early" || logType === "completed_planned"
              ? plannedFast?.date
              : undefined,
          actualCompletedDate:
            logType === "completed_early" ? actualDate?.date : undefined,
          completedDate:
            logType === "made_up_skipped" ? skippedDate?.date : undefined,
          plannedDate: result.plannedDate,
          reconciledFromPlannedDate: result.plannedDate,
          goalTarget: target,
          completedCount,
          remainingCount,
          goalCompleted: Number(result.goal?.achievementPct ?? 0) >= 100,
          wasPlanned: logType === "completed_planned",
        });

        resetFlow();
      } catch {
        // Toast handled in mutation onError.
      }
    };

    void run();
  }, [
    actualDateOptions,
    earlyKeepDays,
    endHour,
    endMinute,
    endPeriod,
    fastingFrame,
    goalTarget,
    isEndAfterStart,
    isEndTimeValid,
    isLogging,
    isStartTimeValid,
    logFast,
    logType,
    makeUpKeepDays,
    onLogComplete,
    resolveActualDateSelection,
    resolvePlannedFastSelection,
    resolveSkippedDateSelection,
    resetFlow,
    startHour,
    startMinute,
    startPeriod,
  ]);

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
        setSelectedActualDateId(actualDateOptions[0]?.id ?? null);
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
    if (!canLog) return;
    setLogType(null);
    setSelectedPlannedFastId(null);
    setSelectedActualDateId(null);
    setSelectedSkippedDateId(null);
    setStepIndex(0);
    setFlowMode("active");
  }, [canLog]);

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
    !isLogging &&
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
              ) : (
                <View style={localStyles.spacer} />
              )}

              {canLog ? (
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
                canGoBack={stepIndex > 0}
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
    backgroundColor: Colors.light.paginationInactiveDot,
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
