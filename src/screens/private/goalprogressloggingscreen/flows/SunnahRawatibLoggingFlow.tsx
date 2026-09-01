import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import moment from "moment-hijri";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import {

  CalendarFlippingIcon,
  WhiteClockIcon,
  WhitePrayerMatIcon,
  WhiteTimerIcon,
} from "@/assets/icons";
import { SunnahRawatibDetailedIbadhasIcon } from "@/assets/icons/SunnahRawatibDetailedIbadhasIcon";
import { GoalData } from "../../home/components/goalsData";
import { DateStep } from "../components/DateStep";
import { formatProgressLoggingDateLabel } from "../progressLoggingConfig";
import {
  StartTimeStep,
  DurationStep,
  getCurrentStartTimeParts,
  isDurationEntered,
} from "../components/TimePickerSteps";
import { OptionSelectStep } from "../components/OptionSelectStep";
import { FlowCard } from "../components/FlowCard";
import {
  SunnahRawatibPrayerSelectStep,
  type SunnahPrayerId,
} from "../components/SunnahRawatibPrayerSelectStep";
import {
  styles as commonStyles,
  FLOW_CARD_HEIGHT,
} from "../components/DailyProgressLogging.styles";
import type { ProgressLogEntry } from "../types";
import { useOptionalPrayerGoalFrameContext } from "../prayerGoalFrameContext";
import {
  getSunnahAfterDhuhrPrayersPerDay,
  getSunnahBeforeAsrPrayersPerDay,
  getPrayerFrameAchievementLabel,
  prayerFrameShowsInsights,
} from "@/src/utils/prayerGoalFrameMap";
import { resolvePrayerTypeFromGoalId } from "@/src/utils/prayerGoalMap";
import { useGetPrayerGoalFrame } from "@/src/api/queries/useGetPrayerGoalFrame";
import type { PrayerGoalFrameData } from "@/src/api/queries/useGetPrayerGoalFrame";
import {
  isFiveDailyDayDetail,
  isMissedPastPrayerDayDetail,
  isPrayerGoalDayDetailForDate,
  isSunnahRawatibSlotInGoal,
  isSunnahRawatibSlotPartiallyLogged,
  isSunnahRawatibSlotSelectable,
  readSunnahRawatibSlotDailyTarget,
  readSunnahRawatibSlotLoggedCount,
  useGetPrayerGoalDayDetail,
  type SunnahRawatibDayDetail,
} from "@/src/api/queries/useGetPrayerGoalDayDetail";
import {
  useLogSunnahRawatibGoal,
  type LogSunnahRawatibPayload,
  type SunnahRawatibSlot,
} from "@/src/api/mutations/useLogSunnahRawatibGoal";
import { AddLoggingFlowIcon } from "@/assets/icons";

// ─── Types ────────────────────────────────────────────────────────────────────

type SunnahPrayerStepId =
  | "date"
  | "select-prayer"
  | "rakahs-quantity"
  | "start-time"
  | "time-spent";

type PrayerCountOption = "1" | "2";

type FlowMode = "collapsed" | "active";

