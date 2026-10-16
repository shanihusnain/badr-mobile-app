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
import { MissedRamadanGreenCardIcon } from "@/assets/icons/MissedRamadanGreenCardIcon";
import { MissedRamadanFastsGreenCardIcon } from "@/assets/icons/MissedRamadanFastsGreenCardIcon";
import {
  AddLoggingFlowIcon,
  FlowCardCallender,
  TimeSpentIcon,
} from "@/assets/icons";
import { GoalData } from "../../home/components/goalsData";
import { FlowCard } from "../components/FlowCard";
import {
  FlowDropdownSelect,
  type FlowDropdownOption,
} from "../components/FlowDropdownSelect";
import { WhiteDaysFastDateStep } from "../components/WhiteDaysFastDateStep";
import { StartTimeStep } from "../components/TimePickerSteps";
import {
  FLOW_CARD_HEIGHT,
  styles as commonStyles,
} from "../components/DailyProgressLogging.styles";
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
import {
  getLoggableDateStrings,
  useGetFastingLoggableDates,
  type FastingLoggableDateEntry,
} from "@/src/api/queries/useGetFastingLoggableDates";
import {
  getWizardAvailableDates,
  getWizardStepTitle,
  mapUiLogTypeToWizardMode,
  mapWizardModeToUiLogType,
  useGetFastingGoalLogWizard,
  type FastingLogWizardOption,
} from "@/src/api/queries/useGetFastingGoalLogWizard";
import { useLogFastingGoal } from "@/src/api/mutations/useLogFastingGoal";
import { usePrefillFastingTimesFromApi } from "../hooks/usePrefillFastingTimesFromApi";
import {
  fastingFrameShowsInsights,
  getFastingFrameAchievementLabel,
  getFastingFrameAchievementPct,
} from "@/src/utils/fastingGoalFrameMap";
import { rfs } from "@/src/utils/responsive";

function toDateOptions(dates: string[]): MissedRamadanFastDateOption[] {
  return [...dates]
    .map((date) => String(date).slice(0, 10))
    .filter(Boolean)
    .sort()
    .map((date) => ({ id: date, date, enabled: true }));
}

function toDateOptionsFromEntries(
  entries: FastingLoggableDateEntry[],
): MissedRamadanFastDateOption[] {
  return entries.map((entry) => ({
    id: entry.date,
    date: entry.date,
    enabled: entry.enabled,
    isBookedForAnotherGoal: entry.isBookedForAnotherGoal,
    alreadyLoggedFastingGoal: entry.alreadyLoggedFastingGoal,
    description: entry.description,
  }));
}

