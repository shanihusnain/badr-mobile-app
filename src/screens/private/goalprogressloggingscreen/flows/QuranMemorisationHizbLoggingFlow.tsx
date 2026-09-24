import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import moment from "moment-hijri";
import { Colors } from "@/constants/theme";
import { useLogQuranMemorisationHizbGoal } from "@/src/api/mutations/useLogQuranMemorisationHizbGoal";
import { GoalData } from "../../home/components/goalsData";
import { DateStep } from "../components/DateStep";
import {
  formatProgressLoggingDateLabel,
  getQuranLoggingSelectableDateBounds,
} from "../progressLoggingConfig";
import { DurationStep, StartTimeStep, getCurrentStartTimeParts } from "../components/TimePickerSteps";
import { FlowCard } from "../components/FlowCard";
import { MemorisationHizbAyahCountStep } from "../components/MemorisationHizbAyahCountStep";
import { MemorisationHizbSelectionStep } from "../components/MemorisationHizbSelectionStep";
import { styles } from "../components/DailyProgressLogging.styles";
import { QuranIconForSlider } from "@/assets/icons/QuranIconForSlider";
import {
  CalendarFlippingIcon,
  WhiteClockIcon,
  WhiteTimerIcon,
} from "@/assets/icons";
import { getQuranMemorisationHizbFlowDefinition } from "../loggingFlowRegistry";
import {
  getMemorizedHizbAyahCount,
  getHizbMemorisationProgressPercent,
  isHizbFullyMemorized,
} from "../quranMemorisationHizbData";
import {
  buildHizbMemorisationSteps,
  getHizbAyahsMemorizedFromRange,
  getMemorisationTargetConfigForHizb,
  getNextHizbMemorisationAyah,
  isValidHizbMemorisationAyahRange,
  toMemorisationTargetConfigFromHizbGoal,
  type QuranMemorisationHizbStepId,
} from "../quranMemorisationHizbTarget";
import {
  getHizbMemorisationGoals,
  type HizbMemorisationGoal,
  type MemorisationHizbFilterId,
} from "../quranMemorisationHizbGoals";
import { useOptionalMemorisationHizbContext } from "../memorisationHizbContext";
import { useOptionalQuranGoalFrameContext } from "../quranGoalFrameContext";
import {
  getQuranFrameCycleEnd,
  getQuranFrameCycleStart,
} from "@/src/utils/quranGoalFrameMap";
import {
  isValidStartTime,
  isValidTimeSpent,
} from "../quranRecitationTarget";
import type { QuranMemorisationHizbLogEntry } from "../types";

type FlowMode = "collapsed" | "active";

