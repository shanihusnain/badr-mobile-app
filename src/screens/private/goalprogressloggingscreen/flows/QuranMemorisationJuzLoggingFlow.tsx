import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import moment from "moment-hijri";
import { Colors } from "@/constants/theme";
import { GoalData } from "../../home/components/goalsData";
import { DurationStep, StartTimeStep, getCurrentStartTimeParts } from "../components/TimePickerSteps";
import { FlowCard } from "../components/FlowCard";
import { MemorisationJuzAyahCountStep } from "../components/MemorisationJuzAyahCountStep";
import { MemorisationJuzSelectionStep } from "../components/MemorisationJuzSelectionStep";
import { styles } from "../components/DailyProgressLogging.styles";
import { QuranIconForSlider } from "@/assets/icons/QuranIconForSlider";
import { WhiteClockIcon, WhiteTimerIcon } from "@/assets/icons";
import { getQuranMemorisationJuzFlowDefinition } from "../loggingFlowRegistry";
import {
  appendJuzMemorisationLog,
  buildJuzMemorisationLogFromEntry,
  getMemorizedJuzAyahCount,
  getRemainingJuzAyahCount,
  getJuzMemorisationProgressPercent,
  isJuzFullyMemorized,
} from "../quranMemorisationJuzData";
import { invalidateJuzMemorisationPastAchievementCache } from "../quranMemorisationJuzPastAchievementData";
import {
  buildJuzMemorisationSteps,
  getJuzAyahsMemorizedFromRange,
  getMemorisationTargetConfigForJuz,
  getNextJuzMemorisationAyah,
  isValidJuzMemorisationAyahRange,
  isValidTimeSpent,
  type QuranMemorisationJuzStepId,
} from "../quranMemorisationJuzTarget";
import {
  getJuzMemorisationGoals,
  type MemorisationJuzFilterId,
} from "../quranMemorisationJuzGoals";
import { isValidStartTime } from "../quranRecitationTarget";
import type { QuranMemorisationJuzLogEntry } from "../types";

type FlowMode = "collapsed" | "active";

type Props = {
  goalData: GoalData;
  preselectedJuzId?: MemorisationJuzFilterId;
  hideCollapsedSummary?: boolean;
  embedded?: boolean;
  suppressOverlay?: boolean;
  flowMode?: FlowMode;
  onFlowModeChange?: (mode: FlowMode) => void;
  onLogComplete?: (entry: QuranMemorisationJuzLogEntry) => void;
};

const toDateString = (date: Date) => moment(date).format("YYYY-MM-DD");

