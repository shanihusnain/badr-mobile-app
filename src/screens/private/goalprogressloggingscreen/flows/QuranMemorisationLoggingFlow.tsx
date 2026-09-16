import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import moment from "moment-hijri";
import { Colors } from "@/constants/theme";
import { useLogQuranMemorisationSurahGoal } from "@/src/api/mutations/useLogQuranMemorisationSurahGoal";
import { GoalData } from "../../home/components/goalsData";
import { DateStep } from "../components/DateStep";
import { formatProgressLoggingDateLabel } from "../progressLoggingConfig";
import { DurationStep, StartTimeStep } from "../components/TimePickerSteps";
import { FlowCard } from "../components/FlowCard";
import { MemorisationAyahCountStep } from "../components/MemorisationAyahCountStep";
import { MemorisationSurahSelectionStep } from "../components/MemorisationSurahSelectionStep";
import { styles } from "../components/DailyProgressLogging.styles";
import { getQuranMemorisationFlowDefinition } from "../loggingFlowRegistry";
import {
  getMemorizedAyahCount,
  getSurahMemorisationProgressPercent,
  isSurahFullyMemorized,
} from "../quranMemorisationSurahData";
import {
  buildMemorisationSteps,
  getAyahsMemorizedFromRange,
  getMemorisationTargetConfigForSurah,
  getNextMemorisationAyah,
  isValidMemorisationAyahRange,
  toMemorisationTargetConfigFromGoal,
  type QuranMemorisationStepId,
} from "../quranMemorisationTarget";
import {
  getSurahMemorisationGoals,
  type MemorisationSurahFilterId,
  type SurahMemorisationGoal,
} from "../quranMemorisationSurahGoals";
import { useOptionalMemorisationSurahContext } from "../memorisationSurahContext";
import { useOptionalQuranGoalFrameContext } from "../quranGoalFrameContext";
import { isValidStartTime, isValidTimeSpent } from "../quranRecitationTarget";
import type { QuranMemorisationLogEntry } from "../types";

type FlowMode = "collapsed" | "active";

type Props = {
  goalData: GoalData;
  preselectedSurahId?: MemorisationSurahFilterId;
  /** Prefer this when carousel/frame provides the active surah (API itemNumber ids). */
  activeSurahGoal?: SurahMemorisationGoal | null;
  hideCollapsedSummary?: boolean;
  embedded?: boolean;
  suppressOverlay?: boolean;
  flowMode?: FlowMode;
  onFlowModeChange?: (mode: FlowMode) => void;
  onLogComplete?: (entry: QuranMemorisationLogEntry) => void;
};

const toDateString = (date: Date) => moment(date).format("YYYY-MM-DD");

