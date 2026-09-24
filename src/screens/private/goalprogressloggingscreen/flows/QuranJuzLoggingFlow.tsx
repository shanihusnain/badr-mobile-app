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
import {
  formatProgressLoggingDateLabel,
  getQuranLoggingSelectableDateBounds,
} from "../progressLoggingConfig";
import { DurationStep, StartTimeStep, getCurrentStartTimeParts } from "../components/TimePickerSteps";
import { FlowCard } from "../components/FlowCard";
import { JuzLoggingTypeStep } from "../components/JuzLoggingTypeStep";
import { JuzRangeStep } from "../components/JuzRangeStep";
import { JuzStepper } from "../components/JuzStepper";
import { QuranAyatRangeSlider } from "../components/QuranAyatRangeSlider";
import { styles } from "../components/DailyProgressLogging.styles";
import { QuranIconForSlider } from "@/assets/icons/QuranIconForSlider";
import {
  CalendarFlippingIcon,
  WhiteClockIcon,
  WhiteTimerIcon,
} from "@/assets/icons";
import {
  useLogQuranRecitationJuzGoal,
  type LogQuranRecitationJuzPayload,
} from "@/src/api/mutations/useLogQuranRecitationJuzGoal";
import { useGetQuranGoalByType } from "@/src/api/queries/useGetQuranGoalByType";
import { getQuranJuzFlowDefinition } from "../loggingFlowRegistry";
import { getJuzVerseCountFromMap, getJuzVerseMetadata } from "../quranJuzVerseMap";
import {
  appendJuzLog,
  buildJuzLogRecordFromEntry,
  type JuzCompletionType,
} from "../quranRecitationJuzData";
import { useOptionalQuranGoalFrameContext } from "../quranGoalFrameContext";
import {
  getQuranFrameCycleEnd,
  getQuranFrameCycleStart,
  getQuranFrameJuzGoalRange,
} from "@/src/utils/quranGoalFrameMap";
import {
  getJuzRangeFromDetail,
  getSelectedJuzIdsFromDetail,
} from "@/src/utils/quranGoalMap";
import {
  buildJuzRecitationSteps,
  clampJuz,
  createDefaultDuration,
  getMinAyatStartForJuz,
  getMinPartialJuz,
  isValidCompletionType,
  isValidGoalJuzRange,
  isValidJuzAyatRange,
  isValidPartialJuzForType,
  isValidStartTime,
  isValidTimeSpent,
  MAX_JUZ,
  MIN_JUZ,
  type CompletionDurationValue,
  type QuranJuzStepId,
} from "../quranRecitationJuzTarget";
import type { QuranJuzLogEntry } from "../types";

function splitDurationMinutes(total: number, parts: number): number[] {
  if (parts <= 0) return [];
  if (parts === 1) return [Math.max(0, total)];
  const base = Math.floor(total / parts);
  const remainder = total - base * parts;
  return Array.from({ length: parts }, (_, index) =>
    index === parts - 1 ? base + remainder : base,
  );
}

type FlowMode = "collapsed" | "active";

type Props = {
  goalData: GoalData;
  hideCollapsedSummary?: boolean;
  embedded?: boolean;
  suppressOverlay?: boolean;
  flowMode?: FlowMode;
  onFlowModeChange?: (mode: FlowMode) => void;
  onLogComplete?: (entry: QuranJuzLogEntry) => void;
};

const toDateString = (date: Date) => moment(date).format("YYYY-MM-DD");

