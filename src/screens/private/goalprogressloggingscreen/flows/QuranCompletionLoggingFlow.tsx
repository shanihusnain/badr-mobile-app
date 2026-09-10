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
import { DurationStep, StartTimeStep } from "../components/TimePickerSteps";
import { FlowCard } from "../components/FlowCard";
import { CompletionTypeStep } from "../components/CompletionTypeStep";
import { JuzRangeStep } from "../components/JuzRangeStep";
import { JuzStepper } from "../components/JuzStepper";
import { QuranAyatRangeSlider } from "../components/QuranAyatRangeSlider";
import { styles } from "../components/DailyProgressLogging.styles";
import { getQuranCompletionFlowDefinition } from "../loggingFlowRegistry";
import { getJuzVerseCountFromMap } from "../quranJuzVerseMap";
import {
  buildCompletionSteps,
  clampJuz,
  createDefaultDuration,
  isValidAyatRange,
  isValidCompletionType,
  isValidJuzRange,
  isValidStartTime,
  isValidTimeSpent,
  type CompletionDurationValue,
  type CompletionType,
  type QuranCompletionStepId,
} from "../quranRecitationCompletionTarget";
import type { QuranCompletionLogEntry } from "../types";

type FlowMode = "collapsed" | "active";

type Props = {
  goalData: GoalData;
  hideCollapsedSummary?: boolean;
  embedded?: boolean;
  suppressOverlay?: boolean;
  flowMode?: FlowMode;
  onFlowModeChange?: (mode: FlowMode) => void;
  onLogComplete?: (entry: QuranCompletionLogEntry) => void;
};

const toDateString = (date: Date) => moment(date).format("YYYY-MM-DD");