export default function QuranMemorisationLoggingFlow({
  goalData,
  preselectedSurahId = "all",
  activeSurahGoal = null,
  hideCollapsedSummary = false,
  embedded = false,
  suppressOverlay = false,
  flowMode: controlledFlowMode,
  onFlowModeChange,
  onLogComplete,
}: Props) {
  const { t } = useTranslation();
  const memorisationContext = useOptionalMemorisationSurahContext();
  const quranFrame = useOptionalQuranGoalFrameContext();
  const { mutateAsync: logMemorisationSurah, isPending: isLogging } =
    useLogQuranMemorisationSurahGoal();
  const flowDefinition = useMemo(
    () => getQuranMemorisationFlowDefinition(goalData.id),
    [goalData.id],
  );

  const includeSurahSelection = preselectedSurahId === "all";
  const goals = useMemo(
    () => memorisationContext?.goals ?? getSurahMemorisationGoals(),
    [memorisationContext?.goals],
  );
  const incompleteGoals = useMemo(
    () => goals.filter((goal) => !goal.completed),
    [goals],
  );

  const initialSurahId =
    preselectedSurahId !== "all"
      ? preselectedSurahId
      : (incompleteGoals[0]?.id ?? "");

  const [selectedSurahId, setSelectedSurahId] = useState(initialSurahId);
  const config = useMemo(() => {
    const fromActive =
      activeSurahGoal && activeSurahGoal.id === selectedSurahId
        ? toMemorisationTargetConfigFromGoal(activeSurahGoal)
        : null;
    if (fromActive) return fromActive;

    const fromList = goals.find((goal) => goal.id === selectedSurahId);
    if (fromList) return toMemorisationTargetConfigFromGoal(fromList);

    return getMemorisationTargetConfigForSurah(
      selectedSurahId,
      activeSurahGoal,
    );
  }, [activeSurahGoal, goals, selectedSurahId]);

  const surahId = config?.surahId ?? "";
  const totalAyahs = config?.totalAyahs ?? 0;
  const memorizedAyahs =
    config?.memorizedAyahs != null
      ? config.memorizedAyahs
      : getMemorizedAyahCount(surahId);
  const remainingAyahs = Math.max(0, totalAyahs - memorizedAyahs);
  const minStartAyah = getNextMemorisationAyah(surahId, memorizedAyahs);
  const itemNumber = useMemo(() => {
    const fromActive =
      activeSurahGoal?.id === selectedSurahId
        ? activeSurahGoal.itemNumber
        : undefined;
    const fromList = goals.find(
      (goal) => goal.id === selectedSurahId,
    )?.itemNumber;
    const fromId = Number(surahId);
    return fromActive ?? fromList ?? (Number.isFinite(fromId) ? fromId : NaN);
  }, [activeSurahGoal, goals, selectedSurahId, surahId]);

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
  const [endAyah, setEndAyah] = useState(() =>
    Math.max(minStartAyah, totalAyahs || minStartAyah),
  );
  const [durationHours, setDurationHours] = useState("0");
  const [durationMinutes, setDurationMinutes] = useState("10");

  const todayString = toDateString(new Date());
  const steps = useMemo(
    () => buildMemorisationSteps(includeSurahSelection),
    [includeSurahSelection],
  );
  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  useEffect(() => {
    if (preselectedSurahId !== "all") {
      setSelectedSurahId(preselectedSurahId);
      return;
    }
    if (!incompleteGoals.some((goal) => goal.id === selectedSurahId)) {
      setSelectedSurahId(incompleteGoals[0]?.id ?? "");
    }
  }, [incompleteGoals, preselectedSurahId, selectedSurahId]);

  useEffect(() => {
    const nextStartAyah = getNextMemorisationAyah(surahId, memorizedAyahs);
    const nextEndAyah = Math.max(nextStartAyah, totalAyahs || nextStartAyah);
    setStartAyah(nextStartAyah);
    setEndAyah(nextEndAyah);
  }, [memorizedAyahs, surahId, totalAyahs]);

  const resetFlow = useCallback(() => {
    setFlowMode("collapsed");
    setStepIndex(0);
    setSelectedDate(toDateString(new Date()));
    setStartHour("06");
    setStartMinute("15");
    setStartPeriod("am");
    setIsPeriodDropdownOpen(false);
    const nextStartAyah = getNextMemorisationAyah(
      preselectedSurahId !== "all" ? preselectedSurahId : selectedSurahId,
      memorizedAyahs,
    );
    const nextEndAyah = Math.max(nextStartAyah, totalAyahs || nextStartAyah);
    setStartAyah(nextStartAyah);
    setEndAyah(nextEndAyah);
    setDurationHours("0");
    setDurationMinutes("10");
    if (preselectedSurahId !== "all") {
      setSelectedSurahId(preselectedSurahId);
    } else {
      setSelectedSurahId(incompleteGoals[0]?.id ?? "");
    }
  }, [
    incompleteGoals,
    memorizedAyahs,
    preselectedSurahId,
    selectedSurahId,
    setFlowMode,
    totalAyahs,
  ]);

  const isStepValid = useCallback(
    (step: QuranMemorisationStepId) => {
      switch (step) {
        case "surah":
          return Boolean(selectedSurahId) && remainingAyahs > 0;
        case "date":
          return Boolean(selectedDate);
        case "startTime":
          return isValidStartTime(startHour, startMinute, startPeriod);
        case "ayahCount":
          return isValidMemorisationAyahRange(surahId, startAyah, endAyah, {
            totalAyahs,
            memorizedAyahs,
          });
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
      memorizedAyahs,
      remainingAyahs,
      selectedDate,
      selectedSurahId,
      startAyah,
      startHour,
      startMinute,
      startPeriod,
      surahId,
      totalAyahs,
    ],
  );

  const canGoForward = !isLastStep && isStepValid(currentStep) && !isLogging;

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
    if (isLogging) return;
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

    if (!steps.every((step) => isStepValid(step))) return;
    if (!Number.isFinite(itemNumber) || itemNumber < 1) return;

    const run = async () => {
      const ayahsMemorizedToday = getAyahsMemorizedFromRange(
        startAyah,
        endAyah,
      );
      const hours = Number.parseInt(durationHours || "0", 10) || 0;
      const minutes = Number.parseInt(durationMinutes || "0", 10) || 0;
      const durationTotalMinutes = hours * 60 + minutes;
      if (durationTotalMinutes < 1) return;

      const startTime = `${startHour}:${startMinute} ${startPeriod}`;
      const sessionStartTime = formatSessionStartTimeForApi();

      try {
        await logMemorisationSurah({
          quranGoalType: "MEMORIZATION_SURAH",
          date: selectedDate,
          sessionStartTime,
          durationMinutes: durationTotalMinutes,
          itemType: "SURAH",
          itemNumber,
          fromAyah: startAyah,
          toAyah: endAyah,
        });
        await quranFrame?.refetch();
        memorisationContext?.bumpRefresh();

        onLogComplete?.({
          type: "quran-memorisation",
          goalType: "memorization",
          trackingType: "surah",
          goalId: flowDefinition.goalId,
          surahId,
          surahName: config.surahName,
          totalAyahs,
          date: selectedDate,
          startTime,
          startAyah,
          endAyah,
          ayahsMemorizedToday,
          hours,
          minutes,
          durationLabel: `${hours}h ${minutes}m`,
          memorizedAyahs: memorizedAyahs + ayahsMemorizedToday,
          progressPercentage: getSurahMemorisationProgressPercent(surahId),
          completed: isSurahFullyMemorized(surahId),
        });
        resetFlow();
      } catch {
        // Mutation onError already shows toast.
      }
    };

    void run();
  };

  const getStepHeader = (step: QuranMemorisationStepId) => {
    switch (step) {
      case "surah":
        return {
          icon: (
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={16}
              color={Colors.light.white}
            />
          ),
          label: t("progressLogging.memorisationSelectSurah"),
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

  const renderStepContent = (step: QuranMemorisationStepId) => {
    switch (step) {
      case "surah":
        return (
          <MemorisationSurahSelectionStep
            goals={goals}
            selectedSurahId={selectedSurahId}
            onSelectSurah={setSelectedSurahId}
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
            surahName={config.surahName}
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
        contentStyle={isAyahRangeStep ? styles.flowContentAyahRange : undefined}
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
        {showOverlay && (
          <Pressable style={styles.backdrop} onPress={resetFlow} />
        )}
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
