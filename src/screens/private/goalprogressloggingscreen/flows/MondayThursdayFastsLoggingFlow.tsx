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
import { FastingFlowCardMondayFasts } from "@/assets/icons/FastingFlowCardMondayFasts";
import { FastingDashboardIcon } from "@/assets/icons/FastingDashboardIcon";
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
import { StartTimeStep } from "../components/TimePickerSteps";
import { WhiteDaysFastDateStep } from "../components/WhiteDaysFastDateStep";
import {
  FLOW_CARD_HEIGHT,
  styles as commonStyles,
} from "../components/DailyProgressLogging.styles";
import { fonts } from "@/assets/fonts";
import { isValidStartTime } from "../quranRecitationTarget";
import {
  formatMondayThursdayFastDateLabel,
  getMondayThursdayFastGoalTarget,
  getTodayDateString,
  isActualDateBeforePlannedDate,
  isMondayThursdayFastEndTimeAfterStartTime,
  isMondayThursdaySelectedGoalFast,
  type MondayThursdayFastDateOption,
  type MondayThursdayFastLogType,
} from "../mondayThursdayFastsData";
import type { MondayThursdayFastsLogEntry } from "../types";
import {
  getLoggableDateStrings,
  useGetFastingLoggableDates,
  type FastingLoggableDateEntry,
} from "@/src/api/queries/useGetFastingLoggableDates";
import { usePrefillFastingTimesFromApi } from "../hooks/usePrefillFastingTimesFromApi";
import { useLogFastingGoal } from "@/src/api/mutations/useLogFastingGoal";
import { useOptionalFastingGoalFrameContext } from "../fastingGoalFrameContext";
import {
  fastingFrameShowsInsights,
  getFastingFrameAchievementLabel,
} from "@/src/utils/fastingGoalFrameMap";
import {
  getWizardAvailableDates,
  getWizardStepTitle,
  mapUiLogTypeToWizardMode,
  mapWizardModeToUiLogType,
  useGetFastingGoalLogWizard,
  type FastingLogWizardOption,
} from "@/src/api/queries/useGetFastingGoalLogWizard";
import { fs } from "@/src/utils/responsive";

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

function toDateOptions(dates: string[]): MondayThursdayFastDateOption[] {
  return [...dates]
    .map((date) => String(date).slice(0, 10))
    .filter(Boolean)
    .sort()
    .map((date) => ({ id: date, date, enabled: true }));
}

function toDateOptionsFromEntries(
  entries: FastingLoggableDateEntry[],
): MondayThursdayFastDateOption[] {
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
): MondayThursdayFastDateOption[] {
  if (entries && entries.length > 0) return toDateOptionsFromEntries(entries);
  return toDateOptions(fallbackDates);
}

