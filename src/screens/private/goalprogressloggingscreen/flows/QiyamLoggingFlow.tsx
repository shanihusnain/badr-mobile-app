import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import moment from "moment-hijri";
import { Colors } from "@/constants/theme";
import { GoalData } from "../../home/components/goalsData";
import { DateStep } from "../components/DateStep";
import { formatProgressLoggingDateLabel } from "../progressLoggingConfig";
import { PrayerQuantityInputStep } from "../components/PrayerQuantityInputStep";
import {
  StartTimeStep,
  DurationStep,
  isDurationEntered,
  parseFlexibleTimeToStartTimeParts,
  type StartTimeParts,
} from "../components/TimePickerSteps";
import { FlowCard } from "../components/FlowCard";
import { OptionSelectStep } from "../components/OptionSelectStep";
import { useGetMe } from "@/src/api/queries/useGetMe";
import { useGetDashboardDataForDate } from "@/src/api/queries/useGetDashboardDataForDate";
import { getQiyamInitial } from "@/src/utils/prayerGoalMap";
import { useOptionalPrayerGoalFrameContext } from "../prayerGoalFrameContext";
import {
  getPrayerFrameAchievementLabel,
  prayerFrameShowsInsights,
} from "@/src/utils/prayerGoalFrameMap";
import {
  isPrayerGoalDayDetailForDate,
  isQiyamDayDetail,
  isQiyamWitrLoggedForNight,
  useGetPrayerGoalDayDetail,
} from "@/src/api/queries/useGetPrayerGoalDayDetail";
import {
  useLogQiyamGoal,
  type QiyamSessionType,
} from "@/src/api/mutations/useLogQiyamGoal";
import { getApiErrorMessage } from "@/src/config/toastConfig";
import {
  styles as commonStyles,
  FLOW_CARD_HEIGHT,
} from "../components/DailyProgressLogging.styles";
import { fonts } from "@/assets/fonts";
import {
  AddLoggingFlowIcon,
  CalendarFlippingIcon,
  WhiteClockIcon,
  WhitePrayerMatIcon,
  WhiteTimerIcon,
} from "@/assets/icons";
import { QiyamAfterIshaIcon } from "@/assets/icons/QiyamAfterIshaIcon";
import { QiyamMainFlowCardIcon } from "@/assets/icons/QiyamMainFlowCardIcon";
import { QiyamFemaleUserIcon } from "@/assets/icons/QiyamFemaleUser";
import { QiyamMaleUserIcon } from "@/assets/icons/QiyamMaleUser";
import { QiyamWhenDidYouPrayIcon } from "@/assets/icons/QiyamWhenDidYouPrayIcon";
import type { ProgressLogEntry } from "../types";
import { LoggingBackdrop } from "../components/LoggingBackdrop";

type QiyamLoggedTime = "after-isha" | "before-fajr";

type QiyamTimingOption = {
  value: QiyamLoggedTime;
  label: string;
  description: string;
  renderIcon: () => React.ReactNode;
};

const getQiyamTimingOptions = (isFemale: boolean): QiyamTimingOption[] => [
  {
    value: "after-isha",
    label: "After Isha",
    description:
      "(Concluding your day with Qiyam after the\nIsha prayer and before going to sleep.)",
    renderIcon: () => <QiyamAfterIshaIcon size={16} outline />,
  },
  {
    value: "before-fajr",
    label: "Before Fajr (Tahajjud)",
    description:
      "(Rising from sleep in the final third of the night to pray before the Fajr Adhan.)",
    renderIcon: () =>
      isFemale ? (
        <QiyamFemaleUserIcon size={16} outline />
      ) : (
        <QiyamMaleUserIcon size={16} outline />
      ),
  },
];

