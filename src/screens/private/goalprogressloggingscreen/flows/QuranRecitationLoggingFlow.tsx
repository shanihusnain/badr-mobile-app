import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import moment from "moment-hijri";
import { Colors } from "@/constants/theme";
import { GoalData } from "../../home/components/goalsData";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { DateStep } from "../components/DateStep";
import { formatProgressLoggingDateLabel } from "../progressLoggingConfig";
import { DurationStep, StartTimeStep, getCurrentStartTimeParts } from "../components/TimePickerSteps";
import { RecitationCompletionStep } from "../components/RecitationCompletionStep";
import { FlowCard } from "../components/FlowCard";
import { styles } from "../components/DailyProgressLogging.styles";
import {
  CalendarFlippingIcon,
  QuranImageIcon,
  WhiteClockIcon,
  WhiteTimerIcon,
} from "@/assets/icons";
import { useLogQuranRecitationSurahGoal } from "@/src/api/mutations/useLogQuranRecitationSurahGoal";
import { getQuranRecitationFlowDefinition } from "../loggingFlowRegistry";
import { useOptionalQuranGoalFrameContext } from "../quranGoalFrameContext";
import type { QuranRecitationDayType } from "../quranRecitationWeeklyData";
import {
  buildRecitationSteps,
  clampRecitationQuantity,
  createDefaultDurations,
  getRecitationCountForSteps,
  getRecitationCycleTotal,
  isValidRecitationCount,
  isValidStartTime,
  isValidTimeSpent,
  parseDurationStepIndex,
  resolveLoggedRecitationCount,
  type QuranRecitationStepId,
  type QuranRecitationTargetConfig,
  type RecitationDurationValue,
} from "../quranRecitationTarget";
import type { QuranRecitationLogEntry } from "../types";

type FlowMode = "collapsed" | "active";

type Props = {
  goalData: GoalData;
  targetConfig?: QuranRecitationTargetConfig;
  hideCollapsedSummary?: boolean;
  embedded?: boolean;
  suppressOverlay?: boolean;
  flowMode?: FlowMode;
  onFlowModeChange?: (mode: FlowMode) => void;
  onLogComplete?: (entry: QuranRecitationLogEntry) => void;
};

const toDateString = (date: Date) => moment(date).format("YYYY-MM-DD");