type Props = {
  goalData: GoalData;
  onLogComplete?: (entry: ProgressLogEntry) => void;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const toDateString = (date: Date) => moment(date).format("YYYY-MM-DD");

const SUNNAH_OPTION_IDS: SunnahPrayerId[] = [
  "before_fajr",
  "before_dhuhr",
  "after_dhuhr",
  "before_asr",
  "after_maghrib",
  "after_isha",
];

const SUNNAH_UI_TO_API_SLOT: Record<SunnahPrayerId, SunnahRawatibSlot> = {
  before_fajr: "BEFORE_FAJR",
  before_dhuhr: "BEFORE_DHUHR",
  after_dhuhr: "AFTER_DHUHR",
  before_asr: "BEFORE_ASR",
  after_maghrib: "AFTER_MAGHRIB",
  after_isha: "AFTER_ISHA",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SunnahRawatibLoggingFlow({
  goalData,
  onLogComplete,
}: Props) {
  const { t } = useTranslation();
  const [flowMode, setFlowMode] = useState<FlowMode>("collapsed");
  const [stepIndex, setStepIndex] = useState(0);

  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [selectedPrayer, setSelectedPrayer] =
    useState<SunnahPrayerId>("before_fajr");
  const [prayerCount, setPrayerCount] = useState<PrayerCountOption>("1");

  const initialStart = getCurrentStartTimeParts();
  const [startHour, setStartHour] = useState(initialStart.hour);
  const [startMinute, setStartMinute] = useState(initialStart.minute);
  const [startPeriod, setStartPeriod] = useState<"am" | "pm">(
    initialStart.period,
  );
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);

  const [durationHours, setDurationHours] = useState("0");
  const [durationMinutes, setDurationMinutes] = useState("0");

  const { mutateAsync: logSunnah, isPending: isLogging } =
    useLogSunnahRawatibGoal();

  const prayerFrame = useOptionalPrayerGoalFrameContext();
  const frame = prayerFrame?.frame;
  const slotConfig = frame?.slotConfig;

  const prayerType =
    resolvePrayerTypeFromGoalId(goalData.id) ?? "SUNNAH_RAWATIB";

  // Frame slotConfig: after Dhuhr 1|2, before Asr 0|1|2 prayers/day.
  const afterDhuhrPrayersPerDay = getSunnahAfterDhuhrPrayersPerDay(slotConfig);
  const beforeAsrPrayersPerDay = getSunnahBeforeAsrPrayersPerDay(slotConfig);
  const beforeAsrInGoal = beforeAsrPrayersPerDay > 0;

  const frameAvailableSunnahOptions = useMemo(
    () =>
      SUNNAH_OPTION_IDS.filter((id) => {
        if (id === "before_asr" && !beforeAsrInGoal) return false;
        return true;
      }),
    [beforeAsrInGoal],
  );

  /** Fixed / max prayer count for a slot (frame fallback before day-detail loads). */
  const getSlotTargetCount = useCallback(
    (prayerId: SunnahPrayerId): number => {
      switch (prayerId) {
        case "before_dhuhr":
          return 2;
        case "after_dhuhr":
          return afterDhuhrPrayersPerDay;
        case "before_asr":
          return beforeAsrPrayersPerDay > 0 ? beforeAsrPrayersPerDay : 1;
        default:
          return 1;
      }
    },
    [afterDhuhrPrayersPerDay, beforeAsrPrayersPerDay],
  );

  const goalLabelParts = useMemo(() => {
    const rawLabel = frame?.goal.label ?? "";
    const targetCount = frame?.goal.targetCount;
    const match = rawLabel.match(/^(.*?)\s*(\(total\s+\d+\s+prayers?\))\s*$/i);

    const totalSuffix =
      match?.[2] ??
      (targetCount != null
        ? `(total ${targetCount} ${targetCount === 1 ? "prayer" : "prayers"})`
        : null);

    return {
      title: t("progressLogging.sunnahRawatibPrayers"),
      totalSuffix,
    };
  }, [frame?.goal.label, frame?.goal.targetCount, t]);

  const badgeStatus = useMemo(() => {
    if (!frame) {
      return {
        text: "---",
        type: "in-progress" as const,
      };
    }
    return getPrayerFrameAchievementLabel(frame, t);
  }, [frame, t]);

  const showInsights = frame ? prayerFrameShowsInsights(frame) : false;
  const isFullyAchieved = (frame?.goal.achievementPct ?? 0) >= 100;

  const todayString = toDateString(new Date());
  const cycleStart = frame?.cycle?.cycleStart?.slice(0, 10);
  const cycleEnd = frame?.cycle?.cycleEnd?.slice(0, 10);
  const maxSelectableDate =
    cycleEnd && cycleEnd < todayString ? cycleEnd : todayString;

  const selectedDateWeekNumber = useMemo(() => {
    const start = frame?.cycle?.cycleStart;
    const totalWeeks = frame?.cycle?.totalWeeks;
    if (!start) return undefined;
    const week =
      Math.floor(
        moment(selectedDate, "YYYY-MM-DD").diff(
          moment(start, "YYYY-MM-DD"),
          "days",
        ) / 7,
      ) + 1;
    if (totalWeeks != null) return Math.min(Math.max(1, week), totalWeeks);
    return Math.max(1, week);
  }, [frame?.cycle?.cycleStart, frame?.cycle?.totalWeeks, selectedDate]);

  const { data: selectedDateWeekFrame, refetch: refetchSelectedDateWeek } =
    useGetPrayerGoalFrame(prayerType, {
      weekNumber: selectedDateWeekNumber,
      enabled: selectedDateWeekNumber != null,
    });

  const {
    data: dayDetailRaw,
    isLoading: dayDetailLoading,
    isFetching: dayDetailFetching,
    refetch: refetchDayDetail,
  } = useGetPrayerGoalDayDetail(prayerType, selectedDate, {
    enabled: flowMode === "active" && !!selectedDate,
  });

  const dayDetail = useMemo((): SunnahRawatibDayDetail | null => {
    if (!isPrayerGoalDayDetailForDate(dayDetailRaw, selectedDate)) return null;
    if (
      isFiveDailyDayDetail(dayDetailRaw) ||
      isMissedPastPrayerDayDetail(dayDetailRaw)
    ) {
      return null;
    }
    return dayDetailRaw as SunnahRawatibDayDetail;
  }, [dayDetailRaw, selectedDate]);

  /** Goal slots for this date — from day-detail `enabled` + `dailyTarget`. */
  const availableSunnahOptions = useMemo(() => {
    if (dayDetail?.slots) {
      return SUNNAH_OPTION_IDS.filter((id) =>
        isSunnahRawatibSlotInGoal(dayDetail.slots[SUNNAH_UI_TO_API_SLOT[id]]),
      );
    }
    return frameAvailableSunnahOptions;
  }, [dayDetail, frameAvailableSunnahOptions]);

  /** Prefer week query; fall back to dashboard frame when it already has this date. */
  const frameForSelectedDate = useMemo(() => {
    const dateIn = (candidate?: PrayerGoalFrameData | null) =>
      candidate?.week.days.some(
        (d) => d.date === selectedDate || d.date.startsWith(`${selectedDate}`),
      );

    if (dateIn(selectedDateWeekFrame)) return selectedDateWeekFrame;
    if (dateIn(frame)) return frame;
    return selectedDateWeekFrame ?? frame;
  }, [selectedDateWeekFrame, frame, selectedDate]);

  /** Slot targets for the selected date (day-detail `dailyTarget`, then frame config). */
  const slotTargetsForSelectedDate = useMemo(() => {
    const targets: Partial<Record<SunnahPrayerId, number>> = {};
    for (const id of availableSunnahOptions) {
      const apiKey = SUNNAH_UI_TO_API_SLOT[id];
      const fromDetail = readSunnahRawatibSlotDailyTarget(
        dayDetail?.slots?.[apiKey],
      );
      targets[id] = fromDetail > 0 ? fromDetail : getSlotTargetCount(id);
    }
    return targets;
  }, [availableSunnahOptions, dayDetail, getSlotTargetCount]);

  /** Prayer units already logged per slot for the selected date. */
  const slotLoggedCountsForSelectedDate = useMemo(() => {
    const counts: Partial<Record<SunnahPrayerId, number>> = {};
    const optionIds = dayDetail?.slots
      ? SUNNAH_OPTION_IDS.filter((id) =>
          isSunnahRawatibSlotInGoal(dayDetail.slots[SUNNAH_UI_TO_API_SLOT[id]]),
        )
      : availableSunnahOptions;

    if (dayDetail?.slots) {
      for (const id of optionIds) {
        const apiKey = SUNNAH_UI_TO_API_SLOT[id];
        counts[id] = readSunnahRawatibSlotLoggedCount(dayDetail.slots[apiKey]);
      }
      return counts;
    }

    const day = frameForSelectedDate?.week.days.find(
      (d) => d.date === selectedDate || d.date.startsWith(`${selectedDate}`),
    );
    if (!day?.slots) return counts;

    for (const id of optionIds) {
      const raw = (day.slots as Record<string, unknown>)[
        SUNNAH_UI_TO_API_SLOT[id]
      ];
      if (typeof raw === "number" && Number.isFinite(raw)) {
        counts[id] = Math.max(0, raw);
      }
    }
    return counts;
  }, [dayDetail, frameForSelectedDate, selectedDate, availableSunnahOptions]);

  const isPrayerFullyLogged = useCallback(
    (prayerId: SunnahPrayerId) => {
      const logged = slotLoggedCountsForSelectedDate[prayerId] ?? 0;
      const target =
        slotTargetsForSelectedDate[prayerId] ?? getSlotTargetCount(prayerId);
      return logged >= target;
    },
    [
      slotLoggedCountsForSelectedDate,
      slotTargetsForSelectedDate,
      getSlotTargetCount,
    ],
  );

  const isPrayerPartiallyLogged = useCallback(
    (prayerId: SunnahPrayerId) => {
      const slot = dayDetail?.slots?.[SUNNAH_UI_TO_API_SLOT[prayerId]];
      if (slot) return isSunnahRawatibSlotPartiallyLogged(slot);
      const logged = slotLoggedCountsForSelectedDate[prayerId] ?? 0;
      const target =
        slotTargetsForSelectedDate[prayerId] ?? getSlotTargetCount(prayerId);
      return logged > 0 && target > 0 && logged < target;
    },
    [
      dayDetail,
      slotLoggedCountsForSelectedDate,
      slotTargetsForSelectedDate,
      getSlotTargetCount,
    ],
  );

  const lockedPrayersForSelectedDate = useMemo(() => {
    if (!dayDetail?.slots) return [];
    return availableSunnahOptions.filter((id) => {
      const slot = dayDetail.slots?.[SUNNAH_UI_TO_API_SLOT[id]];
      if (isPrayerFullyLogged(id)) return false;
      return !isSunnahRawatibSlotSelectable(slot);
    });
  }, [dayDetail, availableSunnahOptions, isPrayerFullyLogged]);

  /** Wait for day-detail before prayer select / forward (same as Five Daily). */
  const dayDetailLoadingState =
    flowMode === "active" &&
    (dayDetailLoading || dayDetailFetching || dayDetail == null);

  /** Forward from select-prayer: slot in goal and not fully logged (canLog gates confirm). */
  const canProceedFromPrayerSelect = useMemo(() => {
    if (dayDetailLoadingState) return false;
    if (!availableSunnahOptions.includes(selectedPrayer)) return false;
    if (isPrayerFullyLogged(selectedPrayer)) return false;
    return true;
  }, [
    dayDetailLoadingState,
    availableSunnahOptions,
    selectedPrayer,
    isPrayerFullyLogged,
  ]);

  /** Slots fully completed for this date — green tick on prayer select. */
  const fullyLoggedPrayers = useMemo(
    () => availableSunnahOptions.filter((id) => isPrayerFullyLogged(id)),
    [availableSunnahOptions, isPrayerFullyLogged],
  );

  /** Slots with loggedCount < dailyTarget — green icon, still selectable. */
  const partiallyLoggedPrayers = useMemo(
    () => availableSunnahOptions.filter((id) => isPrayerPartiallyLogged(id)),
    [availableSunnahOptions, isPrayerPartiallyLogged],
  );

  const remainingCountForSelected = useMemo(() => {
    const target =
      slotTargetsForSelectedDate[selectedPrayer] ??
      getSlotTargetCount(selectedPrayer);
    const logged = slotLoggedCountsForSelectedDate[selectedPrayer] ?? 0;
    return Math.max(0, target - logged);
  }, [
    slotTargetsForSelectedDate,
    getSlotTargetCount,
    selectedPrayer,
    slotLoggedCountsForSelectedDate,
  ]);

  /**
   * Count step only on the first log for a dual-capacity slot (target ≥ 2, logged 0).
   * If the user already logged 1 of 2, the remaining 1 is implied — skip the step.
   */
  const requiresPrayerCountStep = useMemo(() => {
    const target =
      slotTargetsForSelectedDate[selectedPrayer] ??
      getSlotTargetCount(selectedPrayer);
    const logged = slotLoggedCountsForSelectedDate[selectedPrayer] ?? 0;
    return target >= 2 && logged === 0;
  }, [
    slotTargetsForSelectedDate,
    getSlotTargetCount,
    selectedPrayer,
    slotLoggedCountsForSelectedDate,
  ]);

  const STEPS: SunnahPrayerStepId[] = useMemo(
    () =>
      requiresPrayerCountStep
        ? [
            "date",
            "select-prayer",
            "rakahs-quantity",
            "start-time",
            "time-spent",
          ]
        : ["date", "select-prayer", "start-time", "time-spent"],
    [requiresPrayerCountStep],
  );

  const currentStep = STEPS[Math.min(stepIndex, STEPS.length - 1)];
  const isLastStep = stepIndex === STEPS.length - 1;

  useEffect(() => {
    if (stepIndex > STEPS.length - 1) {
      setStepIndex(STEPS.length - 1);
    }
  }, [STEPS.length, stepIndex]);

  useEffect(() => {
    setSelectedDate((current) => {
      if (cycleStart && current < cycleStart) return cycleStart;
      if (maxSelectableDate && current > maxSelectableDate)
        return maxSelectableDate;
      return current;
    });
  }, [cycleStart, maxSelectableDate]);

  // Keep selection on a slot the backend marks as loggable for this date.
  useEffect(() => {
    setSelectedPrayer((current) => {
      const currentSlot = dayDetail?.slots?.[SUNNAH_UI_TO_API_SLOT[current]];
      const stillValid =
        availableSunnahOptions.includes(current) &&
        !isPrayerFullyLogged(current) &&
        isSunnahRawatibSlotSelectable(currentSlot);
      if (stillValid) return current;
      return (
        availableSunnahOptions.find(
          (id) =>
            !isPrayerFullyLogged(id) &&
            isSunnahRawatibSlotSelectable(
              dayDetail?.slots?.[SUNNAH_UI_TO_API_SLOT[id]],
            ),
        ) ??
        availableSunnahOptions[0] ??
        "before_fajr"
      );
    });
  }, [
    availableSunnahOptions,
    dayDetail,
    isPrayerFullyLogged,
    selectedDate,
  ]);

  const dateLabel = formatProgressLoggingDateLabel(
    selectedDate,
    todayString,
    t("progressLogging.today"),
  );

  const shiftDate = (direction: -1 | 1) => {
    const next = moment(selectedDate, "YYYY-MM-DD")
      .add(direction, "days")
      .format("YYYY-MM-DD");
    if (cycleStart && direction === -1 && next < cycleStart) return;
    if (direction === 1 && next > maxSelectableDate) return;
    setSelectedDate(next);
  };

  // ─── Flow handlers ─────────────────────────────────────────────────────────

  const resetFlow = useCallback(() => {
    const now = getCurrentStartTimeParts();
    setFlowMode("collapsed");
    setStepIndex(0);
    setSelectedDate(toDateString(new Date()));
    setSelectedPrayer(availableSunnahOptions[0] ?? "before_fajr");
    setPrayerCount("1");
    setStartHour(now.hour);
    setStartMinute(now.minute);
    setStartPeriod(now.period);
    setDurationHours("0");
    setDurationMinutes("0");
    setIsPeriodDropdownOpen(false);
  }, [availableSunnahOptions]);

  const handleOpenFlow = useCallback(() => {
    if (isFullyAchieved) return;
    setFlowMode("active");
  }, [isFullyAchieved]);

  useEffect(() => {
    if (flowMode !== "active" || !selectedDate) return;
    void refetchDayDetail();
  }, [flowMode, selectedDate, refetchDayDetail]);

  const handleBack = () => {
    if (stepIndex === 0) {
      resetFlow();
      return;
    }
    setStepIndex((i) => i - 1);
  };

  const handleForward = () => {
    if (currentStep === "select-prayer" && !canProceedFromPrayerSelect) return;
    if (!isLastStep) setStepIndex((i) => i + 1);
  };

  const handleSelectPrayer = (id: SunnahPrayerId) => {
    if (isPrayerFullyLogged(id)) return;
    if (lockedPrayersForSelectedDate.includes(id)) return;
    setSelectedPrayer(id);
    setPrayerCount("1");
  };

  const formatStartTimeForApi = () => {
    const hourNum = parseInt(startHour || "0", 10) || 0;
    const minuteNum = parseInt(startMinute || "0", 10) || 0;
    let hour24 = hourNum % 12;
    if (startPeriod === "pm") hour24 += 12;
    const hh = String(Math.max(0, hour24)).padStart(2, "0");
    const mm = String(Math.max(0, minuteNum)).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const buildDurationMinutesForApi = () => {
    const h = parseInt(durationHours || "0", 10) || 0;
    const m = parseInt(durationMinutes || "0", 10) || 0;
    return h * 60 + m;
  };

  const getCountToLog = () => {
    if (requiresPrayerCountStep) return Number(prayerCount);
    const target =
      slotTargetsForSelectedDate[selectedPrayer] ??
      getSlotTargetCount(selectedPrayer);
    // Partial dual slot: only log remaining; otherwise log the slot target.
    if (remainingCountForSelected > 0 && remainingCountForSelected < target) {
      return remainingCountForSelected;
    }
    return target;
  };

  const handleConfirm = () => {
    if (isLogging) return;
    if (isPrayerFullyLogged(selectedPrayer)) return;

    const payload: LogSunnahRawatibPayload = {
      date: selectedDate,
      sunnahSlot: SUNNAH_UI_TO_API_SLOT[selectedPrayer],
      startTime: formatStartTimeForApi(),
      durationMinutes: buildDurationMinutesForApi(),
      count: getCountToLog(),
    };

    void (async () => {
      try {
        await logSunnah(payload);
        await Promise.all([
          prayerFrame?.refetch(),
          refetchSelectedDateWeek(),
          refetchDayDetail(),
        ]);
        onLogComplete?.({
          type: "sunnah-rawatib",
          goalId: goalData.id,
          date: selectedDate,
          prayer: selectedPrayer,
          rakahsQuantity: payload.count === 2 ? "Two" : "One",
          startTime: payload.startTime,
          durationMinutes: payload.durationMinutes,
        } as any);
        resetFlow();
      } catch {
        // Toast handled in mutation onError
      }
    })();
  };

  // ─── Step header (Figma / shared prayer-flow icons) ────────────────────────

  const getStepHeader = (step: SunnahPrayerStepId) => {
    switch (step) {
      case "date":
        return {
          icon: <CalendarFlippingIcon size={24} />,
          label: t("progressLogging.whichDay"),
        };
      case "select-prayer":
        return {
          icon: <WhitePrayerMatIcon size={26} />,
          label: t("progressLogging.selectPrayer"),
        };
      case "rakahs-quantity": {
        const prayerNameKey =
          selectedPrayer === "before_asr"
            ? "progressLogging.sunnahPrayerBeforeAsr"
            : "progressLogging.sunnahPrayerAfterDhuhr";
        return {
          icon: <WhitePrayerMatIcon size={26} />,
          label: t("progressLogging.sunnahDidYouPray1Or2", {
            prayer: t(prayerNameKey),
          }),
        };
      }
      case "start-time":
        return {
          icon: <WhiteClockIcon size={26} />,
          label: t("progressLogging.enterStartTime"),
        };
      case "time-spent":
        return {
          icon: <WhiteTimerIcon size={26} />,
          label: t("progressLogging.enterTimeSpent"),
        };
    }
  };

  // ─── Step content ──────────────────────────────────────────────────────────

  const renderStepContent = (step: SunnahPrayerStepId) => {
    switch (step) {
      case "date":
        return (
          <DateStep
            dateLabel={dateLabel}
            selectedDate={selectedDate}
            todayString={todayString}
            minSelectableDate={cycleStart}
            maxSelectableDate={maxSelectableDate}
            onShiftDate={shiftDate}
            styles={commonStyles}
          />
        );
      case "select-prayer":
        return (
          <SunnahRawatibPrayerSelectStep
            options={availableSunnahOptions}
            selectedPrayer={selectedPrayer}
            onSelectPrayer={handleSelectPrayer}
            categoryColor={Colors.light.green}
            fullyLoggedPrayers={fullyLoggedPrayers}
            partiallyLoggedPrayers={partiallyLoggedPrayers}
            lockedPrayers={lockedPrayersForSelectedDate}
            t={t}
            styles={commonStyles}
          />
        );
      case "rakahs-quantity":
        return (
          <OptionSelectStep<PrayerCountOption>
            options={["1", "2"]}
            selectedValue={prayerCount}
            onSelectValue={setPrayerCount}
            getLabel={(val) =>
              val === "1"
                ? t("progressLogging.sunnahPrayerCount1")
                : t("progressLogging.sunnahPrayerCount2")
            }
            radioInnerColor={Colors.light.white}
            styles={commonStyles}
          />
        );
      case "start-time":
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
            styles={commonStyles}
          />
        );
      case "time-spent":
        return (
          <DurationStep
            durationHours={durationHours}
            setDurationHours={setDurationHours}
            durationMinutes={durationMinutes}
            setDurationMinutes={setDurationMinutes}
            styles={commonStyles}
          />
        );
    }
  };

  const stepHeader = getStepHeader(currentStep);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {flowMode === "active" && (
        <Pressable style={commonStyles.backdrop} onPress={resetFlow} />
      )}
      {flowMode === "active" && (
        <TouchableOpacity
          style={commonStyles.cancelButton}
          onPress={resetFlow}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={20} color={Colors.light.white} />
        </TouchableOpacity>
      )}

      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>
          {t("progressLogging.myProgress")}
        </Text>

        <View style={commonStyles.cardAnchor}>
          {flowMode === "collapsed" ? (
            <View style={localStyles.summaryCard}>
              <View style={localStyles.summaryBody}>
                <View style={localStyles.summaryIconCircle}>
                  <SunnahRawatibDetailedIbadhasIcon
                    color={Colors.light.white}
                    size={25}
                  />
                </View>
                <View style={localStyles.summaryTextBlock}>
                  <View
                    style={[
                      localStyles.badge,
                      badgeStatus.type === "completed"
                        ? localStyles.badgeCompleted
                        : badgeStatus.type === "not-started"
                          ? localStyles.badgeNotStarted
                          : localStyles.badgeInProgress,
                      { alignSelf: "flex-start" },
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
                  <View style={localStyles.summaryTitleBlock}>
                    <Text style={localStyles.summaryTitle} numberOfLines={2}>
                      {goalLabelParts.title}
                    </Text>
                    {goalLabelParts.totalSuffix ? (
                      <Text style={localStyles.summaryTotalLine} numberOfLines={1}>
                        {goalLabelParts.totalSuffix
                          .split(/(\d+)/)
                          .map((part, index) =>
                            /^\d+$/.test(part) ? (
                              <Text
                                key={`${part}-${index}`}
                                style={localStyles.summaryTotalCount}
                              >
                                {part}
                              </Text>
                            ) : (
                              part
                            ),
                          )}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>

              <View style={localStyles.footerRow}>
                {showInsights ? (
                  <TouchableOpacity
                    style={localStyles.insightsBtn}
                    onPress={prayerFrame?.openInsights}
                    activeOpacity={0.8}
                  >
                    <Text style={localStyles.insightsText}>VIEW INSIGHTS</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={22}
                      color={Colors.light.white}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>

              <TouchableOpacity
                style={[
                  localStyles.addButton,
                  isFullyAchieved && localStyles.addButtonDisabled,
                ]}
                onPress={handleOpenFlow}
                activeOpacity={0.8}
                disabled={isFullyAchieved}
              >
                <AddLoggingFlowIcon size={32} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={commonStyles.flowCardLayer}>
              <FlowCard
                headerIcon={stepHeader.icon}
                headerLabel={stepHeader.label}
                onBack={handleBack}
                onForward={handleForward}
                onConfirm={handleConfirm}
                canGoForward={
                  !isLastStep &&
                  !(
                    currentStep === "select-prayer" && !canProceedFromPrayerSelect
                  )
                }
                canGoBack={stepIndex > 0}
                canConfirm={
                  isLastStep &&
                  !isLogging &&
                  !isPrayerFullyLogged(selectedPrayer) &&
                  isDurationEntered(durationHours, durationMinutes)
                }
                styles={commonStyles}
                style={commonStyles.inPlaceFlowCard}
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

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  },
  badgeInProgress: {
    backgroundColor: Colors.light.lightpurple,
  },
  badgeCompleted: {
    backgroundColor: Colors.light.lightgreenbadgecolor,
  },
  badgeNotStarted: {
    backgroundColor: Colors.light.paginationInactiveDot,
  },
  badgeText: {
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 12.5,
  },
  badgeTextInProgress: {
    color: Colors.light.darkblue,
  },
  badgeTextCompleted: {
    color: Colors.light.green,
  },
  badgeTextNotStarted: {
    color: Colors.light.notStartedTextColor,
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
    marginTop: 17,
  },
  summaryTextBlock: {
    flex: 1,
    gap: 9,
  },
  summaryTitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
    letterSpacing: 0,
  },
  summaryTitleBlock: {
    gap: 2,
  },
  summaryTotalLine: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 14,
    marginTop: 4,
  },
  summaryTotalCount: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 14,
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
    fontSize: 16,
    fontWeight: "700",
  },
  spacer: {
    flex: 1,
  },
  addButton: {
    position: "absolute",
    right: 16,
    bottom: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonDisabled: {
    opacity: 0.35,
  },
});