export default function QuranJuzLoggingFlow({
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
  const { data: juzGoalDetail } = useGetQuranGoalByType("RECITATION_JUZ");
  const { mutateAsync: logRecitationJuz, isPending: isLogging } =
    useLogQuranRecitationJuzGoal();
  const flowDefinition = useMemo(
    () => getQuranJuzFlowDefinition(goalData.id),
    [goalData.id],
  );

  /** Inclusive juz bounds from goal config — never allow logging outside this. */
  const goalJuzRange = useMemo(() => {
    const fromDetail = getJuzRangeFromDetail(juzGoalDetail);
    if (fromDetail) {
      return {
        start: fromDetail.start,
        end: fromDetail.end,
        allowed: new Set(getSelectedJuzIdsFromDetail(juzGoalDetail)),
      };
    }
    const fromFrame = getQuranFrameJuzGoalRange(quranFrame?.frame);
    if (fromFrame) {
      const allowed = new Set<number>();
      for (let juz = fromFrame.start; juz <= fromFrame.end; juz += 1) {
        allowed.add(juz);
      }
      return { start: fromFrame.start, end: fromFrame.end, allowed };
    }
    return {
      start: MIN_JUZ,
      end: MAX_JUZ,
      allowed: null as Set<number> | null,
    };
  }, [juzGoalDetail, quranFrame?.frame]);

  const goalMinJuz = goalJuzRange.start;
  const goalMaxJuz = goalJuzRange.end;

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
  const [loggingType, setLoggingType] = useState<JuzCompletionType>("full");
  const [committedLoggingType, setCommittedLoggingType] =
    useState<JuzCompletionType>("full");
  const [fullStartJuz, setFullStartJuz] = useState(goalMinJuz);
  const [fullEndJuz, setFullEndJuz] = useState(goalMinJuz);
  const [partialJuz, setPartialJuz] = useState(goalMinJuz);
  const [startAyat, setStartAyat] = useState(1);
  const [endAyat, setEndAyat] = useState(1);
  const [fullDuration, setFullDuration] = useState<CompletionDurationValue>(
    createDefaultDuration(),
  );
  const [partialDuration, setPartialDuration] =
    useState<CompletionDurationValue>(createDefaultDuration());

  const todayString = toDateString(new Date());
  const cycleStart = quranFrame?.frame
    ? getQuranFrameCycleStart(quranFrame.frame) || undefined
    : undefined;
  const cycleEnd = quranFrame?.frame
    ? getQuranFrameCycleEnd(quranFrame.frame) || undefined
    : undefined;
  const { minSelectableDate, maxSelectableDate } =
    getQuranLoggingSelectableDateBounds(cycleStart, cycleEnd, todayString);

  // Keep the date step inside the goal-cycle window (same as hours / memorisation).
  useEffect(() => {
    setSelectedDate((prev) => {
      if (minSelectableDate && prev < minSelectableDate) {
        return minSelectableDate;
      }
      if (prev > maxSelectableDate) return maxSelectableDate;
      return prev;
    });
  }, [minSelectableDate, maxSelectableDate]);

  const steps = useMemo(
    () => buildJuzRecitationSteps(committedLoggingType),
    [committedLoggingType],
  );

  const minAyatStart = useMemo(
    () => getMinAyatStartForJuz(partialJuz),
    [partialJuz],
  );

  const minPartialJuz = useMemo(
    () =>
      getMinPartialJuz(
        committedLoggingType,
        fullEndJuz,
        goalMinJuz,
        goalMaxJuz,
      ),
    [committedLoggingType, fullEndJuz, goalMaxJuz, goalMinJuz],
  );

  // Clamp steppers into the configured goal range once detail/frame loads.
  useEffect(() => {
    const clampToGoal = (value: number) =>
      Math.min(goalMaxJuz, Math.max(goalMinJuz, value));
    setFullStartJuz((prev) => clampToGoal(prev));
    setFullEndJuz((prev) => clampToGoal(prev));
    setPartialJuz((prev) => clampToGoal(prev));
  }, [goalMaxJuz, goalMinJuz]);

  useEffect(() => {
    setStepIndex((index) => Math.min(index, Math.max(steps.length - 1, 0)));
  }, [steps.length]);

  useEffect(() => {
    const maxAyat = getJuzVerseCountFromMap(partialJuz);
    const nextStart = Math.min(Math.max(minAyatStart, 1), maxAyat);
    setStartAyat(nextStart);
    // After prior progress, park end at max so the back chevron slides left.
    setEndAyat(minAyatStart > 1 ? maxAyat : Math.min(Math.max(nextStart, 1), maxAyat));
  }, [partialJuz, minAyatStart]);

  useEffect(() => {
    if (committedLoggingType !== "both") return;
    if (partialJuz < minPartialJuz) {
      setPartialJuz(minPartialJuz);
    }
  }, [committedLoggingType, minPartialJuz, partialJuz]);

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
    setLoggingType("full");
    setCommittedLoggingType("full");
    setFullStartJuz(goalMinJuz);
    setFullEndJuz(goalMinJuz);
    setPartialJuz(goalMinJuz);
    setStartAyat(1);
    setEndAyat(1);
    setFullDuration(createDefaultDuration());
    setPartialDuration(createDefaultDuration());
  }, [goalMinJuz, quranFrame?.frame, setFlowMode]);
  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const isStepValid = useCallback(
    (step: QuranJuzStepId) => {
      switch (step) {
        case "date":
          return Boolean(selectedDate);
        case "startTime":
          return isValidStartTime(startHour, startMinute, startPeriod);
        case "completionType":
          return isValidCompletionType(loggingType);
        case "fullJuzRange":
          return isValidGoalJuzRange(
            fullStartJuz,
            fullEndJuz,
            goalMinJuz,
            goalMaxJuz,
          );
        case "partialJuz":
          return isValidPartialJuzForType(
            partialJuz,
            committedLoggingType,
            fullEndJuz,
            goalMinJuz,
            goalMaxJuz,
          );
        case "ayatRange":
          return isValidJuzAyatRange(
            partialJuz,
            startAyat,
            endAyat,
            minAyatStart,
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
      committedLoggingType,
      endAyat,
      fullDuration.hours,
      fullDuration.minutes,
      fullEndJuz,
      fullStartJuz,
      goalMaxJuz,
      goalMinJuz,
      loggingType,
      minAyatStart,
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

  const canGoForward =
    !isLastStep && isStepValid(currentStep) && !isLogging;
  const canConfirm =
    !isLogging &&
    (isLastStep
      ? steps.every((step) => isStepValid(step))
      : isStepValid(currentStep));

  if (!flowDefinition) return null;
  if (embedded && flowMode !== "active") return null;
  if (hideCollapsedSummary && !embedded && flowMode === "collapsed")
    return null;

  const { config } = flowDefinition;

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
    if (minSelectableDate && direction === -1 && next < minSelectableDate) {
      return;
    }
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

    if (currentStep === "completionType") {
      setCommittedLoggingType(loggingType);
    }

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
    if (!isLastStep) {
      handleForward();
      return;
    }

    if (!canConfirm) return;

    const startTime = `${startHour}:${startMinute} ${startPeriod}`;
    const sessionStartTime = formatSessionStartTimeForApi();
    const fullMinutes =
      (Number.parseInt(fullDuration.hours || "0", 10) || 0) * 60 +
      (Number.parseInt(fullDuration.minutes || "0", 10) || 0);
    const partialMinutes =
      (Number.parseInt(partialDuration.hours || "0", 10) || 0) * 60 +
      (Number.parseInt(partialDuration.minutes || "0", 10) || 0);

    const entry: QuranJuzLogEntry = {
      type: "quran-juz",
      goalId: flowDefinition.goalId,
      date: selectedDate,
      startTime,
      completionType: committedLoggingType,
      fullJuzRange:
        committedLoggingType === "partial"
          ? null
          : {
              startJuz: clampJuz(fullStartJuz),
              endJuz: clampJuz(fullEndJuz),
            },
      partialJuz:
        committedLoggingType === "full" ? null : clampJuz(partialJuz),
      ayatRange:
        committedLoggingType === "full"
          ? null
          : { startAyat, endAyat },
      fullTimeSpentMinutes:
        committedLoggingType === "partial" ? null : fullMinutes,
      partialTimeSpentMinutes:
        committedLoggingType === "full" ? null : partialMinutes,
      targetJuzCount: config.targetJuzCount,
    };

    const run = async () => {
      const isJuzInGoal = (juz: number) =>
        goalJuzRange.allowed
          ? goalJuzRange.allowed.has(juz)
          : juz >= goalMinJuz && juz <= goalMaxJuz;

      const payloads: LogQuranRecitationJuzPayload[] = [];

      if (committedLoggingType === "full" || committedLoggingType === "both") {
        const start = clampJuz(fullStartJuz);
        const end = clampJuz(fullEndJuz);
        const juzNumbers: number[] = [];
        for (let juz = start; juz <= end; juz += 1) {
          if (isJuzInGoal(juz)) juzNumbers.push(juz);
        }
        const durations = splitDurationMinutes(fullMinutes, juzNumbers.length);
        juzNumbers.forEach((juz, index) => {
          const toAyah = getJuzVerseCountFromMap(juz);
          payloads.push({
            quranGoalType: "RECITATION_JUZ",
            date: selectedDate,
            sessionStartTime,
            durationMinutes: durations[index] ?? 0,
            itemType: "JUZ",
            itemNumber: juz,
            fromAyah: 1,
            toAyah,
          });
        });
      }

      if (
        (committedLoggingType === "partial" ||
          committedLoggingType === "both") &&
        isJuzInGoal(partialJuz)
      ) {
        payloads.push({
          quranGoalType: "RECITATION_JUZ",
          date: selectedDate,
          sessionStartTime,
          durationMinutes: partialMinutes,
          itemType: "JUZ",
          itemNumber: clampJuz(partialJuz),
          fromAyah: startAyat,
          toAyah: endAyat,
        });
      }

      if (payloads.length === 0) return;

      try {
        await logRecitationJuz(payloads);
        await quranFrame?.refetch();
        appendJuzLog(buildJuzLogRecordFromEntry(entry));
        onLogComplete?.(entry);
        resetFlow();
      } catch {
        // Mutation onError already shows toast.
      }
    };

    void run();
  };

  const getStepHeader = (step: QuranJuzStepId) => {
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
          icon: (
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={24}
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
              size={24}
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
              size={24}
              color={Colors.light.white}
            />
          ),
          label: t("progressLogging.selectPartialJuz"),
        };
      case "ayatRange":
        return {
          icon: (
            <QuranIconForSlider size={24} Color={Colors.light.white} />
          ),
          label: t("progressLogging.selectAyatRange"),
        };
      case "timeSpentFull":
        return {
          icon: <WhiteTimerIcon size={26} />,
          label: t("progressLogging.enterTimeSpent"),
        };
      case "timeSpentPartial":
        return {
          icon: <WhiteTimerIcon size={26} />,
          label: t("progressLogging.enterTimeSpent"),
        };
    }
  };

  const renderStepContent = (step: QuranJuzStepId) => {
    switch (step) {
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
      case "completionType":
        return (
          <JuzLoggingTypeStep
            selectedType={loggingType}
            onSelectType={setLoggingType}
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
            minJuz={goalMinJuz}
            maxJuz={goalMaxJuz}
          />
        );
      case "partialJuz":
        return (
          <View style={{ alignItems: "center", gap: 8 }}>
            <JuzStepper
              value={partialJuz}
              min={minPartialJuz}
              max={goalMaxJuz}
              onChange={setPartialJuz}
              styles={styles}
            />
            <Text
              style={{
                color: Colors.light.white,
                fontSize: 12,
                fontWeight: "500",
                textAlign: "center",
                opacity: 0.95,
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
            freezeStartHandle={minAyatStart > 1}
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
        canGoBack={stepIndex > 0 && !isLogging}
        canConfirm={canConfirm}
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
                {t("progressLogging.juzGoalTitle", {
                  completed: formatNumber(config.completedJuzCount),
                  target: formatNumber(config.targetJuzCount),
                  defaultValue: goalData.title,
                })}
              </Text>
              <Text style={styles.summarySubtext}>
                <Text style={styles.summarySubtextRegular}>
                  ({t("progressLogging.total")}{" "}
                </Text>
                <Text style={styles.summarySubtextBold}>
                  {formatNumber(config.targetJuzCount)}{" "}
                </Text>
                <Text style={styles.summarySubtextRegular}>
                  {t("progressLogging.unitJuz")})
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