export default function QuranRecitationLoggingFlow({
  goalData,
  targetConfig: targetConfigOverride,
  hideCollapsedSummary = false,
  embedded = false,
  suppressOverlay = false,
  flowMode: controlledFlowMode,
  onFlowModeChange,
  onLogComplete,
}: Props) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const quranFrame = useOptionalQuranGoalFrameContext();
  const { mutateAsync: logRecitationSurah, isPending: isLogging } =
    useLogQuranRecitationSurahGoal();
  const flowDefinition = useMemo(
    () => getQuranRecitationFlowDefinition(goalData.id),
    [goalData.id],
  );

  const config = useMemo(() => {
    if (!flowDefinition) return null;

    if (!targetConfigOverride) {
      return flowDefinition.config;
    }

    const quantity = clampRecitationQuantity(targetConfigOverride.quantity);
    return {
      ...targetConfigOverride,
      quantity,
      cycleTotal: getRecitationCycleTotal(
        targetConfigOverride.frequency,
        quantity,
      ),
    };
  }, [flowDefinition, targetConfigOverride]);

  const targetQuantity = config?.quantity ?? 1;
  const itemNumber = useMemo(() => {
    const fromConfig = Number(config?.itemNumber ?? 0);
    if (Number.isFinite(fromConfig) && fromConfig > 0) return fromConfig;
    const fromFrame = Number(quranFrame?.itemNumber ?? 0);
    if (Number.isFinite(fromFrame) && fromFrame > 0) return fromFrame;
    return 0;
  }, [config?.itemNumber, quranFrame?.itemNumber]);

  const [internalFlowMode, setInternalFlowMode] =
    useState<FlowMode>("collapsed");
  const flowMode = controlledFlowMode ?? internalFlowMode;

  const setFlowMode = useCallback(
    (mode: FlowMode) => {
      onFlowModeChange?.(mode);
      if (controlledFlowMode === undefined) {
        setInternalFlowMode(mode);
      }
    },
    [controlledFlowMode, onFlowModeChange],
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const initialStartTime = getCurrentStartTimeParts();
  const [startHour, setStartHour] = useState(initialStartTime.hour);
  const [startMinute, setStartMinute] = useState(initialStartTime.minute);
  const [startPeriod, setStartPeriod] = useState<"am" | "pm">(
    initialStartTime.period,
  );
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [recitationCount, setRecitationCount] = useState(0);
  const [committedRecitationCount, setCommittedRecitationCount] = useState(1);
  const [durations, setDurations] = useState<RecitationDurationValue[]>(
    createDefaultDurations(1),
  );

  const todayString = toDateString(new Date());

  const alreadyLoggedForSelectedDate = useMemo(() => {
    const week = quranFrame?.frame?.week;
    if (!week) return 0;

    // Weekly quota is period-wide; daily quotas are per selected day.
    if (config?.frequency === "weekly") {
      const fromDays = (week.days ?? []).reduce((sum, entry) => {
        const value = Number(entry.value ?? 0);
        return sum + (Number.isFinite(value) && value > 0 ? Math.round(value) : 0);
      }, 0);
      if (fromDays > 0) return fromDays;
      const weekTotal = Number(week.totalMinutes ?? 0);
      return Number.isFinite(weekTotal) && weekTotal > 0
        ? Math.round(weekTotal)
        : 0;
    }

    const day = (week.days ?? []).find((entry) => entry.date === selectedDate);
    if (!day) return 0;
    const value = Number(day.value ?? 0);
    return Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
  }, [
    config?.frequency,
    quranFrame?.frame?.week,
    selectedDate,
  ]);

  const completionDayType = useMemo((): QuranRecitationDayType => {
    if (selectedDate > todayString) return "future";
    if (selectedDate === todayString) return "today";
    return "past";
  }, [selectedDate, todayString]);

  const remainingCapacity = Math.max(
    0,
    targetQuantity - alreadyLoggedForSelectedDate,
  );

  const recitationCountForSteps = getRecitationCountForSteps(
    remainingCapacity > 0 ? remainingCapacity : targetQuantity,
    committedRecitationCount,
  );

  const steps = useMemo(
    () => buildRecitationSteps(targetQuantity, recitationCountForSteps),
    [recitationCountForSteps, targetQuantity],
  );

  useEffect(() => {
    setDurations((prev) => {
      const next = [...prev];
      while (next.length < recitationCountForSteps) {
        next.push({ hours: "0", minutes: "0" });
      }
      while (next.length > recitationCountForSteps) {
        next.pop();
      }
      return next;
    });
  }, [recitationCountForSteps]);

  useEffect(() => {
    setStepIndex((index) => Math.min(index, Math.max(steps.length - 1, 0)));
  }, [steps.length]);

  // New day / prior progress: clear session picks so prior green arcs show alone.
  useEffect(() => {
    setRecitationCount(0);
    setCommittedRecitationCount(1);
  }, [selectedDate, alreadyLoggedForSelectedDate]);

  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const resetFlow = useCallback(() => {
    setFlowMode("collapsed");
    setStepIndex(0);
    setSelectedDate(toDateString(new Date()));
    const now = getCurrentStartTimeParts();
    setStartHour(now.hour);
    setStartMinute(now.minute);
    setStartPeriod(now.period);
    setIsPeriodDropdownOpen(false);
    setRecitationCount(0);
    setCommittedRecitationCount(1);
    setDurations(createDefaultDurations(1));
  }, [setFlowMode]);

  const isStepValid = useCallback(
    (step: QuranRecitationStepId) => {
      switch (step) {
        case "date":
          return Boolean(selectedDate);
        case "startTime":
          return isValidStartTime(startHour, startMinute, startPeriod);
        case "recitationCount":
          return (
            remainingCapacity > 0 &&
            isValidRecitationCount(recitationCount, remainingCapacity)
          );
        default: {
          const durationIndex = parseDurationStepIndex(step);
          if (durationIndex === null) return false;
          const duration = durations[durationIndex - 1];
          if (!duration) return false;
          return isValidTimeSpent(duration.hours, duration.minutes);
        }
      }
    },
    [
      durations,
      recitationCount,
      remainingCapacity,
      selectedDate,
      startHour,
      startMinute,
      startPeriod,
    ],
  );

  const canGoForward = !isLogging && !isLastStep && isStepValid(currentStep);

  if (!flowDefinition || !config) return null;
  if (embedded && flowMode !== "active") return null;
  if (hideCollapsedSummary && !embedded && flowMode === "collapsed")
    return null;

  const dateLabel = formatProgressLoggingDateLabel(
    selectedDate,
    todayString,
    t("progressLogging.today"),
  );

  const frequencyLabelKey =
    config.frequency === "daily"
      ? "progressLogging.recitationFrequencyDaily"
      : "progressLogging.recitationFrequencyWeekly";

  const summaryTitleKey =
    config.frequency === "daily"
      ? "progressLogging.recitationGoalTitleDaily"
      : "progressLogging.recitationGoalTitleWeekly";

  const shiftDate = (direction: -1 | 1) => {
    if (isLogging) return;
    const next = moment(selectedDate, "YYYY-MM-DD")
      .add(direction, "days")
      .format("YYYY-MM-DD");
    if (direction === 1 && next > todayString) return;
    setSelectedDate(next);
  };

  const updateDuration = (
    index: number,
    field: "hours" | "minutes",
    value: string,
  ) => {
    if (isLogging) return;
    setDurations((prev) =>
      prev.map((duration, durationIndex) =>
        durationIndex === index ? { ...duration, [field]: value } : duration,
      ),
    );
  };

  const formatSessionStartTimeForApi = () => {
    const hourNum = Number.parseInt(startHour || "0", 10) || 0;
    const minuteNum = Number.parseInt(startMinute || "0", 10) || 0;

    let hour24 = hourNum % 12;
    if (startPeriod === "pm") hour24 += 12;

    const hh = String(Math.max(0, hour24)).padStart(2, "0");
    const mm = String(Math.max(0, minuteNum)).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const handleConfirm = () => {
    if (isLogging) return;
    if (!isLastStep) {
      handleForward();
      return;
    }

    if (!isValidStartTime(startHour, startMinute, startPeriod)) return;
    if (!Number.isFinite(itemNumber) || itemNumber < 1) return;

    const resolvedCount = resolveLoggedRecitationCount(
      remainingCapacity > 0 ? remainingCapacity : targetQuantity,
      committedRecitationCount,
    );
    if (
      !isValidRecitationCount(
        resolvedCount,
        remainingCapacity > 0 ? remainingCapacity : targetQuantity,
      )
    ) {
      return;
    }

    const recitationDurations = durations
      .slice(0, resolvedCount)
      .map((duration) => ({
        hours: Number.parseInt(duration.hours || "0", 10) || 0,
        minutes: Number.parseInt(duration.minutes || "0", 10) || 0,
      }));

    if (
      recitationDurations.length !== resolvedCount ||
      recitationDurations.some(
        (duration) =>
          !isValidTimeSpent(String(duration.hours), String(duration.minutes)),
      )
    ) {
      return;
    }

    const totalMinutes = recitationDurations.reduce(
      (sum, duration) => sum + duration.hours * 60 + duration.minutes,
      0,
    );
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const startTime = `${startHour}:${startMinute} ${startPeriod}`;
    const sessionStartTime = formatSessionStartTimeForApi();

    const run = async () => {
      try {
        await logRecitationSurah({
          quranGoalType: "RECITATION_SURAH",
          date: selectedDate,
          sessionStartTime,
          itemType: "SURAH",
          itemNumber,
          recitations: recitationDurations.map((duration) => ({
            durationMinutes: duration.hours * 60 + duration.minutes,
          })),
        });
        await quranFrame?.refetch();

        onLogComplete?.({
          type: "quran-recitation",
          goalId: flowDefinition.goalId,
          date: selectedDate,
          startTime,
          recitationCount: resolvedCount,
          hours,
          minutes,
          durationLabel: `${hours}h ${minutes}m`,
          recitationDurations,
          frequency: config.frequency,
          targetQuantity: config.quantity,
          surahName: config.surahName,
        });
        resetFlow();
      } catch {
        // Mutation onError already shows toast.
      }
    };

    void run();
  };

  const handleBack = () => {
    if (isLogging) return;
    if (stepIndex === 0) {
      resetFlow();
      return;
    }
    setStepIndex((index) => index - 1);
  };

  const handleForward = () => {
    if (!canGoForward) return;

    if (currentStep === "recitationCount") {
      const nextCount = getRecitationCountForSteps(
        remainingCapacity > 0 ? remainingCapacity : targetQuantity,
        recitationCount,
      );
      setCommittedRecitationCount(nextCount);
      setDurations(createDefaultDurations(nextCount));
    }

    setStepIndex((index) => index + 1);
  };

  const getStepHeader = (step: QuranRecitationStepId) => {
    switch (step) {
      case "date":
        return {
          icon: <CalendarFlippingIcon size={24} />,
          label: t("progressLogging.whichDay"),
        };
      case "startTime":
        return {
          icon: <WhiteClockIcon size={26} />,
          label: t("progressLogging.enterStartTime"),
        };
      case "recitationCount":
        return {
          icon: (
            <QuranImageIcon color={Colors.light.white} size={24} />
          ),
          label: t("progressLogging.addCompletion"),
        };
      default: {
        const durationIndex = parseDurationStepIndex(step);
        return {
          icon: <WhiteTimerIcon size={26} />,
          label: t("progressLogging.enterTimeSpent"),
        };
      }
    }
  };

  const renderStepContent = (step: QuranRecitationStepId) => {
    switch (step) {
      case "date":
        return (
          <DateStep
            dateLabel={dateLabel}
            selectedDate={selectedDate}
            todayString={todayString}
            onShiftDate={shiftDate}
            styles={styles}
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
            styles={styles}
          />
        );
      case "recitationCount":
        return (
          <RecitationCompletionStep
            target={targetQuantity}
            alreadyLogged={alreadyLoggedForSelectedDate}
            sessionCount={recitationCount}
            dayType={completionDayType}
            onChangeSessionCount={setRecitationCount}
          />
        );
      default: {
        const durationIndex = parseDurationStepIndex(step);
        const duration = durations[(durationIndex ?? 1) - 1];
        if (!duration) return null;

        return (
          <View>
            {recitationCountForSteps > 1 ? (
              <Text style={styles.recitationProgressLabel}>
                {t("progressLogging.recitationProgressLabel", {
                  current: formatNumber(durationIndex ?? 1),
                  total: formatNumber(recitationCountForSteps),
                })}
              </Text>
            ) : null}
            <DurationStep
              durationHours={duration.hours}
              setDurationHours={(value) =>
                updateDuration((durationIndex ?? 1) - 1, "hours", value)
              }
              durationMinutes={duration.minutes}
              setDurationMinutes={(value) =>
                updateDuration((durationIndex ?? 1) - 1, "minutes", value)
              }
              styles={styles}
            />
          </View>
        );
      }
    }
  };

  const stepHeader = getStepHeader(currentStep);
  const showOverlay = flowMode === "active" && !suppressOverlay;

  const flowCard = (
    <View style={styles.flowCardLayer}>
      <FlowCard
        headerIcon={stepHeader.icon}
        headerLabel={stepHeader.label}
        onBack={handleBack}
        onForward={handleForward}
        onConfirm={handleConfirm}
        canGoForward={canGoForward}
        canGoBack={!isLogging && stepIndex > 0}
        canConfirm={!isLogging && isLastStep && isStepValid(currentStep)}
        styles={styles}
        style={styles.inPlaceFlowCard}
      >
        {renderStepContent(currentStep)}
      </FlowCard>
    </View>
  );

  if (embedded) {
    return flowCard;
  }

  const flowLayer = (
    <>
      {showOverlay && <Pressable style={styles.backdrop} />}
      {showOverlay && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={resetFlow}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={20} color={Colors.light.white} />
        </TouchableOpacity>
      )}

      {flowMode === "collapsed" && !hideCollapsedSummary ? (
        <View style={styles.summaryCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {t("progressLogging.inProgress")}
            </Text>
          </View>

          <View style={styles.summaryBody}>
            <View style={styles.summaryIconCircle}>
              <MaterialCommunityIcons
                name="book-open-page-variant"
                size={20}
                color={Colors.light.white}
              />
            </View>
            <View style={styles.summaryTextBlock}>
              <Text style={styles.summaryTitle}>
                {t(summaryTitleKey, {
                  surah: config.surahName,
                  quantity: formatNumber(config.quantity),
                  frequency: t(frequencyLabelKey),
                  defaultValue: goalData.title,
                })}
              </Text>
              <Text style={styles.summarySubtext}>
                <Text style={styles.summarySubtextRegular}>
                  ({t("progressLogging.total")}{" "}
                </Text>
                <Text style={styles.summarySubtextBold}>
                  {formatNumber(config.cycleTotal)}{" "}
                </Text>
                <Text style={styles.summarySubtextRegular}>
                  {t("progressLogging.unitRecitations")})
                </Text>
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setFlowMode("active")}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={22} color={Colors.light.white} />
          </TouchableOpacity>
        </View>
      ) : (
        flowCard
      )}
    </>
  );

  const wrapperStyle = hideCollapsedSummary
    ? flowMode === "active"
      ? styles.activeSection
      : undefined
    : [styles.section, flowMode === "active" && styles.activeSection];

  return (
    <View style={wrapperStyle}>
      {!hideCollapsedSummary ? (
        <Text style={styles.sectionTitle}>
          {t("progressLogging.myProgress")}
        </Text>
      ) : null}
      <View style={styles.cardAnchor}>{flowLayer}</View>
    </View>
  );
}