export default function QuranCompletionLoggingFlow({
  goalData,
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
    () => getQuranCompletionFlowDefinition(goalData.id),
    [goalData.id],
  );

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
  const [completionType, setCompletionType] = useState<CompletionType>("full");
  const [committedCompletionType, setCommittedCompletionType] =
    useState<CompletionType>("full");
  const [fullStartJuz, setFullStartJuz] = useState(1);
  const [fullEndJuz, setFullEndJuz] = useState(1);
  const [partialJuz, setPartialJuz] = useState(1);
  const [startAyat, setStartAyat] = useState(1);
  const [endAyat, setEndAyat] = useState(1);
  const [fullDuration, setFullDuration] = useState<CompletionDurationValue>(
    createDefaultDuration(),
  );
  const [partialDuration, setPartialDuration] =
    useState<CompletionDurationValue>(createDefaultDuration());

  const todayString = toDateString(new Date());

  const steps = useMemo(
    () => buildCompletionSteps(committedCompletionType),
    [committedCompletionType],
  );

  useEffect(() => {
    setStepIndex((index) => Math.min(index, Math.max(steps.length - 1, 0)));
  }, [steps.length]);

  useEffect(() => {
    const maxAyat = getJuzVerseCountFromMap(partialJuz);
    setStartAyat((prev) => Math.min(Math.max(1, prev), maxAyat));
    setEndAyat((prev) => Math.min(Math.max(prev, 1), maxAyat));
  }, [partialJuz]);

  const resetFlow = useCallback(() => {
    setFlowMode("collapsed");
    setStepIndex(0);
    setSelectedDate(toDateString(new Date()));
    setStartHour("06");
    setStartMinute("15");
    setStartPeriod("am");
    setIsPeriodDropdownOpen(false);
    setCompletionType("full");
    setCommittedCompletionType("full");
    setFullStartJuz(1);
    setFullEndJuz(1);
    setPartialJuz(1);
    setStartAyat(1);
    setEndAyat(1);
    setFullDuration(createDefaultDuration());
    setPartialDuration(createDefaultDuration());
  }, [setFlowMode]);

  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const isStepValid = useCallback(
    (step: QuranCompletionStepId) => {
      switch (step) {
        case "date":
          return Boolean(selectedDate);
        case "startTime":
          return isValidStartTime(startHour, startMinute, startPeriod);
        case "completionType":
          return isValidCompletionType(completionType);
        case "fullJuzRange":
          return isValidJuzRange(fullStartJuz, fullEndJuz);
        case "partialJuz":
          return isValidJuzRange(partialJuz, partialJuz);
        case "ayatRange":
          return isValidAyatRange(partialJuz, startAyat, endAyat);
        case "timeSpentFull":
          return isValidTimeSpent(fullDuration.hours, fullDuration.minutes);
        case "timeSpentPartial":
          return isValidTimeSpent(
            partialDuration.hours,
            partialDuration.minutes,
          );
        default:
          return false;
      }
    },
    [
      completionType,
      endAyat,
      fullDuration.hours,
      fullDuration.minutes,
      fullEndJuz,
      fullStartJuz,
      partialDuration.hours,
      partialDuration.minutes,
      partialJuz,
      selectedDate,
      startAyat,
      startHour,
      startMinute,
      startPeriod,
    ],
  );

  const canGoForward = !isLastStep && isStepValid(currentStep);

  if (!flowDefinition) return null;
  if (embedded && flowMode !== "active") return null;
  if (hideCollapsedSummary && !embedded && flowMode === "collapsed")
    return null;

  const { config } = flowDefinition;
  const currentCompletion = config.currentCompletion;

  if (currentCompletion === null) return null;

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

    if (currentStep === "completionType") {
      setCommittedCompletionType(completionType);
    }

    setStepIndex((index) => index + 1);
  };

  const handleConfirm = () => {
    if (!isLastStep) {
      handleForward();
      return;
    }

    if (!steps.every((step) => isStepValid(step))) return;

    const startTime = `${startHour}:${startMinute} ${startPeriod}`;
    const fullMinutes =
      (Number.parseInt(fullDuration.hours || "0", 10) || 0) * 60 +
      (Number.parseInt(fullDuration.minutes || "0", 10) || 0);
    const partialMinutes =
      (Number.parseInt(partialDuration.hours || "0", 10) || 0) * 60 +
      (Number.parseInt(partialDuration.minutes || "0", 10) || 0);

    onLogComplete?.({
      type: "quran-completion",
      goalId: flowDefinition.goalId,
      date: selectedDate,
      startTime,
      completionNumber: currentCompletion,
      completionType: committedCompletionType,
      fullJuzRange:
        committedCompletionType === "partial"
          ? null
          : {
              startJuz: clampJuz(fullStartJuz),
              endJuz: clampJuz(fullEndJuz),
            },
      partialJuz:
        committedCompletionType === "full" ? null : clampJuz(partialJuz),
      ayatRange:
        committedCompletionType === "full" ? null : { startAyat, endAyat },
      fullTimeSpentMinutes:
        committedCompletionType === "partial" ? null : fullMinutes,
      partialTimeSpentMinutes:
        committedCompletionType === "full" ? null : partialMinutes,
      targetCompletions: config.targetCompletions,
    });
    resetFlow();
  };

  const getStepHeader = (step: QuranCompletionStepId) => {
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
      case "completionType":
        return {
          icon: (
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={16}
              color={Colors.light.white}
            />
          ),
          label: t("progressLogging.completionTypeTitle"),
        };
      case "fullJuzRange":
        return {
          icon: (
            <MaterialCommunityIcons
              name="book-open-variant"
              size={16}
              color={Colors.light.white}
            />
          ),
          label: t("progressLogging.selectFullJuz"),
        };
      case "partialJuz":
        return {
          icon: (
            <MaterialCommunityIcons
              name="book-open-variant"
              size={16}
              color={Colors.light.white}
            />
          ),
          label: t("progressLogging.selectPartialJuz"),
        };
      case "ayatRange":
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
      case "timeSpentFull":
        return {
          icon: (
            <MaterialCommunityIcons
              name="history"
              size={16}
              color={Colors.light.white}
            />
          ),
          label:
            committedCompletionType === "both"
              ? t("progressLogging.enterTimeSpentFullJuz")
              : t("progressLogging.enterTimeSpent"),
        };
      case "timeSpentPartial":
        return {
          icon: (
            <MaterialCommunityIcons
              name="history"
              size={16}
              color={Colors.light.white}
            />
          ),
          label:
            committedCompletionType === "partial"
              ? t("progressLogging.enterTimeSpent")
              : t("progressLogging.enterTimeSpentPartialJuz"),
        };
    }
  };

  const renderStepContent = (step: QuranCompletionStepId) => {
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
      case "completionType":
        return (
          <CompletionTypeStep
            currentCompletion={currentCompletion}
            selectedType={completionType}
            onSelectType={setCompletionType}
            styles={styles}
          />
        );
      case "fullJuzRange":
        return (
          <JuzRangeStep
            startJuz={fullStartJuz}
            endJuz={fullEndJuz}
            onChangeStartJuz={setFullStartJuz}
            onChangeEndJuz={setFullEndJuz}
            styles={styles}
          />
        );
      case "partialJuz":
        return (
          <JuzStepper
            value={partialJuz}
            onChange={setPartialJuz}
            styles={styles}
          />
        );
      case "ayatRange":
        return (
          <QuranAyatRangeSlider
            juz={partialJuz}
            startAyat={startAyat}
            endAyat={endAyat}
            onChangeStartAyat={setStartAyat}
            onChangeEndAyat={setEndAyat}
            styles={styles}
          />
        );
      case "timeSpentFull":
        return (
          <DurationStep
            durationHours={fullDuration.hours}
            setDurationHours={(value) =>
              setFullDuration((prev) => ({ ...prev, hours: value }))
            }
            durationMinutes={fullDuration.minutes}
            setDurationMinutes={(value) =>
              setFullDuration((prev) => ({ ...prev, minutes: value }))
            }
            styles={styles}
          />
        );
      case "timeSpentPartial":
        return (
          <DurationStep
            durationHours={partialDuration.hours}
            setDurationHours={(value) =>
              setPartialDuration((prev) => ({ ...prev, hours: value }))
            }
            durationMinutes={partialDuration.minutes}
            setDurationMinutes={(value) =>
              setPartialDuration((prev) => ({ ...prev, minutes: value }))
            }
            styles={styles}
          />
        );
    }
  };

  const stepHeader = getStepHeader(currentStep);
  const showOverlay = flowMode === "active" && !suppressOverlay;
  const isAyahRangeStep = currentStep === "ayatRange";

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
                {t("progressLogging.completionGoalTitle", {
                  target: formatNumber(config.targetCompletions),
                  current: formatNumber(currentCompletion),
                  defaultValue: goalData.title,
                })}
              </Text>
              <Text style={styles.summarySubtext}>
                <Text style={styles.summarySubtextRegular}>
                  ({t("progressLogging.total")}{" "}
                </Text>
                <Text style={styles.summarySubtextBold}>
                  {formatNumber(config.targetCompletions)}{" "}
                </Text>
                <Text style={styles.summarySubtextRegular}>
                  {t("progressLogging.unitCompletions")})
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
