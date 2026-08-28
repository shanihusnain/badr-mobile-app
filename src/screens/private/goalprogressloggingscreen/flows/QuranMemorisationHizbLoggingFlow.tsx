import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import moment from "moment-hijri";
import { Colors } from "@/constants/theme";
import { GoalData } from "../../home/components/goalsData";
import { DateStep } from "../components/DateStep";
import { formatProgressLoggingDateLabel } from "../progressLoggingConfig";
import { DurationStep, StartTimeStep } from "../components/TimePickerSteps";
import { FlowCard } from "../components/FlowCard";
import { MemorisationAyahCountStep } from "../components/MemorisationAyahCountStep";
import { MemorisationHizbSelectionStep } from "../components/MemorisationHizbSelectionStep";
import { styles } from "../components/DailyProgressLogging.styles";
import { getQuranMemorisationHizbFlowDefinition } from "../loggingFlowRegistry";
import {
  appendHizbMemorisationLog,
  buildHizbMemorisationLogFromEntry,
  getMemorizedHizbAyahCount,
  getRemainingHizbAyahCount,
  getHizbMemorisationProgressPercent,
  isHizbFullyMemorized,
} from "../quranMemorisationHizbData";
import {
  buildHizbMemorisationSteps,
  getHizbAyahsMemorizedFromRange,
  getMemorisationTargetConfigForHizb,
  getNextHizbMemorisationAyah,
  isValidHizbMemorisationAyahRange,
  type QuranMemorisationHizbStepId,
} from "../quranMemorisationHizbTarget";
import {
  getHizbMemorisationGoals,
  type MemorisationHizbFilterId,
} from "../quranMemorisationHizbGoals";
import {
  isValidStartTime,
  isValidTimeSpent,
} from "../quranRecitationTarget";
import type { QuranMemorisationHizbLogEntry } from "../types";

type FlowMode = "collapsed" | "active";

type Props = {
  goalData: GoalData;
  preselectedHizbId?: MemorisationHizbFilterId;
  hideCollapsedSummary?: boolean;
  embedded?: boolean;
  suppressOverlay?: boolean;
  flowMode?: FlowMode;
  onFlowModeChange?: (mode: FlowMode) => void;
  onLogComplete?: (entry: QuranMemorisationHizbLogEntry) => void;
};

const toDateString = (date: Date) => moment(date).format("YYYY-MM-DD");

