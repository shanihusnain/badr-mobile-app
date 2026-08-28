import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
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
import {
  isFiveDailyDayDetail,
  isPrayerGoalDayDetailForDate,
  useGetPrayerGoalDayDetail,
} from "@/src/api/queries/useGetPrayerGoalDayDetail";
import { resolvePrayerTypeFromGoalId } from "@/src/utils/prayerGoalMap";
import {
  getPrayerFrameAchievementLabel,
  prayerFrameShowsInsights,
} from "@/src/utils/prayerGoalFrameMap";
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

const toDateString = (date: Date) => moment(date).format("YYYY-MM-DD");

const getNextUnloggedPrayer = (
  loggedPrayers: readonly PrayerName[],
): PrayerName => {
  const logged = new Set(loggedPrayers);
  return PRAYER_OPTIONS.find((prayer) => !logged.has(prayer)) ?? "fajr";
};

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

  const loggedPrayersForSelectedDate = useMemo((): PrayerName[] => {
    if (!dayDetail?.slots) return [];
    return PRAYER_OPTIONS.filter(
      (prayer) => dayDetail.slots?.[PRAYER_TO_SLOT[prayer]]?.logged === true,
    );
  }, [dayDetail]);

  const lockedPrayersForSelectedDate = useMemo((): PrayerName[] => {
    if (!dayDetail?.slots) return [];
    return PRAYER_OPTIONS.filter((prayer) => {
      const slot = dayDetail.slots?.[PRAYER_TO_SLOT[prayer]];
      if (!slot || slot.logged) return false;
      // Only backend `canLog: false` locks a slot (e.g. before today's window opens).
      // After the window passes, unlogged slots stay selectable so the user can
      // still log a forgotten on-time prayer as on-time vs qadha.
      return slot.canLog === false;
    });
  }, [dayDetail]);

  const selectablePrayers = useMemo(
    () =>
      PRAYER_OPTIONS.filter(
        (prayer) =>
          !loggedPrayersForSelectedDate.includes(prayer) &&
          !lockedPrayersForSelectedDate.includes(prayer),
      ),
    [loggedPrayersForSelectedDate, lockedPrayersForSelectedDate],
  );

  const hasSelectablePrayer = selectablePrayers.length > 0;

  const dayDetailLoadingState =
    flowMode === "active" &&
    (dayDetailLoading || dayDetailFetching || dayDetail == null);

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

  const goalLabel = frame?.goal.label ?? "---";
  const goalLabelParts = useMemo(() => {
    const match = goalLabel.match(/^(.*?)\s*(\(total\s+\d+\s+prayers?\))\s*$/i);
    if (!match) {
      return { title: goalLabel, totalSuffix: null as string | null };
    }
    return {
      title: match[1].trim(),
      totalSuffix: match[2],
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
    setStartHour(now.hour);
    setStartMinute(now.minute);
    setStartPeriod(now.period);
    setIsPeriodDropdownOpen(false);
    setDurationHours("0");
    setDurationMinutes("10");
  }, []);

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

  const handleConfirm = () => {
    if (isLogging) return;
    if (!selectedPrayer) return;

    const run = async () => {
      const prayedOnTime = timing === "onTime";
      const includeCongregation = isCongregationalTracked && prayedOnTime;
      const payload = {
        date: selectedDate,
        prayerSlot: PRAYER_TO_SLOT[selectedPrayer],
        prayedOnTime,
        wasQadha: !prayedOnTime,
        wasCongregational: includeCongregation ? congregation === "yes" : false,
        startTime: formatStartTimeForApi(),
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
      } catch {
        // onError handler already shows toast.
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
    if (currentStep === "prayerSelect") {
      if (dayDetailLoadingState) return;
      if (!hasSelectablePrayer) return;
      if (!selectedPrayer) return;
      if (loggedPrayersForSelectedDate.includes(selectedPrayer)) return;
      if (lockedPrayersForSelectedDate.includes(selectedPrayer)) return;
    }
    if (!isLastStep) setStepIndex((index) => index + 1);
  };

  const handleOpenFlow = useCallback(() => {
    if (frameLoading || isFullyAchieved) return;
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
            onSelectPrayer={setSelectedPrayer}
            categoryColor={Colors.light.green}
            loggedPrayers={loggedPrayersForSelectedDate}
            lockedPrayers={lockedPrayersForSelectedDate}
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
            onSelectValue={setTiming}
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
                  <FiveDailyPrayerIDetailedIbadhasIcon
                    color={Colors.light.white}
                    size={18}
                  />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
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
                    {goalLabelParts.totalSuffix ? (
                      <Text
                        style={[
                          localStyles.summaryTotalLine,
                          frameLoading && localStyles.loadingPlaceholderText,
                        ]}
                        numberOfLines={1}
                      >
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
                ) : (
                  <View style={localStyles.spacer} />
                )}

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
                  <AddLoggingFlowIcon />
                </TouchableOpacity>
              </View>
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
                        ? loggedPrayersForSelectedDate.includes(selectedPrayer) ||
                          lockedPrayersForSelectedDate.includes(selectedPrayer)
                        : false))
                  )
                }
                canConfirm={
                  isLastStep &&
                  !isLogging &&
                  !isFullyAchieved &&
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

const localStyles = StyleSheet.create({
  summaryCard: {
    backgroundColor: Colors.light.green,
    borderRadius: 8,
    padding: 16,
    gap: 12,
    height: FLOW_CARD_HEIGHT,
    width: "100%",
    justifyContent: "space-between",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: -6,
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
    fontFamily: fonts.primary.semiBold,
    fontSize: 10,
    fontWeight: "600",
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
    gap: 12,
  },
  summaryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  summaryTotalCount: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 14,
  },
  loadingPlaceholderText: {
    opacity: 0.35,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    width: 32,
    height: 32,
    borderRadius: 16,
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
