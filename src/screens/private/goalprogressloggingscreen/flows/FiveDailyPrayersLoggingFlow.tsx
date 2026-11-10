import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import moment from "moment-hijri";
import { Colors } from "@/constants/theme";
import { GoalData } from "../../home/components/goalsData";
import {
  CongregationOption,
  LogStepId,
  PrayerName,
  PRAYER_OPTIONS,
  TimingOption,
  formatProgressLoggingDateLabel,
} from "../progressLoggingConfig";
import { DateStep } from "../components/DateStep";
import { PrayerSelectStep } from "../components/PrayerSelectStep";
import { OptionSelectStep } from "../components/OptionSelectStep";
import {
  StartTimeStep,
  DurationStep,
  getCurrentStartTimeParts,
  isDurationEntered,
  parseFlexibleTimeToStartTimeParts,
  getPrayerWindowFromTimeline,
  isStartTimeWithinPrayerWindow,
  clampStartTimeToPrayerWindow,
  type StartTimeParts,
} from "../components/TimePickerSteps";
import { FlowCard } from "../components/FlowCard";
import {
  styles as commonStyles,
  FLOW_CARD_HEIGHT,
} from "../components/DailyProgressLogging.styles";
import { fonts } from "@/assets/fonts";
import type { ProgressLogEntry } from "../types";
import { useOptionalPrayerGoalFrameContext } from "../prayerGoalFrameContext";
import { useGetPrayerGoalFrame } from "@/src/api/queries/useGetPrayerGoalFrame";
import { useGetDashboardDataForDate } from "@/src/api/queries/useGetDashboardDataForDate";
import {
  isFiveDailyDayDetail,
  isFiveDailySlotSelectable,
  isPrayerGoalDayDetailForDate,
  useGetPrayerGoalDayDetail,
} from "@/src/api/queries/useGetPrayerGoalDayDetail";
import { resolvePrayerTypeFromGoalId } from "@/src/utils/prayerGoalMap";
import {
  formatPrayerGoalFlowCardLabel,
  getPrayerFrameAchievementLabel,
  prayerFrameShowsInsights,
} from "@/src/utils/prayerGoalFrameMap";
import { getApiErrorMessage } from "@/src/config/toastConfig";
import {
  AddLoggingFlowIcon,
  CalendarFlippingIcon,
  CheckCircleOutlineIcon,
  CongregationalMosqueIcon,
  PrayerMatIcon,
  WhiteClockIcon,
  WhitePrayerMatIcon,
  WhiteTimerIcon,
} from "@/assets/icons";
import { FiveDailyPrayerIDetailedIbadhasIcon } from "@/assets/icons/FiveDailyPrayerIDetailedIbadhasIcon";
import { useLogFiveDailyPrayersGoal } from "@/src/api/mutations/useLogFiveDailyPrayersGoal";
import type { FiveDailyPrayerSlot } from "@/src/api/mutations/useLogFiveDailyPrayersGoal";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LoggingBackdrop } from "../components/LoggingBackdrop";

const STEPS_WITH_CONGREGATION: LogStepId[] = [
  "date",
  "prayerSelect",
  "timing",
  "congregation",
  "startTime",
  "duration",
];

const STEPS_WITHOUT_CONGREGATION: LogStepId[] = [
  "date",
  "prayerSelect",
  "timing",
  "startTime",
  "duration",
];

type Props = {
  goalData: GoalData;
  onLogComplete?: (entry: ProgressLogEntry) => void;
};

type FlowMode = "collapsed" | "active";

const PRAYER_TO_SLOT: Record<PrayerName, FiveDailyPrayerSlot> = {
  fajr: "FAJR",
  dhuhr: "DHUHR",
  asr: "ASR",
  maghrib: "MAGHRIB",
  isha: "ISHA",
};

/**
 * On-time AM/PM limits by prayer:
 * Fajr → AM; Dhuhr → AM|PM; Asr → PM; Maghrib → PM; Isha → AM|PM.
 * Qadha always allows both.
 */