export default function QuranMemorisationHizbLoggingFlow({
  goalData,
  preselectedHizbId = "all",
  hideCollapsedSummary = false,
  embedded = false,
  suppressOverlay = false,
  flowMode: controlledFlowMode,
  onFlowModeChange,
  onLogComplete,
}: Props) {
  const { t } = useTranslation();
  const flowDefinition = useMemo(
    () => getQuranMemorisationHizbFlowDefinition(goalData.id),
    [goalData.id],
  );

  const includeHizbSelection = preselectedHizbId === "all";
  const goals = useMemo(() => getHizbMemorisationGoals(), []);
  const incompleteGoals = useMemo(
    () => goals.filter((goal) => !goal.completed),
    [goals],
  );

  const initialHizbId =
    preselectedHizbId !== "all"
      ? preselectedHizbId
      : (incompleteGoals[0]?.id ?? "");

  const [selectedHizbId, setSelectedHizbId] = useState(initialHizbId);
  const config = useMemo(
    () => getMemorisationTargetConfigForHizb(selectedHizbId),
    [selectedHizbId],
  );

  const hizbId = config?.hizbId ?? "";
  const totalAyahs = config?.totalAyahs ?? 0;
  const remainingAyahs = getRemainingHizbAyahCount(hizbId);
  const minStartAyah = getNextHizbMemorisationAyah(hizbId);

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
  const [startAyah, setStartAyah] = useState(minStartAyah);
  const [endAyah, setEndAyah] = useState(minStartAyah);
  const [durationHours, setDurationHours] = useState("0");
  const [durationMinutes, setDurationMinutes] = useState("10");

  const todayString = toDateString(new Date());
  const steps = useMemo(
    () => buildHizbMemorisationSteps(includeHizbSelection),
    [includeHizbSelection],
  );
  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  useEffect(() => {
    if (preselectedHizbId !== "all") {
      setSelectedHizbId(preselectedHizbId);
      return;
    }
    if (!incompleteGoals.some((goal) => goal.id === selectedHizbId)) {
      setSelectedHizbId(incompleteGoals[0]?.id ?? "");
    }
  }, [incompleteGoals, preselectedHizbId, selectedHizbId]);

  useEffect(() => {
    const nextStartAyah = getNextHizbMemorisationAyah(hizbId);
    setStartAyah(nextStartAyah);
    setEndAyah(nextStartAyah);
  }, [hizbId]);

  const resetFlow = useCallback(() => {
    setFlowMode("collapsed");
    setStepIndex(0);
    setSelectedDate(toDateString(new Date()));
    setStartHour("06");
    setStartMinute("15");
    setStartPeriod("am");
    setIsPeriodDropdownOpen(false);
    const nextStartAyah = getNextHizbMemorisationAyah(
      preselectedHizbId !== "all" ? preselectedHizbId : selectedHizbId,
    );
    setStartAyah(nextStartAyah);
    setEndAyah(nextStartAyah);
    setDurationHours("0");
    setDurationMinutes("10");
    if (preselectedHizbId !== "all") {
      setSelectedHizbId(preselectedHizbId);
    } else {
      setSelectedHizbId(incompleteGoals[0]?.id ?? "");
    }
  }, [incompleteGoals, preselectedHizbId, selectedHizbId, setFlowMode]);

  const isStepValid = useCallback(
    (step: QuranMemorisationHizbStepId) => {
      switch (step) {
        case "hizb":
          return Boolean(selectedHizbId) && remainingAyahs > 0;
        case "date":
          return Boolean(selectedDate);
        case "startTime":
          return isValidStartTime(startHour, startMinute, startPeriod);
        case "ayahCount":
          return isValidHizbMemorisationAyahRange(hizbId, startAyah, endAyah);
        case "timeSpent":
          return isValidTimeSpent(durationHours, durationMinutes);
        default:
          return false;
      }
    },
    [
      durationHours,
      durationMinutes,
      endAyah,
      hizbId,
      remainingAyahs,
      selectedDate,
      selectedHizbId,
      startAyah,
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

  const dateLabel = formatProgressLoggingDateLabel(
    selectedDate,
    todayString,
    t("progressLogging.today"),
  );

  const shiftDate = (direction: -1 | 1) => {
    const next = moment(selectedDate, "YYYY-MM-DD")
      .add(direction, "days")
      .format("YYYY-MM-DD");
    if (direction === 1 && next > todayString) return;
    setSelectedDate(next);
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
    setStepIndex((index) => index + 1);
  };

  const handleConfirm = () => {
    if (!isLastStep) {
      handleForward();
      return;
    }

    if (!steps.every((step) => isStepValid(step))) return;

    const ayahsMemorizedToday = getHizbAyahsMemorizedFromRange(
      startAyah,
      endAyah,
    );
    const hours = Number.parseInt(durationHours || "0", 10) || 0;
    const minutes = Number.parseInt(durationMinutes || "0", 10) || 0;
    const startTime = `${startHour}:${startMinute} ${startPeriod}`;

    appendHizbMemorisationLog(
      buildHizbMemorisationLogFromEntry({
        hizbId,
        date: selectedDate,
        ayahsMemorizedToday,
        startTime,
        hours,
        minutes,
        startAyah,
        endAyah,
      }),
    );

    onLogComplete?.({
      type: "quran-memorisation",
      goalType: "memorization",
      trackingType: "hizb",
      goalId: flowDefinition.goalId,
      hizbId,
      hizbName: config.hizbName,
      totalAyahs,
      date: selectedDate,
      startTime,
      startAyah,
      endAyah,
      ayahsMemorizedToday,
      hours,
      minutes,
      durationLabel: `${hours}h ${minutes}m`,
      memorizedAyahs: getMemorizedHizbAyahCount(hizbId),
      progressPercentage: getHizbMemorisationProgressPercent(hizbId),
      completed: isHizbFullyMemorized(hizbId),
    });
    resetFlow();
  };

  const getStepHeader = (step: QuranMemorisationHizbStepId) => {
    switch (step) {
      case "hizb":
        return {
          icon: (
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={16}
              color={Colors.light.white}
            />
          ),
          label: t("progressLogging.memorisationSelectHizb"),
        };
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
      case "ayahCount":
        return {
          icon: (
            <MaterialCommunityIcons
              name="format-list-numbered"
              size={16}
              color={Colors.light.white}
            />
          ),
          label: t("progressLogging.selectAyatRange"),
        };
      case "timeSpent":
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
  };

  const renderStepContent = (step: QuranMemorisationHizbStepId) => {
    switch (step) {
      case "hizb":
        return (
          <MemorisationHizbSelectionStep
            goals={goals}
            selectedHizbId={selectedHizbId}
            onSelectHizb={setSelectedHizbId}
            styles={styles}
          />
        );
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
      case "ayahCount":
        return (
          <MemorisationAyahCountStep
            surahName={config.hizbName}
            totalAyahs={totalAyahs}
            minStartAyah={minStartAyah}
            startAyah={startAyah}
            endAyah={endAyah}
            onChangeStartAyah={setStartAyah}
            onChangeEndAyah={setEndAyah}
            styles={styles}
          />
        );
      case "timeSpent":
        return (
          <DurationStep
            durationHours={durationHours}
            setDurationHours={setDurationHours}
            durationMinutes={durationMinutes}
            setDurationMinutes={setDurationMinutes}
            styles={styles}
          />
        );
    }
  };

  const stepHeader = getStepHeader(currentStep);
  const showOverlay = flowMode === "active" && !suppressOverlay;
  const isAyahRangeStep = currentStep === "ayahCount";

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
        contentStyle={
          isAyahRangeStep ? styles.flowContentAyahRange : undefined
        }
      >
        {renderStepContent(currentStep)}
      </FlowCard>
    </View>
  );

  if (embedded) {
    return flowCard;
  }

  return (
    <View
      style={[styles.section, flowMode === "active" && styles.activeSection]}
    >
      <View style={styles.cardAnchor}>
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
        {flowMode === "collapsed" && !hideCollapsedSummary ? null : flowCard}
      </View>
    </View>
  );
}