const QiyamTimingStep = ({
  loggedTime,
  setLoggedTime,
  isOpen,
  setIsOpen,
  timingOptions,
  styles: commonStyles,
}: {
  loggedTime: QiyamLoggedTime;
  setLoggedTime: (val: QiyamLoggedTime) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  timingOptions: QiyamTimingOption[];
  styles: typeof import("../components/DailyProgressLogging.styles").styles;
}) => {
  const selectedOption =
    timingOptions.find((option) => option.value === loggedTime) ??
    timingOptions[0];
  const alternateOptions = timingOptions.filter(
    (option) => option.value !== loggedTime,
  );

  return (
    <View style={timingStepStyles.container}>
      <View
        style={[timingStepStyles.dropdownWrapper, isOpen && { zIndex: 30 }]}
      >
        <TouchableOpacity
          style={[commonStyles.flowDropdownSelector, timingStepStyles.selector]}
          onPress={() => setIsOpen(!isOpen)}
          activeOpacity={0.8}
        >
          <View style={timingStepStyles.selectorLeading}>
            {selectedOption.renderIcon()}
            <Text style={timingStepStyles.selectorLabel} numberOfLines={1}>
              {selectedOption.label}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={12} color={Colors.light.white} />
        </TouchableOpacity>

        {isOpen ? (
          <View
            style={[
              commonStyles.flowDropdownMenu,
              timingStepStyles.dropdownMenu,
            ]}
          >
            {alternateOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  commonStyles.flowDropdownOption,
                  timingStepStyles.dropdownOption,
                ]}
                onPress={() => {
                  setLoggedTime(option.value);
                  setIsOpen(false);
                }}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    commonStyles.dropdownRadioOuter,
                    { borderColor: Colors.light.grey },
                  ]}
                >
                  <View
                    style={[
                      commonStyles.dropdownRadioInner,
                      { backgroundColor: Colors.light.green },
                    ]}
                  />
                </View>
                {option.renderIcon()}
                <Text style={timingStepStyles.dropdownLabel} numberOfLines={2}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </View>

      {!isOpen ? (
        <Text style={timingStepStyles.description} numberOfLines={2}>
          {selectedOption.description}
        </Text>
      ) : null}
    </View>
  );
};

const timingStepStyles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 6,
    paddingTop: 0,
    // Clear the "When did you pray?" header before the timing chip + description.
    marginTop: 14,
  },
  /** Same width for selector + open menu (no asymmetric shared wrapper insets). */
  dropdownWrapper: {
    width: "100%",
    position: "relative",
    alignSelf: "stretch",
  },
  selector: {
    minHeight: 26,
    height: 26,
    paddingHorizontal: 8,
    paddingVertical: 0,
    borderColor: Colors.light.dullWhite + "66",
  },
  selectorLeading: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minWidth: 0,
    marginRight: 6,
  },
  selectorLabel: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 18,
    letterSpacing: -0.3,
  },
  dropdownMenu: {
    left: 0,
    right: 0,
    width: "100%",
    marginTop: 2,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  dropdownOption: {
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    minHeight: 26,
  },
  dropdownLabel: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
    letterSpacing: -0.3,
  },
  description: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 10,
    lineHeight: 10,
    fontWeight: "400",
    opacity: 0.8,
    textAlign: "left",
    alignSelf: "stretch",
    width: "100%",
  },
});

type QiyamStepId =
  | "date"
  | "prayers-quantity"
  | "when-pray"
  | "prayed-witr"
  | "start-time"
  | "time-spent"
  | "witr";

function parsePrayersCount(value: string): number {
  return Number.parseInt(value || "0", 10) || 0;
}

/** 0 prayers: always ask Witr; Yes (or already-logged) continues to when + time. */
function buildQiyamFlowSteps(
  prayersCount: string,
  options: {
    witrAlreadyLogged: boolean;
    trackTahajjud: boolean;
    prayedWitr?: "Yes" | "No";
  },
): QiyamStepId[] {
  const count = parsePrayersCount(prayersCount);
  const timeSteps: QiyamStepId[] = ["start-time", "time-spent"];
  const whenStep: QiyamStepId[] = options.trackTahajjud ? ["when-pray"] : [];
  // 1+ prayers: skip "conclude with Witr" only when already logged (non-edit path).
  const witrStep: QiyamStepId[] = options.witrAlreadyLogged ? [] : ["witr"];

  if (count === 0) {
    // Always show "Did you pray Witr?" — Yes is pre-selected when already logged.
    const base: QiyamStepId[] = ["date", "prayers-quantity", "prayed-witr"];
    if (options.prayedWitr === "Yes") {
      return [...base, ...whenStep, ...timeSteps];
    }
    return base;
  }

  return ["date", "prayers-quantity", ...whenStep, ...timeSteps, ...witrStep];
}