function preferLoggableEntries(
  entries: FastingLoggableDateEntry[] | undefined,
  fallbackDates: string[],
): MissedRamadanFastDateOption[] {
  if (entries && entries.length > 0) return toDateOptionsFromEntries(entries);
  return toDateOptions(fallbackDates);
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
  const { t, i18n } = useTranslation();
  const fastingFrame = useOptionalFastingGoalFrameContext();
  const frame = fastingFrame?.frame;
  const frameItem = frame?.items?.[0];
  const { mutateAsync: logFast, isPending: isLogging } = useLogFastingGoal();

  const logWizardQuery = useGetFastingGoalLogWizard("MISSED_RAMADAN");
  const wizardOptions = logWizardQuery.data?.options ?? [];

  /** Planned-side lists come from the frame; keep-on days still need loggable-dates. */
  const frameLoggableDates = frameItem?.loggableDates;
  const frameEarlyLoggableDates = frameItem?.earlyLoggableDates;
  const frameMakeUpLoggableDates = frameItem?.makeUpLoggableDates;

  const plannedLoggableDays = useGetFastingLoggableDates("MISSED_RAMADAN", {
    mode: "PLANNED_DATE",
  });
  const earlyKeepDays = useGetFastingLoggableDates("MISSED_RAMADAN", {
    mode: "EARLIER_THAN_PLANNED",
  });
  const makeUpKeepDays = useGetFastingLoggableDates("MISSED_RAMADAN", {
    mode: "MAKE_UP",
  });

  const [flowMode, setFlowMode] = useState<FlowMode>("collapsed");
  const [stepIndex, setStepIndex] = useState(0);
  const [logType, setLogType] = useState<MissedRamadanFastLogType | null>(null);

  const selectedWizardOption = useMemo((): FastingLogWizardOption | null => {
    if (!logType) return null;
    const mode = mapUiLogTypeToWizardMode(logType);
    return wizardOptions.find((option) => option.mode === mode) ?? null;
  }, [logType, wizardOptions]);
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

  const futurePlannedOptions = useMemo(() => {
    const fromWizard = getWizardAvailableDates(
      selectedWizardOption?.mode === "EARLIER_THAN_PLANNED"
        ? selectedWizardOption
        : wizardOptions.find((option) => option.mode === "EARLIER_THAN_PLANNED"),
      "plannedDate",
    );
    // Planned-side list for "earlier than planned" still comes from wizard/frame.
    // EARLIER_THAN_PLANNED loggable-dates feeds the actual-date step instead.
    return toDateOptions(
      fromWizard.length > 0 ? fromWizard : (frameEarlyLoggableDates ?? []),
    );
  }, [frameEarlyLoggableDates, selectedWizardOption, wizardOptions]);

  const pendingPlannedOptions = useMemo(() => {
    const plannedOption =
      selectedWizardOption?.mode === "PLANNED_DATE"
        ? selectedWizardOption
        : wizardOptions.find((option) => option.mode === "PLANNED_DATE");
    const fromWizard = getWizardAvailableDates(plannedOption, "date");
    return preferLoggableEntries(
      plannedLoggableDays.data?.dates,
      fromWizard.length > 0 ? fromWizard : (frameLoggableDates ?? []),
    );
  }, [
    frameLoggableDates,
    plannedLoggableDays.data?.dates,
    selectedWizardOption,
    wizardOptions,
  ]);

  const skippedOptions = useMemo(() => {
    const makeUpOption =
      selectedWizardOption?.mode === "MAKE_UP"
        ? selectedWizardOption
        : wizardOptions.find((option) => option.mode === "MAKE_UP");
    const fromWizard = getWizardAvailableDates(makeUpOption, "date");
    return preferLoggableEntries(
      makeUpKeepDays.data?.dates,
      fromWizard,
    );
  }, [makeUpKeepDays.data?.dates, selectedWizardOption, wizardOptions]);

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
    const fromWizard = getWizardAvailableDates(
      selectedWizardOption?.mode === "EARLIER_THAN_PLANNED"
        ? selectedWizardOption
        : wizardOptions.find((option) => option.mode === "EARLIER_THAN_PLANNED"),
      "date",
    );
    return preferLoggableEntries(earlyKeepDays.data?.dates, fromWizard).filter(
      (option) =>
        isActualDateBeforePlannedDate(option.date, selectedPlannedFast.date),
    );
  }, [
    earlyKeepDays.data?.dates,
    selectedPlannedFast,
    selectedWizardOption,
    wizardOptions,
  ]);

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

  /** Day the fast was kept — drives Fajr/Maghrib prefill. */
  const fastTimesDate = useMemo(() => {
    switch (logType) {
      case "completed_early":
        return selectedActualDate?.date ?? null;
      case "made_up_skipped":
        return selectedSkippedDate?.date ?? null;
      case "completed_planned":
        return selectedPlannedFast?.date ?? null;
      default:
        return null;
    }
  }, [
    logType,
    selectedActualDate?.date,
    selectedPlannedFast?.date,
    selectedSkippedDate?.date,
  ]);

  usePrefillFastingTimesFromApi(
    "MISSED_RAMADAN",
    fastTimesDate,
    {
      setStartHour,
      setStartMinute,
      setStartPeriod,
      setEndHour,
      setEndMinute,
      setEndPeriod,
    },
    { enabled: flowMode === "active" && Boolean(fastTimesDate) },
  );

  const goalTarget = frame?.goal?.target ?? goalData.target ?? 0;
  const goalCompleted =
    getFastingFrameAchievementPct(frame) >= 100 ||
    String(frame?.goal?.status ?? "").toUpperCase() === "COMPLETED";

  const showInsights = frame ? fastingFrameShowsInsights(frame) : false;

  const logTypeDropdownOptions = useMemo((): FlowDropdownOption<MissedRamadanFastLogType>[] => {
    if (wizardOptions.length > 0) {
      const mapped: FlowDropdownOption<MissedRamadanFastLogType>[] = [];
      for (const option of wizardOptions) {
        const value = mapWizardModeToUiLogType(option.mode);
        if (!value) continue;
        mapped.push({
          value,
          label: option.label,
          hint:
            option.hint?.trim() ||
            t(`progressLogging.missedRamadanLogTypeHint_${value}`),
          disabled: !option.enabled,
        });
      }
      // Enabled modes first so the open menu starts with selectable options.
      return mapped.sort(
        (a, b) => Number(a.disabled) - Number(b.disabled),
      );
    }

    // Fallback while wizard loads / if API omits options.
    const types: MissedRamadanFastLogType[] = [];
    if (
      (frameEarlyLoggableDates?.length ?? 0) > 0 &&
      getLoggableDateStrings(earlyKeepDays.data).length > 0
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
    return types.map((value) => ({
      value,
      label: t(`progressLogging.missedRamadanLogType_${value}`),
      hint: t(`progressLogging.missedRamadanLogTypeHint_${value}`),
      disabled: false,
    }));
  }, [
    earlyKeepDays.data,
    frameEarlyLoggableDates,
    frameMakeUpLoggableDates,
    pendingPlannedOptions.length,
    skippedOptions.length,
    t,
    wizardOptions,
  ]);

  const enabledLogTypes = useMemo(
    () =>
      logTypeDropdownOptions
        .filter((option) => !option.disabled)
        .map((option) => option.value),
    [logTypeDropdownOptions],
  );

  /** Frame `canLog` or any wizard mode enabled. */
  const canLog =
    Boolean(frameItem?.canLog) ||
    (wizardOptions.length > 0 &&
      wizardOptions.some((option) => option.enabled));

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
    setIsStartPeriodDropdownOpen(false);
    setIsEndPeriodDropdownOpen(false);
    onDropdownOpenChange?.(false);
  }, [onDropdownOpenChange]);

  const handleLogTypeChange = useCallback((value: MissedRamadanFastLogType) => {
    setLogType(value);
    setSelectedPlannedFastId(null);
    setSelectedActualDateId(null);
    setSelectedSkippedDateId(null);
    setStepIndex(0);
  }, []);

  useEffect(() => {
    if (logType && enabledLogTypes.length > 0 && !enabledLogTypes.includes(logType)) {
      setLogType(null);
      setStepIndex(0);
    }
  }, [enabledLogTypes, logType]);

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
          logWizardQuery.refetch(),
        ]);

        const loggedDate =
          result.date ??
          (logType === "completed_early"
            ? actualDate?.date
            : logType === "made_up_skipped"
              ? skippedDate?.date
              : plannedFast?.date) ??
          "";
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
    logWizardQuery,
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
    // Prefer "completed a planned fast" as the default selected option.
    const defaultLogType = enabledLogTypes.includes("completed_planned")
      ? "completed_planned"
      : (enabledLogTypes[0] ?? null);
    setLogType(defaultLogType);
    setSelectedPlannedFastId(null);
    setSelectedActualDateId(null);
    setSelectedSkippedDateId(null);
    setStepIndex(0);
    setFlowMode("active");
  }, [canLog, enabledLogTypes]);

  const getStepHeader = (step: MissedRamadanFastsStepId) => {
    const calendarIcon = (
      <FlowCardCallender size={18} color={Colors.light.white} />
    );
    const timeIcon = <TimeSpentIcon size={19} color={Colors.light.white} />;
    const helpIcon = (
      <MissedRamadanFastsGreenCardIcon size={18} color={Colors.light.white} />
    );

    switch (step) {
      case "logType":
        return {
          icon: helpIcon,
          label: t("progressLogging.missedRamadanWhatAreYouLogging"),
        };
      case "selectPlannedFast": {
        const wizardTitle =
          logType === "completed_early"
            ? getWizardStepTitle(selectedWizardOption, "plannedDate")
            : getWizardStepTitle(selectedWizardOption, "date");
        return {
          icon: calendarIcon,
          label:
            wizardTitle ??
            (logType === "completed_early"
              ? t("progressLogging.missedRamadanSelectPlannedFastEarly")
              : t("progressLogging.missedRamadanSelectPlannedFastCompleted")),
        };
      }
      case "selectActualDate":
        return {
          icon: calendarIcon,
          label:
            getWizardStepTitle(selectedWizardOption, "date") ??
            t("progressLogging.missedRamadanWhichDayDidYouFast"),
        };
      case "selectSkippedDate":
        return {
          icon: calendarIcon,
          label:
            getWizardStepTitle(selectedWizardOption, "date") ??
            t("progressLogging.missedRamadanMakeupSkippedDateLabel"),
        };
      case "startTime":
        return {
          icon: timeIcon,
          label:
            getWizardStepTitle(selectedWizardOption, "time") ??
            t("progressLogging.missedRamadanEnterStartTime"),
        };
      case "endTime":
        return {
          icon: timeIcon,
          label:
            getWizardStepTitle(selectedWizardOption, "time") ??
            t("progressLogging.missedRamadanEnterEndTime"),
        };
    }
  };

  const shiftDateOptionId = useCallback(
    (
      options: MissedRamadanFastDateOption[],
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

  const toDateLabel = useCallback(
    (option: MissedRamadanFastDateOption | null | undefined) => {
      if (!option) return "";
      if (option.date === today) return t("progressLogging.today");
      return formatMissedRamadanFastDateLabel(option.date, today);
    },
    [t, today],
  );

  /** Figma: chevron date stepper with enabled / booked / already-logged states. */
  const renderDateStep = (
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
          shiftDateOptionId(options, selectedId, direction, onSelect)
        }
        styles={commonStyles}
        enabled={selectedOption?.enabled !== false}
        description={selectedOption?.description ?? null}
      />
    );
  };

  const currentDateStepOption = useMemo((): MissedRamadanFastDateOption | null => {
    switch (currentStep) {
      case "selectPlannedFast":
        return selectedPlannedFast;
      case "selectActualDate":
        return selectedActualDate;
      case "selectSkippedDate":
        return selectedSkippedDate;
      default:
        return null;
    }
  }, [
    currentStep,
    selectedActualDate,
    selectedPlannedFast,
    selectedSkippedDate,
  ]);

  const isCurrentDateStepEnabled =
    !currentDateStepOption || currentDateStepOption.enabled !== false;
  const isDateSelectionStep =
    currentStep === "selectPlannedFast" ||
    currentStep === "selectActualDate" ||
    currentStep === "selectSkippedDate";

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
            hint={
              selectedWizardOption?.hint ??
              logTypeDropdownOptions.find((option) => option.value === logType)
                ?.hint ??
              null
            }
            menuPlacement="overlay"
            menuStyle={commonStyles.fastingWizardLogTypeMenu}
            labelNumberOfLines={1}
            hintNumberOfLines={2}
            compactMenu
            hideSelectedInMenu
          />
        );
      case "selectPlannedFast":
        return renderDateStep(
          logType === "completed_early"
            ? futurePlannedOptions
            : pendingPlannedOptions,
          selectedPlannedFastId,
          setSelectedPlannedFastId,
        );
      case "selectActualDate":
        return renderDateStep(
          actualDateOptions,
          selectedActualDateId,
          setSelectedActualDateId,
        );
      case "selectSkippedDate":
        return renderDateStep(
          skippedOptions,
          selectedSkippedDateId,
          setSelectedSkippedDateId,
        );
      case "startTime":
        return renderTimeStep(
          t("progressLogging.missedRamadanStartTimeLabel"),
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
          {
            canGoPrev: stepIndex > 0,
            canGoNext: isStartTimeValid,
          },
        );
      case "endTime":
        return renderTimeStep(
          t("progressLogging.missedRamadanEndTimeLabel"),
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
          {
            canGoPrev: true,
            canGoNext: false,
          },
        );
    }
  };

  /** Figma Step 3: label + large side chevrons around the time picker. */
  const renderTimeStep = (
    sectionLabel: string,
    picker: React.ReactNode,
    nav: { canGoPrev: boolean; canGoNext: boolean },
  ) => (
    <View style={localStyles.timeStepWrap}>
      <Text style={localStyles.timeSectionLabel}>{sectionLabel}</Text>
      <View style={commonStyles.dateRow}>
        <TouchableOpacity
          onPress={handleBack}
          disabled={!nav.canGoPrev}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons
            name={i18n.language === "ar" ? "chevron-forward" : "chevron-back"}
            size={32}
            color={
              nav.canGoPrev ? Colors.light.white : Colors.light.dullWhiteOpacity
            }
          />
        </TouchableOpacity>

        <View style={localStyles.timePickerCenter}>{picker}</View>

        <TouchableOpacity
          onPress={handleForward}
          disabled={!nav.canGoNext}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons
            name={i18n.language === "ar" ? "chevron-back" : "chevron-forward"}
            size={32}
            color={
              nav.canGoNext ? Colors.light.white : Colors.light.dullWhiteOpacity
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const canProceed = (() => {
    switch (currentStep) {
      case "logType":
        return Boolean(logType);
      case "selectPlannedFast":
        return (
          Boolean(selectedPlannedFast) &&
          selectedPlannedFast?.enabled !== false
        );
      case "selectActualDate":
        return (
          Boolean(selectedActualDate) &&
          selectedActualDate?.enabled !== false &&
          Boolean(selectedPlannedFast) &&
          isActualDateBeforePlannedDate(
            selectedActualDate!.date,
            selectedPlannedFast!.date,
          )
        );
      case "selectSkippedDate":
        return (
          Boolean(selectedSkippedDate) &&
          selectedSkippedDate?.enabled !== false
        );
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
  const isPeriodDropdownOpen =
    isStartPeriodDropdownOpen || isEndPeriodDropdownOpen;
  const isAnyDropdownOpen = isLogTypeDropdownOpen || isPeriodDropdownOpen;

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
            isAnyDropdownOpen && {
              zIndex: 220,
              elevation: 24,
              overflow: "visible" as const,
            },
          ]}
        >
          {flowMode === "collapsed" ? (
            <View style={localStyles.summaryCard}>
              <View style={localStyles.summaryBody}>
                <View style={localStyles.summaryIconCircle}>
                  <MissedRamadanGreenCardIcon
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

              {canLog ? (
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
                isAnyDropdownOpen && {
                  zIndex: 200,
                  elevation: 20,
                  overflow: "visible" as const,
                },
              ]}
            >
              <FlowCard
                headerIcon={stepHeader.icon}
                headerLabel={stepHeader.label}
                onBack={handleBack}
                onForward={handleForward}
                onConfirm={handleConfirm}
                canGoForward={
                  !isLastStep &&
                  canProceed &&
                  currentStep !== "startTime"
                }
                canGoBack={stepIndex > 0}
                canConfirm={canConfirm}
                showConfirmButton={
                  currentStep === "startTime" || currentStep === "endTime"
                }
                headerSingleLine={
                  currentStep === "startTime" || currentStep === "endTime"
                }
                styles={commonStyles}
                style={[
                  commonStyles.inPlaceFlowCard,
                  isAnyDropdownOpen && commonStyles.flowCardDropdownOpen,
                ]}
                contentStyle={[
                  currentStep === "logType" && {
                    justifyContent: "flex-start" as const,
                  },
                  isAnyDropdownOpen && commonStyles.flowContentDropdownOpen,
                ]}
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
    fontSize: rfs(12),
    fontWeight: "500",
    lineHeight: rfs(12.5),
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
    fontSize: rfs(14),
    fontWeight: "600",
    lineHeight: rfs(18),
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
    fontSize: rfs(16),
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
    gap: 6,
  },
  timeSectionLabel: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: rfs(10),
    lineHeight: rfs(10),
    textAlign: "center",
    opacity: 0.95,
  },
  timePickerCenter: {
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 1,
    minWidth: 0,
    transform: [{ translateX: 4 }],
  },
});
