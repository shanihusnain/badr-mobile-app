import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import moment from "moment-hijri";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { useLogQuranRecitationCompletionGoal } from "@/src/api/mutations/useLogQuranRecitationCompletionGoal";
import { GoalData } from "../../home/components/goalsData";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { DateStep } from "../components/DateStep";
import { formatProgressLoggingDateLabel } from "../progressLoggingConfig";
import { DurationStep, StartTimeStep, getCurrentStartTimeParts } from "../components/TimePickerSteps";
import { FlowCard } from "../components/FlowCard";
import { CompletionTypeStep } from "../components/CompletionTypeStep";
import { JuzRangeStep } from "../components/JuzRangeStep";
import { JuzStepper } from "../components/JuzStepper";
import { QuranAyatRangeSlider } from "../components/QuranAyatRangeSlider";
import { styles } from "../components/DailyProgressLogging.styles";
import {
  CalendarFlippingIcon,
  QuranImageIcon,
  WhiteClockIcon,
  WhiteTimerIcon,
} from "@/assets/icons";
import { getQuranCompletionFlowDefinition } from "../loggingFlowRegistry";
import { resolveApiJuzVerseCount } from "../quranApiVerseSpan";
import {
  getJuzVerseCountFromMap,
  getJuzVerseMetadata,
} from "../quranJuzVerseMap";
import { useOptionalQuranGoalFrameContext } from "../quranGoalFrameContext";
import {
  getQuranFrameCompletionProgress,
  getQuranFrameCompletionResumeCursor,
  getQuranFrameWeekNumberForDate,
} from "@/src/utils/quranGoalFrameMap";
import {
  buildCompletionSteps,
  clampJuz,
  createDefaultDuration,
  getCompletionMinPartialJuz,
  getCompletionResumeCursor,
  isValidAyatRange,
  isValidCompletionFullJuzRange,
  isValidCompletionType,
  isValidJuzRange,
  isValidStartTime,
  isValidTimeSpent,
  snapJuzOffExcluded,
  MAX_JUZ,
  MIN_JUZ,
  type CompletionDurationValue,
  type CompletionResumeCursor,
  type CompletionType,
  type QuranCompletionStepId,
} from "../quranRecitationCompletionTarget";
import type { QuranCompletionLogEntry } from "../types";
import { getCurrentCompletionNumber } from "../quranRecitationCompletionData";

type FlowMode = "collapsed" | "active";