function mapQiyamSessionType(loggedTime: QiyamLoggedTime): QiyamSessionType {
  return loggedTime === "before-fajr" ? "TAHAJJUD" : "AFTER_ISHA";
}

/**
 * Tahajjud → AM only.
 * After Isha → AM|PM (user may edit into AM; default still shows Isha/PM).
 * When Tahajjud is not tracked, session is always After Isha → AM|PM.
 */
function getQiyamAllowedPeriods(
  loggedTime: QiyamLoggedTime,
  trackTahajjud: boolean,
): ReadonlyArray<"am" | "pm"> {
  if (!trackTahajjud) return ["am", "pm"];
  return loggedTime === "before-fajr" ? ["am"] : ["am", "pm"];
}

const QIYAM_TAHAJJUD_DEFAULT: StartTimeParts = {
  hour: "12",
  minute: "00",
  period: "am",
};

const QIYAM_AFTER_ISHA_FALLBACK: StartTimeParts = {
  hour: "08",
  minute: "00",
  period: "pm",
};

/** Default start time by session — avoids seeding device "now" outside the night window. */
function getQiyamDefaultStartTimeParts(
  loggedTime: QiyamLoggedTime,
  ishaParts: StartTimeParts | null,
): StartTimeParts {
  if (loggedTime === "before-fajr") return QIYAM_TAHAJJUD_DEFAULT;
  return ishaParts ?? QIYAM_AFTER_ISHA_FALLBACK;
}

/** API 400 when startTime / night window is invalid for Qiyam logging. */
function isQiyamStartTimeOutsideWindowError(error: unknown): boolean {
  const message = getApiErrorMessage(error, "").toLowerCase();
  return (
    message.includes("falls outside") ||
    message.includes("only be logged within") ||
    message.includes("has not begun yet") ||
    message.includes("can be logged from isha") ||
    message.includes("wait until isha")
  );
}

type Props = {
  goalData: GoalData;
  onLogComplete?: (entry: ProgressLogEntry) => void;
};
type FlowMode = "collapsed" | "active";
const toDateString = (date: Date) => moment(date).format("YYYY-MM-DD");

/** Default log date: yesterday — today's night usually hasn't opened yet (pre-Isha). */
const getDefaultQiyamLogDate = () =>
  moment().subtract(1, "day").format("YYYY-MM-DD");

const toCalendarDate = (value: string) => {
  const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : moment(value).format("YYYY-MM-DD");
};