export default function MondayThursdayFastsLoggingFlow({
  goalData,
  onLogComplete,
  onDropdownOpenChange,
}: Props) {
  const { t } = useTranslation();
  const fastingFrame = useOptionalFastingGoalFrameContext();
  const frame = fastingFrame?.frame;
  const frameItem = frame?.items?.[0];
  const frameLoggableDates = frameItem?.loggableDates;
  const frameEarlyLoggableDates = frameItem?.earlyLoggableDates;
  const frameMakeUpLoggableDates = frameItem?.makeUpLoggableDates;
  const { mutateAsync: logFast, isPending: isLogging } = useLogFastingGoal();
  const logWizardQuery = useGetFastingGoalLogWizard("MONDAY_THURSDAY");
  const wizardOptions = logWizardQuery.data?.options ?? [];
  const plannedLoggableDays = useGetFastingLoggableDates("MONDAY_THURSDAY", {
    mode: "PLANNED_DATE",
  });
  const earlyKeepDays = useGetFastingLoggableDates("MONDAY_THURSDAY", {
    mode: "EARLIER_THAN_PLANNED",
  });
  const makeUpKeepDays = useGetFastingLoggableDates("MONDAY_THURSDAY", {
    mode: "MAKE_UP",
  });
  const [flowMode, setFlowMode] = useState<FlowMode>("collapsed");
  const [stepIndex, setStepIndex] = useState(0);
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

  const selectedWizardOption = useMemo((): FastingLogWizardOption | null => {
    if (!logType) return null;
    const mode = mapUiLogTypeToWizardMode(logType);
    return wizardOptions.find((option) => option.mode === mode) ?? null;
  }, [logType, wizardOptions]);

  const futurePlannedOptions = useMemo(() => {
    const fromWizard = getWizardAvailableDates(
      selectedWizardOption?.mode === "EARLIER_THAN_PLANNED"
        ? selectedWizardOption
        : wizardOptions.find((option) => option.mode === "EARLIER_THAN_PLANNED"),
      "plannedDate",
    );
    // Planned-side list for "earlier than planned" comes from wizard/frame.
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

  const plannedFastOptions = useMemo(() => {
    if (!logType || logType === "made_up_skipped") return [];
    return logType === "completed_early"
      ? futurePlannedOptions
      : pendingPlannedOptions;
  }, [futurePlannedOptions, logType, pendingPlannedOptions]);

  const missedOptions = useMemo(() => {
    const makeUpOption =
      selectedWizardOption?.mode === "MAKE_UP"
        ? selectedWizardOption
        : wizardOptions.find((option) => option.mode === "MAKE_UP");
    const fromWizard = getWizardAvailableDates(makeUpOption, "date");
    return preferLoggableEntries(
      makeUpKeepDays.data?.dates,
      fromWizard.length > 0 ? fromWizard : (frameMakeUpLoggableDates ?? []),
    );
  }, [
    frameMakeUpLoggableDates,
    makeUpKeepDays.data?.dates,
    selectedWizardOption,
    wizardOptions,
  ]);

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

  const selectedMissedDate = useMemo(
    () =>
      missedOptions.find((option) => option.id === selectedMissedDateId) ??
      null,
    [selectedMissedDateId, missedOptions],
  );

  /** Day the fast was kept — drives Fajr/Maghrib prefill. */
  const fastTimesDate = useMemo(() => {
    switch (logType) {
      case "completed_early":
        return selectedActualDate?.date ?? null;
      case "made_up_skipped":
        return selectedMissedDate?.date ?? null;
      case "completed_planned":
        return selectedPlannedFast?.date ?? null;
      default:
        return null;
    }
  }, [
    logType,
    selectedActualDate?.date,
    selectedMissedDate?.date,
    selectedPlannedFast?.date,
  ]);

  usePrefillFastingTimesFromApi(
    "MONDAY_THURSDAY",
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

  const goalTarget = Number(
    frame?.goal?.target ?? goalData.target ?? getMondayThursdayFastGoalTarget(),
  ) || getMondayThursdayFastGoalTarget();
  const showInsights = frame ? fastingFrameShowsInsights(frame) : false;

  /** Frame `canLog` or any wizard mode enabled. */
  const canLog =
    Boolean(frameItem?.canLog) ||
    (wizardOptions.length > 0 &&
      wizardOptions.some((option) => option.enabled));

  const summaryTitle =
    frameItem?.title?.trim() ||
    t("progressLogging.mondayThursdayCardSubtitle", {
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

  const logTypeDropdownOptions = useMemo((): FlowDropdownOption<MondayThursdayFastLogType>[] => {
    if (wizardOptions.length > 0) {
      const mapped: FlowDropdownOption<MondayThursdayFastLogType>[] = [];
      for (const option of wizardOptions) {
        const value = mapWizardModeToUiLogType(option.mode);
        if (!value) continue;
        mapped.push({
          value,
          label: option.label,
          hint: option.hint,
          disabled: !option.enabled,
        });
      }
      // Enabled modes first so the open menu starts with selectable options.
      return mapped.sort(
        (a, b) => Number(a.disabled) - Number(b.disabled),
      );
    }

    // Fallback while wizard loads / if API omits options.
    const types: MondayThursdayFastLogType[] = [];
    if (
      (frameEarlyLoggableDates?.length ?? 0) > 0 &&
      getLoggableDateStrings(earlyKeepDays.data).length > 0
    ) {
      types.push("completed_early");
    }
    if (
      (frameMakeUpLoggableDates?.length ?? 0) > 0 &&
      missedOptions.length > 0
    ) {
      types.push("made_up_skipped");
    }
    if (pendingPlannedOptions.length > 0) {
      types.push("completed_planned");
    }
    return types.map((value) => ({
      value,
      label: t(`progressLogging.mondayThursdayLogType_${value}`),
      disabled: false,
    }));
  }, [
    earlyKeepDays.data,
    frameEarlyLoggableDates,
    frameMakeUpLoggableDates,
    missedOptions.length,
    pendingPlannedOptions.length,
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
        enabled={selectedOption?.enabled !== false}
        description={selectedOption?.description ?? null}
      />
    );
  };

  const currentDateStepOption = useMemo((): MondayThursdayFastDateOption | null => {
    switch (currentStep) {
      case "selectPlannedFast":
        return selectedPlannedFast;
      case "selectActualDate":
        return selectedActualDate;
      case "selectMissedDate":
        return selectedMissedDate;
      default:
        return null;
    }
  }, [
    currentStep,
    selectedActualDate,
    selectedMissedDate,
    selectedPlannedFast,
  ]);

  const isCurrentDateStepEnabled =
    !currentDateStepOption || currentDateStepOption.enabled !== false;
  const isDateSelectionStep =
    currentStep === "selectPlannedFast" ||
    currentStep === "selectActualDate" ||
    currentStep === "selectMissedDate";

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
      setStepIndex(0);
    },
    [],
  );

  useEffect(() => {
    if (
      logType &&
      enabledLogTypes.length > 0 &&
      !enabledLogTypes.includes(logType)
    ) {
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

    if (currentStep === "selectMissedDate" && !selectedMissedDateId) {
      if (missedOptions[0]) {
        setSelectedMissedDateId(missedOptions[0].id);
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
    const missedDate = resolveMissedDateSelection();
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
            fastingType: "MONDAY_THURSDAY",
            date: actualDate.date,
            startTime,
            endTime,
            mode: "EARLIER_THAN_PLANNED",
            plannedDate: plannedFast.date,
          });
        } else if (logType === "made_up_skipped") {
          if (!missedDate) return;
          result = await logFast({
            fastingType: "MONDAY_THURSDAY",
            date: missedDate.date,
            startTime,
            endTime,
            mode: "MAKE_UP",
          });
        } else if (logType === "completed_planned") {
          if (!plannedFast) return;
          result = await logFast({
            fastingType: "MONDAY_THURSDAY",
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
          plannedLoggableDays.refetch(),
          logWizardQuery.refetch(),
        ]);

        const loggedDate =
          result.date ??
          (logType === "completed_early"
            ? actualDate?.date
            : logType === "made_up_skipped"
              ? missedDate?.date
              : plannedFast?.date) ??
          "";

        const completedCount = Number(result.goal?.completed ?? 0) || 0;
        const target = Number(result.goal?.target ?? goalTarget) || goalTarget;
        const remainingCount =
          Number(result.goal?.remaining) ||
          Math.max(0, target - completedCount);

        onLogComplete?.({
          type: "monday-thursday-fasts",
          goalId: "fasting-mondayThursday",
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
          missedFastDate:
            logType === "made_up_skipped" ? missedDate?.date : undefined,
          plannedDate: result.plannedDate,
          goalTarget: target,
          completedCount,
          remainingCount,
          goalCompleted:
            Boolean(result.goal?.justCompleted) ||
            Number(result.goal?.achievementPct ?? 0) >= 100 ||
            String(result.goal?.status ?? "").toUpperCase() === "COMPLETED",
          wasSelected: isMondayThursdaySelectedGoalFast(loggedDate),
        });

        resetFlow();
      } catch {
        // Toast handled in useLogFastingGoal.onError
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
    missedOptions,
    onLogComplete,
    plannedLoggableDays,
    pendingPlannedOptions,
    futurePlannedOptions,
    resetFlow,
    resolveActualDateSelection,
    resolveMissedDateSelection,
    resolvePlannedFastSelection,
    selectedActualDateId,
    selectedMissedDateId,
    selectedPlannedFastId,
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

    if (currentStep === "selectMissedDate" && selectedMissedDate) {
      setStepIndex((index) => index + 1);
      return;
    }

    if (currentStep === "startTime" && isStartTimeValid) {
      setStepIndex((index) => index + 1);
    }
  };

  const handleOpenFlow = useCallback(() => {
    if (!canOpenLogging) return;
    applyCurrentTimeDefaults();
    const defaultLogType = enabledLogTypes.includes("completed_planned")
      ? "completed_planned"
      : (enabledLogTypes[0] ?? null);
    setLogType(defaultLogType);
    setSelectedPlannedFastId(null);
    setSelectedActualDateId(null);
    setSelectedMissedDateId(null);
    setStepIndex(0);
    setFlowMode("active");
  }, [canLog, enabledLogTypes]);

  const getStepHeader = (step: MondayThursdayFastsStepId) => {
    const calendarIcon = (
      <FlowCardCallender size={18} color={Colors.light.white} />
    );
    const timeIcon = <TimeSpentIcon size={19} color={Colors.light.white} />;
    const helpIcon = (
      <FastingDashboardIcon size={20} color={Colors.light.white} />
    );

    switch (step) {
      case "logType":
        return {
          icon: helpIcon,
          label: t("progressLogging.mondayThursdayWhatAreYouLogging"),
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
              ? t("progressLogging.mondayThursdaySelectPlannedFastEarly")
              : t("progressLogging.mondayThursdaySelectPlannedFastCompleted")),
        };
      }
      case "selectActualDate":
        return {
          icon: calendarIcon,
          label:
            getWizardStepTitle(selectedWizardOption, "date") ??
            t("progressLogging.mondayThursdayWhichDayDidYouFast"),
        };
      case "selectMissedDate":
        return {
          icon: calendarIcon,
          label:
            getWizardStepTitle(selectedWizardOption, "date") ??
            t("progressLogging.mondayThursdayMakeupSkippedDateLabel"),
        };
      case "startTime":
        return {
          icon: timeIcon,
          label:
            getWizardStepTitle(selectedWizardOption, "time") ??
            t("progressLogging.mondayThursdayEnterStartTime"),
        };
      case "endTime":
        return {
          icon: timeIcon,
          label:
            getWizardStepTitle(selectedWizardOption, "time") ??
            t("progressLogging.mondayThursdayEnterEndTime"),
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
      case "selectMissedDate":
        return (
          Boolean(selectedMissedDate) &&
          selectedMissedDate?.enabled !== false
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
        return Boolean(resolveMissedDateSelection());
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
            isLogTypeDropdownOpen && { zIndex: 220, elevation: 24 },
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
                ) : (
                  <View style={localStyles.spacer} />
                )}
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
                isLogTypeDropdownOpen && {
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
                canGoForward={!isLastStep && canProceed}
                canGoBack={stepIndex > 0}
                canConfirm={canConfirm}
                showConfirmButton={isLastStep}
                styles={commonStyles}
                style={[
                  commonStyles.inPlaceFlowCard,
                  isLogTypeDropdownOpen && commonStyles.flowCardDropdownOpen,
                ]}
                contentStyle={[
                  currentStep === "logType" && {
                    justifyContent: "flex-start" as const,
                  },
                  isLogTypeDropdownOpen &&
                    commonStyles.flowContentDropdownOpen,
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
    fontSize: fs(12),
    fontWeight: "500",
    lineHeight: fs(12.5),
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
  spacer: {
    flex: 1,
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
    fontSize: fs(14),
    fontWeight: "600",
    lineHeight: fs(18),
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
    fontSize: fs(16),
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
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    fontSize: fs(10),
    lineHeight: fs(13),
    textAlign: "center",
    opacity: 0.95,
  },
});
