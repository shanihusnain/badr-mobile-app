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
import { DurationStep, StartTimeStep } from "../components/TimePickerSteps";
import { RecitationCountStep } from "../components/RecitationCountStep";
import { FlowCard } from "../components/FlowCard";
import { styles } from "../components/DailyProgressLogging.styles";
import { getQuranRecitationFlowDefinition } from "../loggingFlowRegistry";
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
  const [startHour, setStartHour] = useState("06");
  const [startMinute, setStartMinute] = useState("15");
  const [startPeriod, setStartPeriod] = useState<"am" | "pm">("am");
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [recitationCount, setRecitationCount] = useState(1);
  const [committedRecitationCount, setCommittedRecitationCount] = useState(1);
  const [durations, setDurations] = useState<RecitationDurationValue[]>(
    createDefaultDurations(1),
  );

  const todayString = toDateString(new Date());
  const recitationCountForSteps = getRecitationCountForSteps(
    targetQuantity,
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
        next.push({ hours: "0", minutes: "10" });
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

  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const resetFlow = useCallback(() => {
    setFlowMode("collapsed");
    setStepIndex(0);
    setSelectedDate(toDateString(new Date()));
    setStartHour("06");
    setStartMinute("15");
    setStartPeriod("am");
    setIsPeriodDropdownOpen(false);
    setRecitationCount(1);
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
          return isValidRecitationCount(recitationCount, targetQuantity);
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
      targetQuantity,
      durations,
      recitationCount,
      selectedDate,
      startHour,
      startMinute,
      startPeriod,
    ],
  );

  const canGoForward = !isLastStep && isStepValid(currentStep);

  if (!flowDefinition || !config) return null;
  if (embedded && flowMode !== "active") return null;
  if (hideCollapsedSummary && !embedded && flowMode === "collapsed")
    return null;

  const dateLabel =
    selectedDate === todayString
      ? t("progressLogging.today")
      : moment(selectedDate, "YYYY-MM-DD").format("MMM DD");

  const frequencyLabelKey =
    config.frequency === "daily"
      ? "progressLogging.recitationFrequencyDaily"
      : "progressLogging.recitationFrequencyWeekly";

  const summaryTitleKey =
    config.frequency === "daily"
      ? "progressLogging.recitationGoalTitleDaily"
      : "progressLogging.recitationGoalTitleWeekly";

  const shiftDate = (direction: -1 | 1) => {
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
    setDurations((prev) =>
      prev.map((duration, durationIndex) =>
        durationIndex === index ? { ...duration, [field]: value } : duration,
      ),
    );
  };

  const handleConfirm = () => {
    if (!isLastStep) {
      handleForward();
      return;
    }

    if (!isValidStartTime(startHour, startMinute, startPeriod)) return;

    const resolvedCount = resolveLoggedRecitationCount(
      config.quantity,
      committedRecitationCount,
    );
    if (!isValidRecitationCount(resolvedCount, config.quantity)) return;

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
  };

  const handleBack = () => {
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
        targetQuantity,
        recitationCount,
      );
      console.log("nextCount", nextCount);
      setCommittedRecitationCount(nextCount);
      setDurations(createDefaultDurations(nextCount));
    }

    setStepIndex((index) => index + 1);
  };

  const getStepHeader = (step: QuranRecitationStepId) => {
    switch (step) {
      case "date":
        return {
          icon: (
            <Ionicons
              name="calendar-outline"
              size={15}
              color={Colors.light.white}
            />
          ),
          label: t("progressLogging.whichDay"),
        };
      case "startTime":
        return {
          icon: (
            <Ionicons
              name="time-outline"
              size={15}
              color={Colors.light.white}
            />
          ),
          label: t("progressLogging.enterStartTime"),
        };
      case "recitationCount":
        return {
          icon: (
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={16}
              color={Colors.light.white}
            />
          ),
          label: t("progressLogging.selectRecitationCount"),
        };
      default: {
        const durationIndex = parseDurationStepIndex(step);
        return {
          icon: (
            <MaterialCommunityIcons
              name="history"
              size={16}
              color={Colors.light.white}
            />
          ),
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
          <RecitationCountStep
            maxQuantity={config.quantity}
            count={recitationCount}
            onChangeCount={setRecitationCount}
            styles={styles}
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
      {showOverlay && <Pressable style={styles.backdrop} onPress={resetFlow} />}
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