export default function QiyamLoggingFlow({ goalData, onLogComplete }: Props) {
  const { t } = useTranslation();
  const { mutateAsync: logQiyam, isPending: isLogging } = useLogQiyamGoal();
  const { data: me } = useGetMe();
  const prayerFrame = useOptionalPrayerGoalFrameContext();
  const frame = prayerFrame?.frame;
  const frameLoading =
    prayerFrame?.isLoading || (!frame && !prayerFrame?.isError);

  const qiyamGoalConfig = useMemo(() => {
    if (!frame) return getQiyamInitial(undefined);
    return getQiyamInitial({
      isFlexible: frame.goal.isFlexible ?? frame.qiyamConfig?.isFlexible,
      qiyamConfig: frame.qiyamConfig ?? undefined,
    });
  }, [frame]);

  const isFlexibleGoal = qiyamGoalConfig.isFlexible;
  const trackTahajjud = qiyamGoalConfig.trackTahajjud;
  const isFemale = me?.gender?.toUpperCase() === "FEMALE";
  const timingOptions = useMemo(
    () => getQiyamTimingOptions(isFemale),
    [isFemale],
  );
  const [flowMode, setFlowMode] = useState<FlowMode>("collapsed");
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(getDefaultQiyamLogDate);
  const [prayersCount, setPrayersCount] = useState("0");
  const [loggedTime, setLoggedTimeState] = useState<"after-isha" | "before-fajr">(
    "before-fajr",
  );
  const [isTimingDropdownOpen, setIsTimingDropdownOpen] = useState(false);
  const [startHour, setStartHour] = useState(QIYAM_TAHAJJUD_DEFAULT.hour);
  const [startMinute, setStartMinute] = useState(QIYAM_TAHAJJUD_DEFAULT.minute);
  const [startPeriod, setStartPeriod] = useState<"am" | "pm">(
    QIYAM_TAHAJJUD_DEFAULT.period,
  );
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [durationHours, setDurationHours] = useState("0");
  const [durationMinutes, setDurationMinutes] = useState("0");
  const [prayedWitr, setPrayedWitr] = useState<"Yes" | "No">("No");
  const [concludedWithWitr, setConcludedWithWitr] = useState<"Yes" | "No">(
    "Yes",
  );
  const [startTimeInvalid, setStartTimeInvalid] = useState(false);
  /** When true, session defaults must not overwrite Witr-edit / manual prefill. */
  const startTimeLockedRef = useRef(false);

  const clearStartTimeInvalid = useCallback(() => {
    setStartTimeInvalid(false);
  }, []);

  const applyStartTimeParts = useCallback((parts: StartTimeParts) => {
    setStartHour(parts.hour);
    setStartMinute(parts.minute);
    setStartPeriod(parts.period);
  }, []);

  const handleSetStartHour = useCallback(
    (h: string) => {
      startTimeLockedRef.current = true;
      clearStartTimeInvalid();
      setStartHour(h);
    },
    [clearStartTimeInvalid],
  );
  const handleSetStartMinute = useCallback(
    (m: string) => {
      startTimeLockedRef.current = true;
      clearStartTimeInvalid();
      setStartMinute(m);
    },
    [clearStartTimeInvalid],
  );
  const handleSetStartPeriod = useCallback(
    (p: "am" | "pm") => {
      startTimeLockedRef.current = true;
      clearStartTimeInvalid();
      setStartPeriod(p);
    },
    [clearStartTimeInvalid],
  );

  const {
    data: dayDetailRaw,
    isLoading: dayDetailLoading,
    isError: dayDetailError,
    refetch: refetchDayDetail,
  } = useGetPrayerGoalDayDetail("QIYAM_AL_LAYL", selectedDate, {
    enabled: flowMode === "active" && !!selectedDate,
  });

  const { data: dashboardForDate } = useGetDashboardDataForDate(
    flowMode === "active" ? selectedDate : "",
  );

  const ishaStartTimeParts = useMemo(() => {
    const timeline = dashboardForDate?.prayerTimesCard?.timeline;
    if (!Array.isArray(timeline)) return null;
    const ishaItem = timeline.find(
      (item) => String(item?.key ?? "").toLowerCase() === "isha",
    );
    return parseFlexibleTimeToStartTimeParts(ishaItem?.time ?? null);
  }, [dashboardForDate?.prayerTimesCard?.timeline]);

  const applySessionStartTimeDefault = useCallback(
    (session: QiyamLoggedTime) => {
      if (startTimeLockedRef.current) return;
      applyStartTimeParts(
        getQiyamDefaultStartTimeParts(session, ishaStartTimeParts),
      );
      clearStartTimeInvalid();
    },
    [applyStartTimeParts, clearStartTimeInvalid, ishaStartTimeParts],
  );

  const setLoggedTime = useCallback(
    (next: QiyamLoggedTime) => {
      setLoggedTimeState(next);
      // Switching After Isha ↔ Tahajjud always reseeds the picker for that session.
      startTimeLockedRef.current = false;
      applyStartTimeParts(
        getQiyamDefaultStartTimeParts(next, ishaStartTimeParts),
      );
      clearStartTimeInvalid();
    },
    [applyStartTimeParts, clearStartTimeInvalid, ishaStartTimeParts],
  );

  const dayDetail = useMemo(() => {
    if (!isPrayerGoalDayDetailForDate(dayDetailRaw, selectedDate)) return null;
    return isQiyamDayDetail(dayDetailRaw) ? dayDetailRaw : null;
  }, [dayDetailRaw, selectedDate]);

  const dayDetailLoadingState =
    flowMode === "active" &&
    !dayDetailError &&
    (dayDetailLoading || dayDetail == null);

  const witrAlreadyLogged = isQiyamWitrLoggedForNight(dayDetail);
  const trackTahajjudForFlow =
    dayDetail?.goal?.trackTahajjud ??
    dayDetail?.trackTahajjud ??
    trackTahajjud ??
    true;

  /** When Tahajjud isn't tracked, night is always After Isha for defaults + API. */
  const effectiveLoggedTime: QiyamLoggedTime = trackTahajjudForFlow
    ? loggedTime
    : "after-isha";

  const allowedStartPeriods = useMemo(
    () => getQiyamAllowedPeriods(effectiveLoggedTime, trackTahajjudForFlow),
    [effectiveLoggedTime, trackTahajjudForFlow],
  );

  useEffect(() => {
    if (!allowedStartPeriods.includes(startPeriod)) {
      setStartPeriod(allowedStartPeriods[0] ?? "am");
      setIsPeriodDropdownOpen(false);
    }
  }, [allowedStartPeriods, startPeriod]);

  const prayersCountValue = parsePrayersCount(prayersCount);
  const isZeroPrayersFlow = prayersCountValue === 0;
  /** 0 prayers editing an existing Witr log for that night. */
  const isZeroPrayersWitrEdit = isZeroPrayersFlow && witrAlreadyLogged;
  const requiresDuration =
    prayersCountValue >= 1 ||
    (isZeroPrayersFlow && prayedWitr === "Yes") ||
    isZeroPrayersWitrEdit;

  const flowSteps = useMemo(
    () =>
      buildQiyamFlowSteps(prayersCount, {
        witrAlreadyLogged,
        trackTahajjud: trackTahajjudForFlow,
        prayedWitr: isZeroPrayersFlow ? prayedWitr : undefined,
      }),
    [
      prayersCount,
      witrAlreadyLogged,
      trackTahajjudForFlow,
      isZeroPrayersFlow,
      prayedWitr,
    ],
  );

  const cycleStart = frame?.cycle?.cycleStart
    ? toCalendarDate(frame.cycle.cycleStart)
    : undefined;
  const cycleEnd = frame?.cycle?.cycleEnd
    ? toCalendarDate(frame.cycle.cycleEnd)
    : undefined;

  // Qiyam only: ensure "2-Rak'ah" appears before Prayers (API may omit it).
  function withTwoRakahLabel(label: string): string {
    const trimmed = label.trim();
    if (!trimmed) return trimmed;
    if (/\b2[\s-]*[Rr]ak['’]?ahs?\b/i.test(trimmed)) return trimmed;
    return trimmed
      .replace(/\bPrayers\b/i, "2-Rak'ah Prayers")
      .replace(/\bPrayer\b/i, "2-Rak'ah Prayer");
  }

  const rawGoalLabel = (frame?.goal.label ?? "").trim();
  const summaryTitle = rawGoalLabel
    ? withTwoRakahLabel(rawGoalLabel)
    : mockTitleFallback();

  function mockTitleFallback() {
    const unitTarget = qiyamGoalConfig.unitTarget;
    const rakahLabel =
      unitTarget === 1
        ? t("prayerGoals.rakahPrayer")
        : t("prayerGoals.rakahPrayers");

    if (isFlexibleGoal) {
      return `${unitTarget}${rakahLabel}${t("prayerGoals.plusWitrFlexible")}`;
    }

    return `${unitTarget}${rakahLabel} + ${qiyamGoalConfig.witrTarget || 28} Witr`;
  }

  const badgeStatus = useMemo(() => {
    if (!frame) {
      return { text: "---", type: "in-progress" as const };
    }
    return getPrayerFrameAchievementLabel(frame, t);
  }, [frame, t]);

  const showInsights = frame ? prayerFrameShowsInsights(frame) : false;
  const isFullyAchieved = (frame?.goal.achievementPct ?? 0) >= 100;
  const todayString = toDateString(new Date());
  const maxSelectableDate = cycleEnd
    ? cycleEnd < todayString
      ? cycleEnd
      : todayString
    : todayString;

  useEffect(() => {
    if (!cycleStart) return;
    const minDate =
      cycleStart <= maxSelectableDate ? cycleStart : maxSelectableDate;
    setSelectedDate((prev) => {
      if (prev < minDate) return minDate;
      if (prev > maxSelectableDate) return maxSelectableDate;
      return prev;
    });
  }, [cycleStart, maxSelectableDate]);

  useEffect(() => {
    if (flowMode !== "active" || !selectedDate) return;
    void refetchDayDetail();
  }, [flowMode, selectedDate, refetchDayDetail]);

  useEffect(() => {
    setPrayedWitr(witrAlreadyLogged ? "Yes" : "No");
    setConcludedWithWitr(witrAlreadyLogged ? "Yes" : "No");
  }, [selectedDate, witrAlreadyLogged]);

  // Prefill timing / duration when editing an existing Witr-only log.
  useEffect(() => {
    if (!isZeroPrayersWitrEdit || !dayDetail) return;

    const sessionType =
      dayDetail.witr?.sessionType ??
      (dayDetail.night?.beforeFajr
        ? "TAHAJJUD"
        : dayDetail.night?.afterIsha
          ? "AFTER_ISHA"
          : null);
    if (sessionType === "TAHAJJUD" || sessionType === "BEFORE_FAJR") {
      setLoggedTimeState("before-fajr");
    } else if (sessionType === "AFTER_ISHA") {
      setLoggedTimeState("after-isha");
    }

    const duration =
      dayDetail.witr?.durationMinutes ??
      dayDetail.night?.totalMinutesSpent ??
      null;
    if (
      typeof duration === "number" &&
      Number.isFinite(duration) &&
      duration > 0
    ) {
      setDurationHours(String(Math.floor(duration / 60)));
      setDurationMinutes(String(duration % 60));
    }

    const startRaw =
      dayDetail.witr?.startTime ?? dayDetail.night?.startTime ?? null;
    const parsed = parseFlexibleTimeToStartTimeParts(startRaw);
    if (parsed) {
      startTimeLockedRef.current = true;
      applyStartTimeParts(parsed);
    }
  }, [applyStartTimeParts, isZeroPrayersWitrEdit, dayDetail]);

  // Once Isha loads for After Isha, upgrade from the 8:00 PM fallback (unless locked).
  useEffect(() => {
    if (flowMode !== "active") return;
    if (effectiveLoggedTime !== "after-isha") return;
    if (!ishaStartTimeParts) return;
    applySessionStartTimeDefault("after-isha");
  }, [
    applySessionStartTimeDefault,
    effectiveLoggedTime,
    flowMode,
    ishaStartTimeParts,
  ]);

  useEffect(() => {
    if (stepIndex >= flowSteps.length) {
      setStepIndex(Math.max(0, flowSteps.length - 1));
    }
  }, [flowSteps.length, stepIndex]);
  const currentStep = flowSteps[stepIndex] ?? flowSteps[0];
  const isLastStep = stepIndex === flowSteps.length - 1;

  // Re-apply session default the first time user lands on start-time for this session/date.
  const lastStartTimeStepSessionRef = useRef<string | null>(null);
  useEffect(() => {
    if (flowMode !== "active") {
      lastStartTimeStepSessionRef.current = null;
      return;
    }
    if (currentStep !== "start-time") return;
    const key = `${selectedDate}:${effectiveLoggedTime}`;
    if (lastStartTimeStepSessionRef.current === key) return;
    lastStartTimeStepSessionRef.current = key;
    applySessionStartTimeDefault(effectiveLoggedTime);
  }, [
    applySessionStartTimeDefault,
    currentStep,
    effectiveLoggedTime,
    flowMode,
    selectedDate,
  ]);
  const canGoForward = !dayDetailLoadingState && !isLastStep;
  const dateLabel = useMemo(
    () =>
      formatProgressLoggingDateLabel(
        selectedDate,
        todayString,
        t("progressLogging.today"),
      ),
    [selectedDate, todayString, t],
  );

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
    setFlowMode("collapsed");
    setStepIndex(0);
    setSelectedDate(getDefaultQiyamLogDate());
    setPrayersCount("0");
    setLoggedTimeState("before-fajr");
    setIsTimingDropdownOpen(false);
    startTimeLockedRef.current = false;
    lastStartTimeStepSessionRef.current = null;
    applyStartTimeParts(QIYAM_TAHAJJUD_DEFAULT);
    setDurationHours("0");
    setDurationMinutes("0");
    setPrayedWitr("No");
    setConcludedWithWitr("Yes");
    setIsPeriodDropdownOpen(false);
    setStartTimeInvalid(false);
  }, [applyStartTimeParts]);

  const goToStartTimeStepWithError = useCallback(() => {
    const startTimeIndex = flowSteps.indexOf("start-time");
    if (startTimeIndex >= 0) {
      setStepIndex(startTimeIndex);
    }
    setStartTimeInvalid(true);
    setIsPeriodDropdownOpen(false);
    setIsTimingDropdownOpen(false);
  }, [flowSteps]);

  const handleConfirm = () => {
    if (isLogging || isFullyAchieved || dayDetailLoadingState) return;
    if (!isZeroPrayersFlow && prayersCountValue < 1) return;

    // 0 prayers + No → includesWitr false (backend omits Witr for that night).
    const includesWitr = isZeroPrayersFlow
      ? witrAlreadyLogged || prayedWitr === "Yes"
      : witrAlreadyLogged
        ? false
        : concludedWithWitr === "Yes";

    const sessionType: QiyamSessionType = trackTahajjudForFlow
      ? mapQiyamSessionType(loggedTime)
      : "AFTER_ISHA";

    const durationMinutes = buildDurationMinutesForApi();
    const startTime = formatStartTimeForApi();
    const payload = {
      date: selectedDate,
      count: prayersCountValue,
      sessionType,
      includesWitr,
      // Timing only matters when logging prayers or an actual Witr.
      ...(includesWitr || prayersCountValue > 0
        ? {
            startTime,
            ...(durationMinutes > 0 ? { durationMinutes } : {}),
          }
        : {}),
    };

    void (async () => {
      try {
        await logQiyam(payload);
        await Promise.all([prayerFrame?.refetch(), refetchDayDetail()]);
        onLogComplete?.({
          type: "qiyam-al-layl",
          goalId: goalData.id,
          date: selectedDate,
          prayersCount,
          loggedTime,
          startTime,
          durationMinutes: String(durationMinutes),
          prayedWitr: isZeroPrayersFlow
            ? witrAlreadyLogged || prayedWitr === "Yes"
            : undefined,
          concludedWithWitr:
            !isZeroPrayersFlow && !witrAlreadyLogged
              ? concludedWithWitr === "Yes"
              : undefined,
        } as ProgressLogEntry);
        resetFlow();
      } catch (error) {
        // Toast handled in mutation onError
        if (isQiyamStartTimeOutsideWindowError(error)) {
          goToStartTimeStepWithError();
        }
      }
    })();
  };

  const handleBack = () => {
    setIsTimingDropdownOpen(false);
    if (stepIndex === 0) {
      resetFlow();
      return;
    }
    setStepIndex((i) => i - 1);
  };
  const handleForward = () => {
    setIsTimingDropdownOpen(false);
    if (!canGoForward) return;
    setStepIndex((i) => i + 1);
  };
  const handleOpenFlow = useCallback(() => {
    if (frameLoading || isFullyAchieved) return;
    startTimeLockedRef.current = false;
    lastStartTimeStepSessionRef.current = null;
    const session: QiyamLoggedTime = trackTahajjud ? loggedTime : "after-isha";
    applyStartTimeParts(
      getQiyamDefaultStartTimeParts(session, ishaStartTimeParts),
    );
    setFlowMode("active");
  }, [
    applyStartTimeParts,
    frameLoading,
    isFullyAchieved,
    ishaStartTimeParts,
    loggedTime,
    trackTahajjud,
  ]);

  const isDropdownOpen =
    flowMode === "active" &&
    currentStep === "when-pray" &&
    isTimingDropdownOpen;

  const getStepHeader = (step: QiyamStepId) => {
    switch (step) {
      case "date":
        return {
          icon: <CalendarFlippingIcon size={24} />,
          label: "Which night are you logging for?",
        };
      case "prayers-quantity":
        return {
          icon: (
            <MaterialCommunityIcons
              name="star-crescent"
              size={26}
              color={Colors.light.white}
            />
          ),
          label: "How many 2-rak'ah prayers did you pray?",
        };
      case "start-time":
        return {
          icon: <WhiteClockIcon size={26} />,
          label: "Enter start time.",
        };
      case "time-spent":
        return {
          icon: <WhiteTimerIcon size={26} />,
          label: "Enter time spent.",
        };
      case "when-pray":
        return {
          icon: <QiyamWhenDidYouPrayIcon size={20} />,
          label: "When did you pray?",
        };
      case "prayed-witr":
        return {
          icon: <WhitePrayerMatIcon size={26} />,
          label: "Did you pray Witr?",
        };
      case "witr":
        return {
          icon: <WhitePrayerMatIcon size={26} />,
          label: "Did you conclude with Witr?",
        };
    }
  };

  const renderStepContent = (step: QiyamStepId) => {
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
      case "prayers-quantity":
        return (
          <PrayerQuantityInputStep
            quantity={prayersCount}
            setQuantity={setPrayersCount}
            styles={commonStyles}
            emptyFallback="0"
          />
        );
      case "start-time":
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
      case "when-pray":
        return (
          <QiyamTimingStep
            loggedTime={loggedTime}
            setLoggedTime={setLoggedTime}
            isOpen={isTimingDropdownOpen}
            setIsOpen={setIsTimingDropdownOpen}
            timingOptions={timingOptions}
            styles={commonStyles}
          />
        );
      case "prayed-witr":
        return (
          <OptionSelectStep<"Yes" | "No">
            options={["Yes", "No"]}
            selectedValue={prayedWitr}
            onSelectValue={setPrayedWitr}
            getLabel={(option) => option}
            radioInnerColor={Colors.light.white}
            styles={commonStyles}
          />
        );
      case "witr":
        return (
          <OptionSelectStep<"Yes" | "No">
            options={["Yes", "No"]}
            selectedValue={concludedWithWitr}
            onSelectValue={setConcludedWithWitr}
            getLabel={(option) => option}
            radioInnerColor={Colors.light.white}
            styles={commonStyles}
          />
        );
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

        <View
          style={[
            commonStyles.cardAnchor,
            isDropdownOpen && commonStyles.flowCardLayerDropdownOpen,
          ]}
        >
          {flowMode === "collapsed" ? (
            <View style={localStyles.summaryCard}>
              <View style={localStyles.summaryBody}>
                <View style={localStyles.summaryIconCircle}>
                  <QiyamMainFlowCardIcon size={22} color={Colors.light.white} />
                </View>
                <View style={localStyles.summaryTextBlock}>
                  <View
                    style={[
                      localStyles.badge,
                      badgeStatus.type === "completed"
                        ? localStyles.badgeCompleted
                        : localStyles.badgeInProgress,
                      { alignSelf: "flex-start" },
                    ]}
                  >
                    <Text
                      style={[
                        localStyles.badgeText,
                        badgeStatus.type === "completed"
                          ? localStyles.badgeTextCompleted
                          : localStyles.badgeTextInProgress,
                      ]}
                    >
                      {badgeStatus.text}
                    </Text>
                  </View>
                  <Text style={localStyles.summaryTitle}>{summaryTitle}</Text>
                </View>
              </View>

              <View style={localStyles.footerRow}>
                {showInsights ? (
                  <TouchableOpacity
                    style={localStyles.insightsBtn}
                    onPress={() => prayerFrame?.openInsights?.()}
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
            <View
              style={[
                commonStyles.flowCardLayer,
                isDropdownOpen && commonStyles.flowCardLayerDropdownOpen,
              ]}
            >
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
                  !dayDetailLoadingState &&
                  !isLogging &&
                  !isFullyAchieved &&
                  (!requiresDuration ||
                    isDurationEntered(durationHours, durationMinutes)) &&
                  (prayersCountValue >= 1 || isZeroPrayersFlow)
                }
                showConfirmButton={
                  isLastStep ||
                  (currentStep !== "when-pray" && currentStep !== "prayed-witr")
                }
                styles={commonStyles}
                style={[
                  commonStyles.inPlaceFlowCard,
                  isDropdownOpen && commonStyles.flowCardDropdownOpen,
                ]}
                contentStyle={
                  currentStep === "when-pray"
                    ? [
                        localStyles.whenPrayFlowContent,
                        isDropdownOpen && commonStyles.flowContentDropdownOpen,
                      ]
                    : isDropdownOpen
                      ? commonStyles.flowContentDropdownOpen
                      : undefined
                }
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
    marginTop: 22,
  },
  summaryTitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
    letterSpacing: 0,
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
    opacity: 0.45,
  },
  badgeRow: {
    flexDirection: "row",
    marginLeft: 14,
  },
  spacer: {
    flex: 1,
  },
  whenPrayFlowContent: {
    justifyContent: "flex-start",
    paddingTop: 0,
    marginTop: 3,
    marginBottom: 0,
    paddingBottom: 0,
  },
});