const FRESH_RESUME: CompletionResumeCursor = {
  minFullStartJuz: MIN_JUZ,
  minPartialJuz: MIN_JUZ,
  minStartAyat: 1,
  excludedJuz: [],
  fullExcludedJuz: [],
  openPartialJuz: null,
  openPartialMinAyatByJuz: {},
};

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
  const quranFrame = useOptionalQuranGoalFrameContext();
  const { mutateAsync: logRecitationCompletion, isPending: isLogging } =
    useLogQuranRecitationCompletionGoal();

  const frameProgress = useMemo(() => {
    const frame = quranFrame?.frame;
    if (!frame) return null;
    return getQuranFrameCompletionProgress(frame);
  }, [quranFrame?.frame]);

  const resumeCursor = useMemo((): CompletionResumeCursor => {
    const frame = quranFrame?.frame;
    if (frame) {
      return getQuranFrameCompletionResumeCursor(
        frame,
        quranFrame?.completionCycleFrames,
      );
    }
    if (frameProgress) {
      return getCompletionResumeCursor(frameProgress.completedJuz);
    }
    return FRESH_RESUME;
  }, [
    frameProgress,
    quranFrame?.completionCycleFrames,
    quranFrame?.frame,
  ]);

  const flowDefinition = useMemo(() => {
    const base = getQuranCompletionFlowDefinition(goalData.id);
    if (!base) return null;
    if (!frameProgress) return base;
    const progress = {
      targetCompletions: frameProgress.targetCompletions,
      completedCompletions: frameProgress.completedCompletions,
    };
    return {
      ...base,
      config: {
        targetCompletions: progress.targetCompletions,
        completedCompletions: progress.completedCompletions,
        currentCompletion: getCurrentCompletionNumber(progress),
      },
    };
  }, [frameProgress, goalData.id]);

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
  const [completionType, setCompletionType] = useState<CompletionType>("full");
  const [committedCompletionType, setCommittedCompletionType] =
    useState<CompletionType>("full");
  const [fullStartJuz, setFullStartJuz] = useState(
    resumeCursor.minFullStartJuz,
  );
  const [fullEndJuz, setFullEndJuz] = useState(resumeCursor.minFullStartJuz);
  const [partialJuz, setPartialJuz] = useState(resumeCursor.minPartialJuz);
  const [startAyat, setStartAyat] = useState(resumeCursor.minStartAyat);
  const [endAyat, setEndAyat] = useState(resumeCursor.minStartAyat);
  const [fullDuration, setFullDuration] = useState<CompletionDurationValue>(
    createDefaultDuration(),
  );
  const [partialDuration, setPartialDuration] =
    useState<CompletionDurationValue>(createDefaultDuration());

  const todayString = toDateString(new Date());

  /** Keep the 7-day dashboard on the same cycle week as the date being logged. */
  const selectedDateWeekNumber = useMemo(() => {
    const frame = quranFrame?.frame;
    if (!frame) return null;
    return getQuranFrameWeekNumberForDate(frame, selectedDate);
  }, [quranFrame?.frame, selectedDate]);

  useEffect(() => {
    if (selectedDateWeekNumber == null || !quranFrame) return;
    if (quranFrame.weekNumber === selectedDateWeekNumber) return;
    quranFrame.setWeekNumber(selectedDateWeekNumber);
  }, [quranFrame, selectedDateWeekNumber]);

  const steps = useMemo(
    () => buildCompletionSteps(committedCompletionType),
    [committedCompletionType],
  );

  const partialJuzVerseCount = useMemo(() => {
    const fromFrame = resolveApiJuzVerseCount({
      juzNumber: partialJuz,
      items: quranFrame?.frame?.items,
    });
    if (fromFrame > 0) return fromFrame;
    return getJuzVerseCountFromMap(partialJuz);
  }, [partialJuz, quranFrame?.frame?.items]);

  const minPartialJuz = useMemo(
    () =>
      getCompletionMinPartialJuz(
        committedCompletionType,
        fullEndJuz,
        resumeCursor,
      ),
    [committedCompletionType, fullEndJuz, resumeCursor],
  );

  const minAyatStart = useMemo(() => {
    const lockedForJuz =
      resumeCursor.openPartialMinAyatByJuz[partialJuz] ??
      (resumeCursor.openPartialJuz != null &&
      partialJuz === resumeCursor.openPartialJuz
        ? resumeCursor.minStartAyat
        : null);
    if (lockedForJuz != null && lockedForJuz > 1) {
      return lockedForJuz;
    }
    // Already-logged juz should not be selected; if they are, treat as locked.
    if (resumeCursor.excludedJuz.includes(partialJuz)) {
      return (partialJuzVerseCount > 0 ? partialJuzVerseCount : 9999) + 1;
    }
    if (lockedForJuz != null) return lockedForJuz;
    return 1;
  }, [partialJuz, partialJuzVerseCount, resumeCursor]);

  useEffect(() => {
    setStepIndex((index) => Math.min(index, Math.max(steps.length - 1, 0)));
  }, [steps.length]);

  // Seed / clamp steppers whenever frame resume cursor advances.
  useEffect(() => {
    const fullExcluded = resumeCursor.fullExcludedJuz;
    const partialExcluded = resumeCursor.excludedJuz;
    setFullStartJuz((prev) =>
      snapJuzOffExcluded(prev, MIN_JUZ, MAX_JUZ, fullExcluded),
    );
    setFullEndJuz((prev) =>
      snapJuzOffExcluded(prev, MIN_JUZ, MAX_JUZ, fullExcluded),
    );
    setPartialJuz((prev) =>
      snapJuzOffExcluded(prev, MIN_JUZ, MAX_JUZ, partialExcluded),
    );
  }, [resumeCursor.excludedJuz, resumeCursor.fullExcludedJuz]);

  useEffect(() => {
    const maxAyat =
      partialJuzVerseCount > 0
        ? partialJuzVerseCount
        : Math.max(minAyatStart, 1);
    const nextStart = Math.min(Math.max(minAyatStart, 1), maxAyat);
    setStartAyat(nextStart);
    setEndAyat(
      minAyatStart > 1
        ? maxAyat
        : Math.min(Math.max(nextStart, 1), maxAyat),
    );
  }, [partialJuz, minAyatStart, partialJuzVerseCount]);

  useEffect(() => {
    if (committedCompletionType !== "both") return;
    if (partialJuz < minPartialJuz || resumeCursor.excludedJuz.includes(partialJuz)) {
      setPartialJuz(
        snapJuzOffExcluded(
          minPartialJuz,
          minPartialJuz,
          MAX_JUZ,
          resumeCursor.excludedJuz,
        ),
      );
    }
  }, [
    committedCompletionType,
    minPartialJuz,
    partialJuz,
    resumeCursor.excludedJuz,
  ]);

  const resetFlow = useCallback(() => {
    setFlowMode("collapsed");
    setStepIndex(0);
    setSelectedDate(toDateString(new Date()));
    const now = getCurrentStartTimeParts();
    setStartHour(now.hour);
    setStartMinute(now.minute);
    setStartPeriod(now.period);
    setIsPeriodDropdownOpen(false);
    setCompletionType("full");
    setCommittedCompletionType("full");
    setFullStartJuz(resumeCursor.minFullStartJuz);
    setFullEndJuz(resumeCursor.minFullStartJuz);
    setPartialJuz(resumeCursor.minPartialJuz);
    setStartAyat(resumeCursor.minStartAyat);
    setEndAyat(resumeCursor.minStartAyat);
    setFullDuration(createDefaultDuration());
    setPartialDuration(createDefaultDuration());
  }, [resumeCursor, setFlowMode]);

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
          return isValidCompletionFullJuzRange(
            fullStartJuz,
            fullEndJuz,
            MIN_JUZ,
            resumeCursor.fullExcludedJuz,
          );
        case "partialJuz":
          return (
            isValidJuzRange(partialJuz, partialJuz) &&
            partialJuz >= minPartialJuz &&
            partialJuz <= MAX_JUZ &&
            !resumeCursor.excludedJuz.includes(partialJuz)
          );
        case "ayatRange":
          return isValidAyatRange(
            partialJuz,
            startAyat,
            endAyat,
            minAyatStart,
            partialJuzVerseCount > 0
              ? partialJuzVerseCount
              : Math.max(endAyat, minAyatStart, 1),
          );
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
      minAyatStart,
      minPartialJuz,
      partialDuration.hours,
      partialDuration.minutes,
      partialJuz,
      partialJuzVerseCount,
      resumeCursor.excludedJuz,
      resumeCursor.fullExcludedJuz,
      selectedDate,
      startAyat,
      startHour,
      startMinute,
      startPeriod,
    ],
  );

  const canGoForward = !isLogging && !isLastStep && isStepValid(currentStep);
  const canConfirm =
    !isLogging && isLastStep && steps.every((step) => isStepValid(step));

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
    if (isLogging) return;

    const startTime = `${startHour}:${startMinute} ${startPeriod}`;
    const hourNum = Number.parseInt(startHour, 10) || 0;
    const minuteNum = Number.parseInt(startMinute, 10) || 0;
    let hour24 = hourNum % 12;
    if (startPeriod === "pm") hour24 += 12;
    const sessionStartTime = `${String(Math.max(0, hour24)).padStart(2, "0")}:${String(Math.max(0, minuteNum)).padStart(2, "0")}`;

    const fullMinutes =
      (Number.parseInt(fullDuration.hours || "0", 10) || 0) * 60 +
      (Number.parseInt(fullDuration.minutes || "0", 10) || 0);
    const partialMinutes =
      (Number.parseInt(partialDuration.hours || "0", 10) || 0) * 60 +
      (Number.parseInt(partialDuration.minutes || "0", 10) || 0);

    const entry: QuranCompletionLogEntry = {
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
    };

    const run = async () => {
      const payload: Parameters<typeof logRecitationCompletion>[0] = {
        quranGoalType: "RECITATION_COMPLETION",
        date: selectedDate,
        sessionStartTime,
      };

      if (
        committedCompletionType === "full" ||
        committedCompletionType === "both"
      ) {
        payload.fromItemNumber = clampJuz(fullStartJuz);
        payload.toItemNumber = clampJuz(fullEndJuz);
      }

      if (
        committedCompletionType === "partial" ||
        committedCompletionType === "both"
      ) {
        payload.itemNumber = clampJuz(partialJuz);
        payload.fromAyah = startAyat;
        payload.toAyah = endAyat;
      }

      // API accepts a single session duration — sum full + partial for Both.
      const durationMinutes =
        committedCompletionType === "full"
          ? fullMinutes
          : committedCompletionType === "partial"
            ? partialMinutes
            : fullMinutes + partialMinutes;
      if (durationMinutes > 0) {
        payload.durationMinutes = durationMinutes;
      }

      try {
        await logRecitationCompletion(payload);
        await quranFrame?.refetch();
        onLogComplete?.(entry);
        resetFlow();
      } catch {
        // Mutation onError already shows toast.
      }
    };

    void run();
  };

  const getStepHeader = (step: QuranCompletionStepId) => {
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
      case "completionType":
        return {
          icon: <QuranImageIcon color={Colors.light.white} size={24} />,
          label: t("progressLogging.completionTypeSelectTitle", {
            completion: formatNumber(currentCompletion),
          }),
        };
      case "fullJuzRange":
        return {
          icon: <QuranImageIcon color={Colors.light.white} size={24} />,
          label: t("progressLogging.selectFullJuz"),
        };
      case "partialJuz":
        return {
          icon: <QuranImageIcon color={Colors.light.white} size={24} />,
          label: t("progressLogging.selectPartialJuz"),
        };
      case "ayatRange":
        return {
          icon: <QuranImageIcon color={Colors.light.white} size={24} />,
          label: t("progressLogging.selectAyatRange"),
        };
      case "timeSpentFull":
        return {
          icon: <WhiteTimerIcon size={26} />,
          label:
            committedCompletionType === "both"
              ? t("progressLogging.enterTimeSpentFullJuz")
              : t("progressLogging.enterTimeSpent"),
        };
      case "timeSpentPartial":
        return {
          icon: <WhiteTimerIcon size={26} />,
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
            minJuz={MIN_JUZ}
            maxJuz={MAX_JUZ}
            excludedJuz={resumeCursor.fullExcludedJuz}
          />
        );
      case "partialJuz":
        return (
          <View style={{ marginTop: 20, width: "100%", gap: 2 }}>
            <View style={{ alignItems: "center" }}>
              <JuzStepper
                value={partialJuz}
                min={MIN_JUZ}
                max={MAX_JUZ}
                // Fully logged only — open partals stay selectable to continue.
                excluded={resumeCursor.excludedJuz}
                onChange={setPartialJuz}
                styles={styles}
              />
            </View>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              style={{
                width: "100%",
                color: Colors.light.white,
                fontSize: 9.5,
                lineHeight: 14,
                minHeight: 28,
                fontFamily: fonts.primary.medium,
                fontWeight: "500",
                textAlign: "center",
                opacity: 0.6,
              }}
            >
              {(() => {
                const meta = getJuzVerseMetadata(partialJuz);
                return `${meta.rangeLabel} (${formatNumber(meta.totalVerses)} ${t(
                  "progressLogging.versesCountLabel",
                )})`;
              })()}
            </Text>
          </View>
        );
      case "ayatRange":
        return (
          <QuranAyatRangeSlider
            juz={partialJuz}
            startAyat={startAyat}
            endAyat={endAyat}
            minStartAyat={minAyatStart}
            freezeStartHandle
            verseCount={
              partialJuzVerseCount > 0
                ? partialJuzVerseCount
                : Math.max(endAyat, minAyatStart, 1)
            }
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
                canGoBack={stepIndex > 0}
        canConfirm={canConfirm}
        styles={styles}
        style={styles.inPlaceFlowCard}
        contentStyle={
          isAyahRangeStep ? styles.flowContentAyahRange : undefined
        }
        headerStyle={
          isAyahRangeStep ? styles.flowHeaderAyahRange : undefined
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
