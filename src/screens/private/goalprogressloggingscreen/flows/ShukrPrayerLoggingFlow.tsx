import React, { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import moment from "moment-hijri";
import { Colors } from "@/constants/theme";
import { GoalData } from "../../home/components/goalsData";
import { DateStep } from "../components/DateStep";
import { PrayerQuantityInputStep } from "../components/PrayerQuantityInputStep";
import { StartTimeStep, DurationStep, getCurrentStartTimeParts, isDurationEntered } from "../components/TimePickerSteps";
import { FlowCard } from "../components/FlowCard";
import {
  styles as commonStyles,
  FLOW_CARD_HEIGHT,
} from "../components/DailyProgressLogging.styles";
import { fonts } from "@/assets/fonts";
import type { ProgressLogEntry } from "../types";
import { useOptionalPrayerGoalFrameContext } from "../prayerGoalFrameContext";
import {
  getPrayerFrameAchievementLabel,
  prayerFrameShowsInsights,
} from "@/src/utils/prayerGoalFrameMap";
import { useLogShukrPrayerGoal } from "@/src/api/mutations/useLogShukrPrayerGoal";
import {
  AddLoggingFlowIcon,
  CalendarFlippingIcon,
  WhiteClockIcon,
  WhitePrayerMatIcon,
  WhiteTimerIcon,
} from "@/assets/icons";
import { ShukrPrayerDetailedIbadhasIcon } from "@/assets/icons/ShukrPrayerDetailedIbadhasIcon";

type ShukrPrayerStepId =
  | "date"
  | "prayers-quantity"
  | "start-time"
  | "time-spent";
const STEPS: ShukrPrayerStepId[] = [
  "date",
  "prayers-quantity",
  "start-time",
  "time-spent",
];

type Props = {
  goalData: GoalData;
  onLogComplete?: (entry: ProgressLogEntry) => void;
};

type FlowMode = "collapsed" | "active";

const toDateString = (date: Date) => moment(date).format("YYYY-MM-DD");
const toCalendarDate = (value: string) => {
  const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : moment(value).format("YYYY-MM-DD");
};

export default function ShukrPrayerLoggingFlow({
  goalData,
  onLogComplete,
}: Props) {
  const { t } = useTranslation();
  const { mutateAsync: logShukr, isPending: isLogging } = useLogShukrPrayerGoal();

  const [flowMode, setFlowMode] = useState<FlowMode>("collapsed");
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [prayersCount, setPrayersCount] = useState("1");
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

  const cycleStartHijri = frame?.cycle?.cycleStart
    ? toCalendarDate(frame.cycle.cycleStart)
    : undefined;
  const cycleEndHijri = frame?.cycle?.cycleEnd
    ? toCalendarDate(frame.cycle.cycleEnd)
    : undefined;

  const goalLabel = frame?.goal.label ?? "---";

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
  const quantityValue = parseInt(prayersCount || "0", 10) || 0;

  const todayString = toDateString(new Date());
  const maxSelectableDate = cycleEndHijri
    ? cycleEndHijri < todayString
      ? cycleEndHijri
      : todayString
    : todayString;

  React.useEffect(() => {
    if (!cycleStartHijri) return;
    const minDate =
      cycleStartHijri <= maxSelectableDate
        ? cycleStartHijri
        : maxSelectableDate;
    setSelectedDate((prev) => {
      if (prev < minDate) return minDate;
      if (prev > maxSelectableDate) return maxSelectableDate;
      return prev;
    });
  }, [cycleStartHijri, maxSelectableDate]);

  const currentStep = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  const dateLabel =
    selectedDate === todayString
      ? t("progressLogging.today")
      : moment(selectedDate, "YYYY-MM-DD").format("MMM DD");

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

    if (cycleStartHijri && direction === -1 && next < cycleStartHijri) return;
    if (direction === 1 && next > maxSelectableDate) return;

    setSelectedDate(next);
  };

  const resetFlow = useCallback(() => {
    const now = getCurrentStartTimeParts();
    setFlowMode("collapsed");
    setStepIndex(0);
    setSelectedDate(toDateString(new Date()));
    setPrayersCount("1");
    setStartHour(now.hour);
    setStartMinute(now.minute);
    setStartPeriod(now.period);
    setDurationHours("0");
    setDurationMinutes("10");
    setIsPeriodDropdownOpen(false);
  }, []);

  const handleConfirm = () => {
    if (isLogging || quantityValue < 1) return;

    const run = async () => {
      const payload = {
        date: selectedDate,
        count: quantityValue,
        startTime: formatStartTimeForApi(),
        durationMinutes: buildDurationMinutesForApi(),
      };

      try {
        await logShukr(payload);
        await prayerFrame?.refetch();

        onLogComplete?.({
          type: "shukr-prayer",
          goalId: goalData.id,
          date: selectedDate,
          prayersCount,
          startTime: payload.startTime,
          durationMinutes: payload.durationMinutes,
        } as any);
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
    if (currentStep === "prayers-quantity" && quantityValue < 1) return;
    if (!isLastStep) setStepIndex((index) => index + 1);
  };

  const handleOpenFlow = useCallback(() => {
    if (frameLoading || isFullyAchieved) return;
    setFlowMode("active");
  }, [frameLoading, isFullyAchieved]);

  const getStepHeader = (step: ShukrPrayerStepId) => {
    switch (step) {
      case "date":
        return {
          icon: <CalendarFlippingIcon size={24} />,
          label: "Which day are you logging for?",
        };
      case "prayers-quantity":
        return {
          icon: <WhitePrayerMatIcon size={26} />,
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
    }
  };

  const renderStepContent = (step: ShukrPrayerStepId) => {
    switch (step) {
      case "date":
        return (
          <DateStep
            dateLabel={dateLabel}
            selectedDate={selectedDate}
            todayString={todayString}
            minSelectableDate={cycleStartHijri}
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
                  <ShukrPrayerDetailedIbadhasIcon
                    color={Colors.light.white}
                    size={25}
                  />
                </View>
                <View style={{ flex: 1, gap: 9 }}>
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
                  <Text
                    style={[
                      localStyles.summaryTitle,
                      { flex: undefined },
                      frameLoading && localStyles.loadingPlaceholderText,
                    ]}
                    numberOfLines={2}
                  >
                    {goalLabel}
                  </Text>
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
                  !(currentStep === "prayers-quantity" && quantityValue < 1)
                }
                canGoBack={stepIndex > 0}
                canConfirm={
                  isLastStep &&
                  !isLogging &&
                  quantityValue >= 1 &&
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
    marginTop: 33,
  },
  summaryTitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
    letterSpacing: 0,
    flex: 1,
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