type Props = {
  goalData: GoalData;
  preselectedHizbId?: MemorisationHizbFilterId;
  /** Prefer this when carousel/frame provides the active hizb (API itemNumber ids). */
  activeHizbGoal?: HizbMemorisationGoal | null;
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
  activeHizbGoal = null,
  hideCollapsedSummary = false,
  embedded = false,
  suppressOverlay = false,
  flowMode: controlledFlowMode,
  onFlowModeChange,
  onLogComplete,
}: Props) {
  const { t } = useTranslation();
  const memorisationContext = useOptionalMemorisationHizbContext();
  const quranFrame = useOptionalQuranGoalFrameContext();
  const { mutateAsync: logMemorisationHizb, isPending: isLogging } =
    useLogQuranMemorisationHizbGoal();
  const flowDefinition = useMemo(
    () => getQuranMemorisationHizbFlowDefinition(goalData.id),
    [goalData.id],
  );

  const includeHizbSelection = preselectedHizbId === "all";
  const goals = useMemo(
    () => memorisationContext?.goals ?? getHizbMemorisationGoals(),
    [memorisationContext?.goals],
  );
  const incompleteGoals = useMemo(
    () => goals.filter((goal) => !goal.completed),
    [goals],
  );

  const initialHizbId =
    preselectedHizbId !== "all"
      ? preselectedHizbId
      : (incompleteGoals[0]?.id ?? "");

  const [selectedHizbId, setSelectedHizbId] = useState(initialHizbId);
  const config = useMemo(() => {
    const fromActive =
      activeHizbGoal && activeHizbGoal.id === selectedHizbId
        ? toMemorisationTargetConfigFromHizbGoal(activeHizbGoal)
        : null;
    if (fromActive) return fromActive;

    const fromList = goals.find((goal) => goal.id === selectedHizbId);
    if (fromList) return toMemorisationTargetConfigFromHizbGoal(fromList);

    return getMemorisationTargetConfigForHizb(selectedHizbId, activeHizbGoal);
  }, [activeHizbGoal, goals, selectedHizbId]);

  const hizbId = config?.hizbId ?? "";
  const totalAyahs = config?.totalAyahs ?? 0;
  const memorizedAyahs = Math.max(
    config?.memorizedAyahs ?? 0,
    hizbId ? getMemorizedHizbAyahCount(hizbId) : 0,
  );
  const remainingAyahs = Math.max(0, totalAyahs - memorizedAyahs);
  const minStartAyah = getNextHizbMemorisationAyah(hizbId, memorizedAyahs);
  const itemNumber = useMemo(() => {
    const fromActive =
      activeHizbGoal?.id === selectedHizbId
        ? activeHizbGoal.itemNumber
        : undefined;
    const fromList = goals.find(
      (goal) => goal.id === selectedHizbId,
    )?.itemNumber;
    const fromId = Number(hizbId);
    return fromActive ?? fromList ?? (Number.isFinite(fromId) ? fromId : NaN);
  }, [activeHizbGoal, goals, hizbId, selectedHizbId]);

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
  const [startAyah, setStartAyah] = useState(minStartAyah);
  const [endAyah, setEndAyah] = useState(() =>
    Math.max(minStartAyah, totalAyahs || minStartAyah),
  );
  const [durationHours, setDurationHours] = useState("0");
  const [durationMinutes, setDurationMinutes] = useState("0");

  const todayString = toDateString(new Date());
  const cycleStart = quranFrame?.frame
    ? getQuranFrameCycleStart(quranFrame.frame) || undefined
    : undefined;
  const cycleEnd = quranFrame?.frame
    ? getQuranFrameCycleEnd(quranFrame.frame) || undefined
    : undefined;
  const { minSelectableDate, maxSelectableDate } =
    getQuranLoggingSelectableDateBounds(cycleStart, cycleEnd, todayString);

  useEffect(() => {
    setSelectedDate((prev) => {
      if (minSelectableDate && prev < minSelectableDate) return minSelectableDate;
      if (prev > maxSelectableDate) return maxSelectableDate;
      return prev;
    });
  }, [minSelectableDate, maxSelectableDate]);

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
    const nextStartAyah = getNextHizbMemorisationAyah(hizbId, memorizedAyahs);
    setStartAyah(nextStartAyah);
    setEndAyah(Math.max(nextStartAyah, totalAyahs || nextStartAyah));
  }, [hizbId, memorizedAyahs, totalAyahs]);

  const resetFlow = useCallback(() => {
    setFlowMode("collapsed");
    setStepIndex(0);
    const bounds = getQuranLoggingSelectableDateBounds(
      quranFrame?.frame
        ? getQuranFrameCycleStart(quranFrame.frame) || undefined
        : undefined,
      quranFrame?.frame
        ? getQuranFrameCycleEnd(quranFrame.frame) || undefined
        : undefined,
      toDateString(new Date()),
    );
    setSelectedDate(bounds.maxSelectableDate);
    const now = getCurrentStartTimeParts();
    setStartHour(now.hour);
    setStartMinute(now.minute);
    setStartPeriod(now.period);
    setIsPeriodDropdownOpen(false);
    const nextStartAyah = getNextHizbMemorisationAyah(
      preselectedHizbId !== "all" ? preselectedHizbId : selectedHizbId,
      memorizedAyahs,
    );
    setStartAyah(nextStartAyah);
    setEndAyah(Math.max(nextStartAyah, totalAyahs || nextStartAyah));
    setDurationHours("0");
    setDurationMinutes("0");
    if (preselectedHizbId !== "all") {
      setSelectedHizbId(preselectedHizbId);
    } else {
      setSelectedHizbId(incompleteGoals[0]?.id ?? "");
    }
  }, [
    incompleteGoals,
    memorizedAyahs,
    preselectedHizbId,
    quranFrame?.frame,
    selectedHizbId,
    setFlowMode,
    totalAyahs,
  ]);

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
          return isValidHizbMemorisationAyahRange(hizbId, startAyah, endAyah, {
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
      hizbId,
      memorizedAyahs,
      remainingAyahs,
      selectedDate,
      selectedHizbId,
      startAyah,
      startHour,
      startMinute,
      startPeriod,
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
    t("progressLogging.tomorrow"),
  );

  const shiftDate = (direction: -1 | 1) => {
    const next = moment(selectedDate, "YYYY-MM-DD")
      .add(direction, "days")
      .format("YYYY-MM-DD");
    if (minSelectableDate && direction === -1 && next < minSelectableDate)
      return;
    if (direction === 1 && next > maxSelectableDate) return;
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
    if (!isLastStep) return;

    if (!steps.every((step) => isStepValid(step))) return;
    if (!Number.isFinite(itemNumber) || itemNumber < 1) return;

    const run = async () => {
      const ayahsMemorizedToday = getHizbAyahsMemorizedFromRange(
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
        await logMemorisationHizb({
          quranGoalType: "MEMORIZATION_HIZB",
          date: selectedDate,
          sessionStartTime,
          durationMinutes: durationTotalMinutes,
          itemType: "HIZB",
          itemNumber,
          fromAyah: startAyah,
          toAyah: endAyah,
        });
        await quranFrame?.refetch();
        memorisationContext?.bumpRefresh();

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
          memorizedAyahs: memorizedAyahs + ayahsMemorizedToday,
          progressPercentage: getHizbMemorisationProgressPercent(hizbId),
          completed: isHizbFullyMemorized(hizbId),
        });
        resetFlow();
      } catch {
        // Mutation onError already shows toast.
      }
    };

    void run();
  };

  const getStepHeader = (step: QuranMemorisationHizbStepId) => {
    switch (step) {
      case "hizb":
        return {
          icon: (
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={24}
              color={Colors.light.white}
            />
          ),
          label: t("progressLogging.memorisationSelectHizb"),
        };
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
      case "ayahCount":
        return {
          icon: (
            <QuranIconForSlider size={24} Color={Colors.light.white} />
          ),
          label: t("progressLogging.selectAyatRange"),
        };
      case "timeSpent":
        return {
          icon: <WhiteTimerIcon size={26} />,
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
            minSelectableDate={minSelectableDate}
            maxSelectableDate={maxSelectableDate}
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
          <MemorisationHizbAyahCountStep
            hizbId={hizbId}
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
        canGoBack={stepIndex > 0}
        canConfirm={
          isLastStep &&
          !isLogging &&
          steps.every((step) => isStepValid(step))
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