function getFiveDailyAllowedPeriods(
  prayer: PrayerName | null,
  timing: TimingOption,
): ReadonlyArray<"am" | "pm"> {
  if (timing === "qadha" || !prayer) return ["am", "pm"];
  if (prayer === "fajr") return ["am"];
  if (prayer === "dhuhr" || prayer === "isha") return ["am", "pm"];
  // asr, maghrib
  return ["pm"];
}

const toDateString = (date: Date) => moment(date).format("YYYY-MM-DD");

/** API 400 when startTime is outside the allowed prayer window. */
function isFiveDailyStartTimeOutsideWindowError(error: unknown): boolean {
  const message = getApiErrorMessage(error, "").toLowerCase();
  return (
    message.includes("falls outside") ||
    message.includes("outside the") ||
    message.includes("only be logged within") ||
    message.includes("only be logged between") ||
    message.includes("has not begun yet") ||
    message.includes("wait until") ||
    (message.includes("starttime") &&
      (message.includes("window") ||
        message.includes("before") ||
        message.includes("after") ||
        message.includes("between")))
  );
}

/** Parse day-detail / dashboard start times (`5:47 PM` or `17:47`). */
function parsePrayerStartTimeParts(
  value: string | null | undefined,
): StartTimeParts | null {
  return parseFlexibleTimeToStartTimeParts(value);
}

function durationPartsFromMinutes(totalMinutes: number | null | undefined): {
  hours: string;
  minutes: string;
} {
  const total =
    typeof totalMinutes === "number" && Number.isFinite(totalMinutes)
      ? Math.max(0, Math.floor(totalMinutes))
      : 0;
  return {
    hours: String(Math.floor(total / 60)),
    minutes: String(total % 60),
  };
}