export default function QuranMemorisationJuzLoggingFlow({
  goalData,
  preselectedJuzId = "all",
  hideCollapsedSummary = false,
  embedded = false,
  suppressOverlay = false,
  flowMode: controlledFlowMode,
  onFlowModeChange,
  onLogComplete,
}: Props) {
  const { t } = useTranslation();
  const flowDefinition = useMemo(
    () => getQuranMemorisationJuzFlowDefinition(goalData.id),
    [goalData.id],
  );

  const includeJuzSelection = preselectedJuzId === "all";
  const goals = useMemo(() => getJuzMemorisationGoals(), []);
  const incompleteGoals = useMemo(
    () => goals.filter((goal) => !goal.completed),
    [goals],
  );

  const initialJuzId =
    preselectedJuzId !== "all"
      ? preselectedJuzId
      : (incompleteGoals[0]?.id ?? "");

  const [selectedJuzId, setSelectedJuzId] = useState(initialJuzId);
  const config = useMemo(
    () => getMemorisationTargetConfigForJuz(selectedJuzId),
    [selectedJuzId],
  );

  const juzId = config?.juzId ?? "";
  const totalAyahs = config?.totalAyahs ?? 0;
  const juzNumber = config?.juzNumber ?? 1;
  const remainingAyahs = getRemainingJuzAyahCount(juzId);
  const minStartAyah = getNextJuzMemorisationAyah(juzId);

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
  const initialStartTime = getCurrentStartTimeParts();
  const [startHour, setStartHour] = useState(initialStartTime.hour);
  const [startMinute, setStartMinute] = useState(initialStartTime.minute);
  const [startPeriod, setStartPeriod] = useState<"am" | "pm">(
    initialStartTime.period,
  );
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [startAyah, setStartAyah] = useState(minStartAyah);
  const [endAyah, setEndAyah] = useState(() =>
    Math.max(minStartAyah, totalAyahs || minStartAyah),
  );
  const [durationHours, setDurationHours] = useState("0");
  const [durationMinutes, setDurationMinutes] = useState("0");

  const todayString = toDateString(new Date());
  const selectedDate = todayString;
  const steps = useMemo(
    () => buildJuzMemorisationSteps(includeJuzSelection),
    [includeJuzSelection],
  );
  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  useEffect(() => {
    if (preselectedJuzId !== "all") {
      setSelectedJuzId(preselectedJuzId);
      return;
    }
    if (!incompleteGoals.some((goal) => goal.id === selectedJuzId)) {
      setSelectedJuzId(incompleteGoals[0]?.id ?? "");
    }
  }, [incompleteGoals, preselectedJuzId, selectedJuzId]);

  useEffect(() => {
    const nextStartAyah = getNextJuzMemorisationAyah(juzId);
    const nextEndAyah = Math.max(nextStartAyah, totalAyahs || nextStartAyah);
    setStartAyah(nextStartAyah);
    setEndAyah(nextEndAyah);
  }, [juzId, totalAyahs]);

  const resetFlow = useCallback(() => {
    setFlowMode("collapsed");
    setStepIndex(0);
    const nextStartAyah = getNextJuzMemorisationAyah(
      preselectedJuzId !== "all" ? preselectedJuzId : selectedJuzId,
    );
    const nextEndAyah = Math.max(nextStartAyah, totalAyahs || nextStartAyah);
    setStartAyah(nextStartAyah);
    setEndAyah(nextEndAyah);
    const now = getCurrentStartTimeParts();
    setStartHour(now.hour);
    setStartMinute(now.minute);
    setStartPeriod(now.period);
    setIsPeriodDropdownOpen(false);
    setDurationHours("0");
    setDurationMinutes("0");
    if (preselectedJuzId !== "all") {
      setSelectedJuzId(preselectedJuzId);
    } else {
      setSelectedJuzId(incompleteGoals[0]?.id ?? "");
    }
  }, [
    incompleteGoals,
    preselectedJuzId,
    selectedJuzId,
    setFlowMode,
    totalAyahs,
  ]);

  const isStepValid = useCallback(
    (step: QuranMemorisationJuzStepId) => {
      switch (step) {
        case "juz":
          return Boolean(selectedJuzId) && remainingAyahs > 0;
        case "ayahCount":
          return isValidJuzMemorisationAyahRange(juzId, startAyah, endAyah);
        case "startTime":
          return isValidStartTime(startHour, startMinute, startPeriod);
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
      juzId,
      remainingAyahs,
      selectedJuzId,
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
    if (!isLastStep) return;

    if (!steps.every((step) => isStepValid(step))) return;

    const start = Math.round(startAyah);
    const end = Math.round(endAyah);
    const count = getJuzAyahsMemorizedFromRange(start, end);
    const startTime = `${startHour}:${startMinute} ${startPeriod}`;
    const hours = Number.parseInt(durationHours || "0", 10) || 0;
    const minutes = Number.parseInt(durationMinutes || "0", 10) || 0;
    const timeSpentMinutes = hours * 60 + minutes;

    appendJuzMemorisationLog(
      buildJuzMemorisationLogFromEntry({
        juzId,
        date: selectedDate,
        startAyah: start,
        endAyah: end,
        ayahsMemorizedToday: count,
        startTime,
        timeSpentMinutes,
        hours,
        minutes,
      }),
    );
    invalidateJuzMemorisationPastAchievementCache();

    onLogComplete?.({
      type: "quran-memorisation",
      goalType: "memorization",
      trackingType: "juz",
      goalId: flowDefinition.goalId,
      juzId,
      juzName: config.juzName,
      juzNumber: config.juzNumber,
      totalAyahs,
      date: selectedDate,
      startTime,
      startAyah: start,
      endAyah: end,
      ayahsMemorizedToday: count,
      timeSpentMinutes,
      hours,
      minutes,
      durationLabel: `${hours}h ${minutes}m`,
      memorizedAyahs: getMemorizedJuzAyahCount(juzId),
      progressPercentage: getJuzMemorisationProgressPercent(juzId),
      completed: isJuzFullyMemorized(juzId),
    });
    resetFlow();
  };

  const getStepHeader = (step: QuranMemorisationJuzStepId) => {
    switch (step) {
      case "juz":
        return {
          icon: (
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={24}
              color={Colors.light.white}
            />
          ),
          label: t("progressLogging.memorisationSelectJuz"),
        };
      case "ayahCount":
        return {
          icon: (
            <QuranIconForSlider size={24} Color={Colors.light.white} />
          ),
          label: t("progressLogging.selectAyatRange"),
        };
      case "startTime":
        return {
          icon: <WhiteClockIcon size={26} />,
          label: t("progressLogging.enterStartTime"),
        };
      case "timeSpent":
        return {
          icon: <WhiteTimerIcon size={26} />,
          label: t("progressLogging.enterTimeSpent"),
        };
    }
  };

  const renderStepContent = (step: QuranMemorisationJuzStepId) => {
    switch (step) {
      case "juz":
        return (
          <MemorisationJuzSelectionStep
            goals={goals}
            selectedJuzId={selectedJuzId}
            onSelectJuz={setSelectedJuzId}
            styles={styles}
          />
        );
      case "ayahCount":
        return (
          <MemorisationJuzAyahCountStep
            juzName={config.juzName}
            juzNumber={juzNumber}
            totalAyahs={totalAyahs}
            minStartAyah={minStartAyah}
            startAyah={startAyah}
            endAyah={endAyah}
            onChangeStartAyah={setStartAyah}
            onChangeEndAyah={setEndAyah}
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
        canGoBack={stepIndex > 0}
        canConfirm={
          isLastStep && steps.every((step) => isStepValid(step))
        }
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
        {flowMode === "collapsed" && !hideCollapsedSummary ? null : flowCard}
      </View>
    </View>
  );
}