export default function FiveDailyPrayersLoggingFlow({
  goalData,
  onLogComplete,
}: Props) {
  const { t } = useTranslation();
  const { mutateAsync: logFiveDailyPrayers, isPending: isLogging } =
    useLogFiveDailyPrayersGoal();

  const [flowMode, setFlowMode] = useState<FlowMode>("collapsed");
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerName | null>(null);
  const [timing, setTiming] = useState<TimingOption>("onTime");
  const [congregation, setCongregation] = useState<CongregationOption>("yes");
  const [startHour, setStartHour] = useState(
    () => getCurrentStartTimeParts().hour,
  );
  const [startMinute, setStartMinute] = useState(
    () => getCurrentStartTimeParts().minute,
  );
  const [startPeriod, setStartPeriod] = useState<"am" | "pm">(
    () => getCurrentStartTimeParts().period,
  );
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [durationHours, setDurationHours] = useState("0");
  const [durationMinutes, setDurationMinutes] = useState("0");
  const [startTimeInvalid, setStartTimeInvalid] = useState(false);

  const clearStartTimeInvalid = useCallback(() => {
    setStartTimeInvalid(false);
  }, []);

  const applyStartTimeParts = useCallback((parts: StartTimeParts) => {
    setStartHour(parts.hour);
    setStartMinute(parts.minute);
    setStartPeriod(parts.period);
  }, []);

  /** Prevents Adhan re-seed from overwriting user edits for the same date/prayer. */
  const lastOnTimeAdhanSeedKeyRef = useRef<string | null>(null);

  const { data: dashboardForDate } = useGetDashboardDataForDate(
    flowMode === "active" ? selectedDate : "",
  );

  const onTimePrayerWindow = useMemo(() => {
    if (!selectedPrayer) return null;
    return getPrayerWindowFromTimeline(
      dashboardForDate?.prayerTimesCard?.timeline,
      selectedPrayer,
    );
  }, [dashboardForDate?.prayerTimesCard?.timeline, selectedPrayer]);

  const applyOnTimeWindowStart = useCallback(
    (prayer: PrayerName) => {
      const window = getPrayerWindowFromTimeline(
        dashboardForDate?.prayerTimesCard?.timeline,
        prayer,
      );
      if (window) {
        applyStartTimeParts(window.startParts);
        setStartTimeInvalid(false);
        return;
      }
      const now = getCurrentStartTimeParts();
      applyStartTimeParts(now);
    },
    [applyStartTimeParts, dashboardForDate?.prayerTimesCard?.timeline],
  );

  const clampOnTimeStartTime = useCallback(
    (parts: StartTimeParts, opts?: { force?: boolean }): StartTimeParts => {
      if (timing !== "onTime" || !onTimePrayerWindow) return parts;
      const hourNum = Number.parseInt(parts.hour, 10);
      const minuteNum = Number.parseInt(parts.minute, 10);
      const complete =
        parts.hour.trim().length > 0 &&
        parts.minute.trim().length > 0 &&
        Number.isFinite(hourNum) &&
        Number.isFinite(minuteNum) &&
        hourNum >= 1 &&
        hourNum <= 12 &&
        minuteNum >= 0 &&
        minuteNum <= 59;
      if (!complete && !opts?.force) {
        return parts;
      }
      if (!isStartTimeWithinPrayerWindow(parts, onTimePrayerWindow)) {
        const clamped = clampStartTimeToPrayerWindow(parts, onTimePrayerWindow);
        setStartTimeInvalid(true);
        return clamped;
      }
      setStartTimeInvalid(false);
      return {
        hour: parts.hour.padStart(2, "0"),
        minute: parts.minute.padStart(2, "0"),
        period: parts.period,
      };
    },
    [onTimePrayerWindow, timing],
  );

  const handleSetStartHour = useCallback(
    (h: string) => {
      const next = clampOnTimeStartTime({
        hour: h,
        minute: startMinute,
        period: startPeriod,
      });
      applyStartTimeParts(next);
      if (timing !== "onTime") clearStartTimeInvalid();
    },
    [
      applyStartTimeParts,
      clampOnTimeStartTime,
      clearStartTimeInvalid,
      startMinute,
      startPeriod,
      timing,
    ],
  );
  const handleSetStartMinute = useCallback(
    (m: string) => {
      const next = clampOnTimeStartTime({
        hour: startHour,
        minute: m,
        period: startPeriod,
      });
      applyStartTimeParts(next);
      if (timing !== "onTime") clearStartTimeInvalid();
    },
    [
      applyStartTimeParts,
      clampOnTimeStartTime,
      clearStartTimeInvalid,
      startHour,
      startPeriod,
      timing,
    ],
  );
  const handleSetStartPeriod = useCallback(
    (p: "am" | "pm") => {
      const next = clampOnTimeStartTime({
        hour: startHour,
        minute: startMinute,
        period: p,
      });
      applyStartTimeParts(next);
      if (timing !== "onTime") clearStartTimeInvalid();
    },
    [
      applyStartTimeParts,
      clampOnTimeStartTime,
      clearStartTimeInvalid,
      startHour,
      startMinute,
      timing,
    ],
  );

  const handleSelectTiming = useCallback(
    (nextTiming: TimingOption) => {
      setTiming(nextTiming);
      setStartTimeInvalid(false);
      if (nextTiming === "onTime" && selectedPrayer) {
        lastOnTimeAdhanSeedKeyRef.current = null;
        applyOnTimeWindowStart(selectedPrayer);
      } else if (nextTiming === "qadha") {
        const now = getCurrentStartTimeParts();
        applyStartTimeParts(now);
      }
    },
    [applyOnTimeWindowStart, applyStartTimeParts, selectedPrayer],
  );

  const allowedStartPeriods = useMemo(
    () => getFiveDailyAllowedPeriods(selectedPrayer, timing),
    [selectedPrayer, timing],
  );

  useEffect(() => {
    if (!allowedStartPeriods.includes(startPeriod)) {
      setStartPeriod(allowedStartPeriods[0] ?? "am");
      setIsPeriodDropdownOpen(false);
    }
  }, [allowedStartPeriods, startPeriod]);

  const prayerFrame = useOptionalPrayerGoalFrameContext();
  const frame = prayerFrame?.frame;
  const frameLoading =
    prayerFrame?.isLoading || (!frame && !prayerFrame?.isError);

  const prayerType =
    resolvePrayerTypeFromGoalId(goalData.id) ?? "FIVE_DAILY_PRAYERS";

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

  const dayDetail =
    isFiveDailyDayDetail(dayDetailRaw) &&
    isPrayerGoalDayDetailForDate(dayDetailRaw, selectedDate)
      ? dayDetailRaw
      : null;

  /** Prefer week query; fall back to dashboard frame when it already has this date. */
  const frameForSelectedDate = useMemo(() => {
    const dateIn = (candidate?: typeof frame) =>
      candidate?.week.days.some(
        (d) => d.date === selectedDate || d.date.startsWith(`${selectedDate}`),
      );

    if (dateIn(selectedDateWeekFrame)) return selectedDateWeekFrame;
    if (dateIn(frame)) return frame;
    return selectedDateWeekFrame ?? frame;
  }, [selectedDateWeekFrame, frame, selectedDate]);

  const frameDayForSelectedDate = useMemo(
    () =>
      frameForSelectedDate?.week.days.find(
        (d) => d.date === selectedDate || d.date.startsWith(`${selectedDate}`),
      ) ?? null,
    [frameForSelectedDate, selectedDate],
  );

  const isSlotMenstruationFromFrame = useCallback(
    (slotKey: FiveDailyPrayerSlot) =>
      Boolean(frameDayForSelectedDate?.slots?.[slotKey]?.isMenstruationSlot),
    [frameDayForSelectedDate],
  );

  const loggedPrayersForSelectedDate = useMemo((): PrayerName[] => {
    if (!dayDetail?.slots) return [];
    return PRAYER_OPTIONS.filter(
      (prayer) => dayDetail.slots?.[PRAYER_TO_SLOT[prayer]]?.logged === true,
    );
  }, [dayDetail]);

  /** Logged prayers excluded from goal totals (menstruation window). */
  const notCountedPrayersForSelectedDate = useMemo((): PrayerName[] => {
    if (!dayDetail?.slots) return [];
    return PRAYER_OPTIONS.filter((prayer) => {
      const slot = dayDetail.slots?.[PRAYER_TO_SLOT[prayer]];
      return slot?.logged === true && slot.countsTowardGoal === false;
    });
  }, [dayDetail]);

  const lockedPrayersForSelectedDate = useMemo((): PrayerName[] => {
    if (!dayDetail?.slots) return [...PRAYER_OPTIONS];
    return PRAYER_OPTIONS.filter((prayer) => {
      const slotKey = PRAYER_TO_SLOT[prayer];
      return !isFiveDailySlotSelectable(dayDetail.slots?.[slotKey], {
        isMenstruationSlot: isSlotMenstruationFromFrame(slotKey),
      });
    });
  }, [dayDetail, isSlotMenstruationFromFrame]);

  const selectablePrayers = useMemo(
    () =>
      PRAYER_OPTIONS.filter((prayer) => {
        const slotKey = PRAYER_TO_SLOT[prayer];
        return isFiveDailySlotSelectable(dayDetail?.slots?.[slotKey], {
          isMenstruationSlot: isSlotMenstruationFromFrame(slotKey),
        });
      }),
    [dayDetail, isSlotMenstruationFromFrame],
  );

  const hasSelectablePrayer = selectablePrayers.length > 0;

  // Only block while we don't have day-detail yet — background refetch
  // must not keep Next disabled after the user selects a prayer.
  const dayDetailLoadingState =
    flowMode === "active" &&
    dayDetail == null &&
    (dayDetailLoading || dayDetailFetching);

  const isCongregationalTracked = Boolean(
    frame?.isCongregationalTracked ?? frame?.goal?.isCongregationalTracked,
  );

  const showJumuahForDhuhr = useMemo(() => {
    if (!isCongregationalTracked) return false;
    return moment(selectedDate, "YYYY-MM-DD").day() === 5; // Friday
  }, [isCongregationalTracked, selectedDate]);

  const steps = useMemo(() => {
    // Congregation step only when tracking is on and user chose on-time.
    if (isCongregationalTracked && timing === "onTime") {
      return STEPS_WITH_CONGREGATION;
    }
    return STEPS_WITHOUT_CONGREGATION;
  }, [isCongregationalTracked, timing]);

  const goalLabel = formatPrayerGoalFlowCardLabel(frame?.goal.label ?? "---");
  const goalLabelParts = useMemo(() => {
    const match = goalLabel.match(
      /^(.*?)\s*\(total\s+(\d+)\s+prayers?\)\s*$/i,
    );
    if (!match) {
      return {
        title: goalLabel,
        totalCount: null as string | null,
      };
    }
    return {
      title: match[1].trim(),
      totalCount: match[2],
    };
  }, [goalLabel]);

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

  // Clamp `selectedDate` into the valid cycle range when the cycle bounds
  // change. Use functional setState and avoid depending on `selectedDate`
  // itself to prevent an effect <-> state update loop.
  useEffect(() => {
    setSelectedDate((current) => {
      if (cycleStart && current < cycleStart) return cycleStart;
      if (maxSelectableDate && current > maxSelectableDate)
        return maxSelectableDate;
      return current;
    });
    // Intentionally only depend on cycle bounds
  }, [cycleStart, maxSelectableDate]);

  // Keep step index valid when congregation is inserted/removed from the flow.
  useEffect(() => {
    setStepIndex((index) => Math.min(index, Math.max(0, steps.length - 1)));
  }, [steps]);

  // Drop selection when day-detail marks the slot as not loggable/editable.
  useEffect(() => {
    if (!selectedPrayer) return;
    if (lockedPrayersForSelectedDate.includes(selectedPrayer)) {
      setSelectedPrayer(null);
    }
  }, [selectedPrayer, lockedPrayersForSelectedDate]);

  // Changing the log date should not keep a prior prayer highlighted.
  useEffect(() => {
    setSelectedPrayer(null);
  }, [selectedDate]);

  const applySlotDefaultsForPrayer = useCallback(
    (prayer: PrayerName) => {
      const slot = dayDetail?.slots?.[PRAYER_TO_SLOT[prayer]];
      const now = getCurrentStartTimeParts();
      const window = getPrayerWindowFromTimeline(
        dashboardForDate?.prayerTimesCard?.timeline,
        prayer,
      );
      lastOnTimeAdhanSeedKeyRef.current = null;
      setStartTimeInvalid(false);

      if (!slot) {
        setTiming("onTime");
        setCongregation("yes");
        applyStartTimeParts(window?.startParts ?? now);
        setDurationHours("0");
        setDurationMinutes("0");
        return;
      }

      const forceQadha = slot.isQadhaOnly === true || slot.isAutoQadha === true;
      let nextTiming: TimingOption = "onTime";
      if (forceQadha || slot.wasQadha === true || slot.prayedOnTime === false) {
        nextTiming = "qadha";
      } else if (slot.prayedOnTime === true) {
        nextTiming = "onTime";
      }
      setTiming(nextTiming);

      setCongregation(slot.wasCongregational === true ? "yes" : "no");

      const loggedStart = parsePrayerStartTimeParts(slot.prayerStartTime);
      if (loggedStart) {
        applyStartTimeParts(loggedStart);
      } else if (nextTiming === "onTime") {
        applyStartTimeParts(window?.startParts ?? now);
      } else {
        applyStartTimeParts(now);
      }

      const durationParts = durationPartsFromMinutes(slot.durationMinutes);
      setDurationHours(durationParts.hours);
      setDurationMinutes(durationParts.minutes);
    },
    [applyStartTimeParts, dashboardForDate?.prayerTimesCard?.timeline, dayDetail],
  );

  // Timeline may load after prayer select — seed Adhan once per date/prayer/on-time.
  useEffect(() => {
    if (flowMode !== "active") {
      lastOnTimeAdhanSeedKeyRef.current = null;
      return;
    }
    if (timing !== "onTime" || !selectedPrayer) return;
    if (!onTimePrayerWindow) return;
    const loggedStart = parsePrayerStartTimeParts(
      dayDetail?.slots?.[PRAYER_TO_SLOT[selectedPrayer]]?.prayerStartTime,
    );
    if (loggedStart) return;
    const key = `${selectedDate}:${selectedPrayer}:onTime`;
    if (lastOnTimeAdhanSeedKeyRef.current === key) return;
    lastOnTimeAdhanSeedKeyRef.current = key;
    applyStartTimeParts(onTimePrayerWindow.startParts);
    setStartTimeInvalid(false);
  }, [
    applyStartTimeParts,
    dayDetail,
    flowMode,
    onTimePrayerWindow,
    selectedDate,
    selectedPrayer,
    timing,
  ]);

  const handleSelectPrayer = useCallback(
    (prayer: PrayerName | null) => {
      setSelectedPrayer(prayer);
      if (prayer) {
        applySlotDefaultsForPrayer(prayer);
      }
    },
    [applySlotDefaultsForPrayer],
  );

  const currentStep = steps[stepIndex] ?? steps[0];
  const isLastStep = stepIndex === steps.length - 1;

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

    setStartTimeInvalid(false);
    setSelectedDate(next);
  };

  const resetFlow = useCallback(() => {
    const now = getCurrentStartTimeParts();
    setFlowMode("collapsed");
    setStepIndex(0);
    setSelectedDate(toDateString(new Date()));
    setSelectedPrayer(null);
    setTiming("onTime");
    setCongregation("yes");
    lastOnTimeAdhanSeedKeyRef.current = null;
    setStartHour(now.hour);
    setStartMinute(now.minute);
    setStartPeriod(now.period);
    setIsPeriodDropdownOpen(false);
    setDurationHours("0");
    setDurationMinutes("0");
    setStartTimeInvalid(false);
  }, []);

  const goToStartTimeStepWithError = useCallback(() => {
    const startTimeIndex = steps.indexOf("startTime");
    if (startTimeIndex >= 0) {
      setStepIndex(startTimeIndex);
    }
    setStartTimeInvalid(true);
    setIsPeriodDropdownOpen(false);
  }, [steps]);

  const formatStartTimePartsForApi = (parts: StartTimeParts) => {
    const hourNum = parseInt(parts.hour || "0", 10) || 0;
    const minuteNum = parseInt(parts.minute || "0", 10) || 0;

    let hour24 = hourNum % 12;
    if (parts.period === "pm") hour24 += 12;

    const hh = String(Math.max(0, hour24)).padStart(2, "0");
    const mm = String(Math.max(0, minuteNum)).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const formatStartTimeForApi = () =>
    formatStartTimePartsForApi({
      hour: startHour,
      minute: startMinute,
      period: startPeriod,
    });

  const buildDurationMinutesForApi = () => {
    const h = parseInt(durationHours || "0", 10) || 0;
    const m = parseInt(durationMinutes || "0", 10) || 0;
    return h * 60 + m;
  };

  const handleConfirm = () => {
    if (isLogging) return;
    if (!selectedPrayer) return;

    let confirmStartParts: StartTimeParts = {
      hour: startHour,
      minute: startMinute,
      period: startPeriod,
    };
    if (timing === "onTime") {
      confirmStartParts = clampOnTimeStartTime(confirmStartParts, {
        force: true,
      });
      applyStartTimeParts(confirmStartParts);
      if (
        onTimePrayerWindow &&
        !isStartTimeWithinPrayerWindow(confirmStartParts, onTimePrayerWindow)
      ) {
        setStartTimeInvalid(true);
        return;
      }
    }

    const run = async () => {
      const prayedOnTime = timing === "onTime";
      const includeCongregation = isCongregationalTracked && prayedOnTime;
      const payload = {
        date: selectedDate,
        prayerSlot: PRAYER_TO_SLOT[selectedPrayer],
        prayedOnTime,
        wasQadha: !prayedOnTime,
        wasCongregational: includeCongregation ? congregation === "yes" : false,
        startTime: formatStartTimePartsForApi(confirmStartParts),
        durationMinutes: buildDurationMinutesForApi(),
      };

      try {
        await logFiveDailyPrayers(payload);
        await Promise.all([
          prayerFrame?.refetch(),
          refetchSelectedDateWeek(),
          refetchDayDetail(),
        ]);

        onLogComplete?.({
          type: "five-daily-prayers",
          goalId: goalData.id,
          date: selectedDate,
          prayer: selectedPrayer,
          timing,
          congregation: includeCongregation ? congregation : "no",
          startTime: payload.startTime,
          duration: `${durationHours}h ${durationMinutes}m`,
        });
        resetFlow();
      } catch (error) {
        // onError handler already shows toast.
        if (isFiveDailyStartTimeOutsideWindowError(error)) {
          goToStartTimeStepWithError();
        }
      }
    };

    void run();
  };

  const handleBack = () => {
    if (stepIndex === 0) {
      resetFlow();
      return;
    }
    setStepIndex((index) => index - 1);
  };

  const handleForward = () => {
    if (currentStep === "date") {
      setSelectedPrayer(null);
    }
    if (currentStep === "prayerSelect") {
      if (dayDetailLoadingState) return;
      if (!hasSelectablePrayer) return;
      if (!selectedPrayer) return;
      if (lockedPrayersForSelectedDate.includes(selectedPrayer)) return;
    }
    if (currentStep === "startTime" && timing === "onTime") {
      const clamped = clampOnTimeStartTime(
        { hour: startHour, minute: startMinute, period: startPeriod },
        { force: true },
      );
      applyStartTimeParts(clamped);
      if (
        onTimePrayerWindow &&
        !isStartTimeWithinPrayerWindow(clamped, onTimePrayerWindow)
      ) {
        setStartTimeInvalid(true);
        return;
      }
      setStartTimeInvalid(false);
    }
    if (!isLastStep) setStepIndex((index) => index + 1);
  };

  const handleOpenFlow = useCallback(() => {
    if (frameLoading || isFullyAchieved) return;
    setSelectedPrayer(null);
    setFlowMode("active");
  }, [frameLoading, isFullyAchieved]);

  const getTimingLabel = useCallback(
    (option: TimingOption) =>
      option === "onTime"
        ? t("progressLogging.onTime")
        : t("progressLogging.qadha"),
    [t],
  );

  const getCongregationLabel = useCallback(
    (option: CongregationOption) =>
      option === "yes" ? t("progressLogging.yes") : t("progressLogging.no"),
    [t],
  );

  const getStepHeader = (step: LogStepId) => {
    switch (step) {
      case "date":
        return {
          icon: <CalendarFlippingIcon size={24} />,
          label: t("progressLogging.whichDay"),
        };
      case "prayerSelect":
        return {
          icon: <WhitePrayerMatIcon />,
          label: t("progressLogging.selectPrayer"),
        };
      case "timing":
        return {
          icon: (
            <MaterialCommunityIcons
              name="clock-check-outline"
              size={24}
              color={Colors.light.white}
            />
          ),
          label: t("progressLogging.prayedOnTime"),
        };
      case "congregation":
        return {
          icon: <CongregationalMosqueIcon />,
          label: t("progressLogging.prayedInMosque"),
        };
      case "startTime":
        return {
          icon: <WhiteClockIcon size={26} />,
          label: t("progressLogging.enterStartTime"),
        };
      case "duration":
        return {
          icon: <WhiteTimerIcon size={26} />,
          label: t("progressLogging.enterTimeSpent"),
        };
      default:
        return { icon: null, label: "" };
    }
  };

  const renderStepContent = (step: LogStepId) => {
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
      case "prayerSelect":
        return (
          <PrayerSelectStep
            selectedPrayer={selectedPrayer}
            onSelectPrayer={handleSelectPrayer}
            categoryColor={Colors.light.green}
            loggedPrayers={loggedPrayersForSelectedDate}
            lockedPrayers={lockedPrayersForSelectedDate}
            notCountedPrayers={notCountedPrayersForSelectedDate}
            showJumuahForDhuhr={showJumuahForDhuhr}
            t={t}
            styles={commonStyles}
          />
        );
      case "timing":
        return (
          <OptionSelectStep<TimingOption>
            options={["onTime", "qadha"]}
            selectedValue={timing}
            onSelectValue={handleSelectTiming}
            getLabel={getTimingLabel}
            radioInnerColor={Colors.light.white}
            styles={commonStyles}
          />
        );
      case "congregation":
        return (
          <OptionSelectStep<CongregationOption>
            options={["yes", "no"]}
            selectedValue={congregation}
            onSelectValue={setCongregation}
            getLabel={getCongregationLabel}
            radioInnerColor={Colors.light.white}
            styles={commonStyles}
          />
        );
      case "startTime":
        return (
          <StartTimeStep
            startHour={startHour}
            setStartHour={handleSetStartHour}
            startMinute={startMinute}
            setStartMinute={handleSetStartMinute}
            startPeriod={startPeriod}
            setStartPeriod={handleSetStartPeriod}
            isPeriodDropdownOpen={isPeriodDropdownOpen}
            setIsPeriodDropdownOpen={setIsPeriodDropdownOpen}
            styles={commonStyles}
            hasError={startTimeInvalid}
            allowedPeriods={allowedStartPeriods}
          />
        );
      case "duration":
        return (
          <DurationStep
            durationHours={durationHours}
            setDurationHours={setDurationHours}
            durationMinutes={durationMinutes}
            setDurationMinutes={setDurationMinutes}
            styles={commonStyles}
          />
        );
      default:
        return null;
    }
  };

  const stepHeader = getStepHeader(currentStep);

  return (
    <>
      {flowMode === "active" && (
        <LoggingBackdrop />
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
                  <FiveDailyPrayerIDetailedIbadhasIcon
                    color={Colors.light.white}
                    size={22}
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
                    <Text
                      style={[
                        localStyles.summaryTitle,
                        frameLoading && localStyles.loadingPlaceholderText,
                      ]}
                      numberOfLines={2}
                    >
                      {goalLabelParts.title}
                    </Text>
                    {goalLabelParts.totalCount ? (
                      <Text
                        style={[
                          localStyles.summaryTotalLine,
                          frameLoading && localStyles.loadingPlaceholderText,
                        ]}
                        numberOfLines={1}
                      >
                        <Text style={localStyles.summaryTotalPlain}>
                          (total{" "}
                        </Text>
                        <Text style={localStyles.summaryTotalCount}>
                          {goalLabelParts.totalCount}
                        </Text>
                        <Text style={localStyles.summaryTotalPlain}>
                          {" "}
                          Prayers)
                        </Text>
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
                  (frameLoading || isFullyAchieved) &&
                    localStyles.addButtonDisabled,
                ]}
                onPress={handleOpenFlow}
                activeOpacity={0.8}
                disabled={frameLoading || isFullyAchieved}
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
                    currentStep === "prayerSelect" &&
                    (dayDetailLoadingState ||
                      !hasSelectablePrayer ||
                      !selectedPrayer ||
                      (selectedPrayer
                        ? lockedPrayersForSelectedDate.includes(selectedPrayer)
                        : false))
                  )
                }
                canGoBack={stepIndex > 0}
                canConfirm={
                  isLastStep &&
                  !isLogging &&
                  !isFullyAchieved &&
                  isDurationEntered(durationHours, durationMinutes)
                }
                isConfirmLoading={isLogging}
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
    alignItems: "flex-start",
    gap: 6,
  },
  summaryTextBlock: {
    flex: 1,
    gap: 9,
  },
  summaryIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.light.selectcategory,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 33,
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
  },
  /** Explicit plain weight so nested count bold doesn't leak onto "Prayers". */
  summaryTotalPlain: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 12,
    fontWeight: "400" as const,
    lineHeight: 14,
  },
  summaryTotalCount: {
    color: Colors.light.white,
    fontFamily: fonts.primary.bold,
    fontSize: 12,
    fontWeight: "700" as const,
    lineHeight: 14,
  },
  loadingPlaceholderText: {
    opacity: 0.35,
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
  spacer: {
    flex: 1,
  },
});
