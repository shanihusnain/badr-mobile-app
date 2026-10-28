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
import { formatProgressLoggingDateLabel } from "../progressLoggingConfig";
import { CounterStep } from "../components/CounterStep";
import {
  StartTimeStep,
  DurationStep,
  getCurrentStartTimeParts,
} from "../components/TimePickerSteps";
import { FlowCard } from "../components/FlowCard";
import {
  styles as commonStyles,
  FLOW_CARD_HEIGHT,
} from "../components/DailyProgressLogging.styles";
import { fonts } from "@/assets/fonts";
import {
  AddLoggingFlowIcon,
  CalendarFlippingIcon,
  FlowCardFoodReliefIcon,
  WhiteClockIcon,
  WhiteTimerIcon,
} from "@/assets/icons";
import type { ProgressLogEntry } from "../types";
import { useOptionalSadaqahGoalFrameContext } from "../sadaqahGoalFrameContext";
import { useLogSadaqahGoal } from "@/src/api/mutations/useLogSadaqahGoal";
import {
  getFidyaFrameFlowCardTitle,
  getSadaqahFrameAchievementLabel,
  getSadaqahFrameAchievementPct,
  sadaqahFrameShowsInsights,
} from "@/src/utils/sadaqahGoalFrameMap";

type FidyaStepId = "date" | "count" | "start-time" | "time-spent";

const STEPS: FidyaStepId[] = ["date", "count", "start-time", "time-spent"];

type Props = {
  goalData: GoalData;
  onLogComplete?: (entry: ProgressLogEntry) => void;
};

type FlowMode = "collapsed" | "active";

const toDateString = (date: Date) => moment(date).format("YYYY-MM-DD");

function formatStartTimeForApi(
  hour: string,
  minute: string,
  period: "am" | "pm",
): string {
  const hourNum = parseInt(hour || "0", 10) || 0;
  const minuteNum = parseInt(minute || "0", 10) || 0;
  let hour24 = hourNum % 12;
  if (period === "pm") hour24 += 12;
  return `${String(Math.max(0, hour24)).padStart(2, "0")}:${String(
    Math.max(0, minuteNum),
  ).padStart(2, "0")}`;
}

export default function FidyaLoggingFlow({ goalData, onLogComplete }: Props) {
  const { t } = useTranslation();
  const sadaqahFrame = useOptionalSadaqahGoalFrameContext();
  const frame = sadaqahFrame?.frame;
  const { mutateAsync: logSadaqah, isPending: isLogging } = useLogSadaqahGoal();

  const [flowMode, setFlowMode] = useState<FlowMode>("collapsed");
  const [stepIndex, setStepIndex] = useState(0);

  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [count, setCount] = useState("0");

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

  const badgeStatus = useMemo(() => {
    if (!frame) {
      return {
        text: t("progressLogging.notStarted"),
        type: "not-started" as const,
      };
    }
    return getSadaqahFrameAchievementLabel(frame, t);
  }, [frame, t]);

  const summaryTitle = frame
    ? getFidyaFrameFlowCardTitle(frame)
    : "Fidya for Missed Fasts";
  const achievementPct = getSadaqahFrameAchievementPct(frame);
  const showInsights = frame ? sadaqahFrameShowsInsights(frame) : false;
  const canLog = frame ? Boolean(frame.items?.[0]?.canLog ?? true) : true;
  const goalCompleted =
    achievementPct >= 100 ||
    String(frame?.goal?.status ?? "").toUpperCase() === "COMPLETED";

  const todayString = toDateString(new Date());
  const currentStep = STEPS[stepIndex] ?? "date";
  const isLastStep = stepIndex === STEPS.length - 1;

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

  const resetFlow = useCallback(() => {
    const now = getCurrentStartTimeParts();
    setFlowMode("collapsed");
    setStepIndex(0);
    setSelectedDate(toDateString(new Date()));
    setCount("0");
    setStartHour(now.hour);
    setStartMinute(now.minute);
    setStartPeriod(now.period);
    setDurationHours("0");
    setDurationMinutes("0");
    setIsPeriodDropdownOpen(false);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedDate || isLogging) return;
    const numericCount = Number.parseInt(count || "0", 10) || 0;
    if (numericCount <= 0) return;

    const hours = parseInt(durationHours || "0", 10) || 0;
    const minutes = parseInt(durationMinutes || "0", 10) || 0;
    const durationTotalMinutes = hours * 60 + minutes;
    if (durationTotalMinutes < 1) return;

    const startTime = formatStartTimeForApi(
      startHour,
      startMinute,
      startPeriod,
    );

    const run = async () => {
      try {
        const result = await logSadaqah({
          sadaqahType: "FIDYA",
          logDate: selectedDate,
          amount: numericCount,
          startTime,
          durationMinutes: durationTotalMinutes,
        });
        await sadaqahFrame?.refetch();
        onLogComplete?.({
          type: "fidya" as any,
          goalId: goalData.id,
          date: result.logDate ?? result.date ?? selectedDate,
          count: String(result.amount ?? numericCount),
          startTime: result.startTime ?? startTime,
          durationMinutes: result.durationMinutes ?? durationTotalMinutes,
        } as any);
        resetFlow();
      } catch {
        // Toast handled in mutation onError
      }
    };

    void run();
  }, [
    count,
    durationHours,
    durationMinutes,
    goalData.id,
    isLogging,
    logSadaqah,
    onLogComplete,
    resetFlow,
    sadaqahFrame,
    selectedDate,
    startHour,
    startMinute,
    startPeriod,
  ]);

  const handleBack = () => {
    if (stepIndex === 0) {
      resetFlow();
      return;
    }
    setIsPeriodDropdownOpen(false);
    setStepIndex((i) => i - 1);
  };

  const isStepValid = (step: FidyaStepId) => {
    switch (step) {
      case "date":
      case "start-time":
        return true;
      case "count":
        return (Number.parseInt(count || "0", 10) || 0) > 0;
      case "time-spent": {
        const hours = parseInt(durationHours || "0", 10) || 0;
        const minutes = parseInt(durationMinutes || "0", 10) || 0;
        return hours * 60 + minutes >= 1;
      }
      default:
        return true;
    }
  };

  const canGoForward =
    !isLogging && !isLastStep && isStepValid(currentStep);

  const handleForward = () => {
    if (!canGoForward) return;
    setIsPeriodDropdownOpen(false);
    setStepIndex((i) => i + 1);
  };

  const handleOpenFlow = useCallback(() => {
    if (!canLog || goalCompleted) return;
    setFlowMode("active");
  }, [canLog, goalCompleted]);

  const getStepHeader = (step: FidyaStepId) => {
    switch (step) {
      case "date":
        return {
          icon: <CalendarFlippingIcon size={24} />,
          label: t("progressLogging.whichDay"),
        };
      case "count":
        return {
          icon: (
            <FlowCardFoodReliefIcon size={19} color={Colors.light.white} />
          ),
          label: t("progressLogging.kaffarahHowManyMeals"),
        };
      case "start-time":
        return {
          icon: <WhiteClockIcon size={26} />,
          label: t("progressLogging.enterStartTime"),
        };
      case "time-spent":
        return {
          icon: <WhiteTimerIcon size={24} />,
          label: t("progressLogging.enterTimeSpent"),
        };
    }
  };

  const renderStepContent = (step: FidyaStepId) => {
    switch (step) {
      case "date":
        return (
          <DateStep
            dateLabel={dateLabel}
            selectedDate={selectedDate}
            todayString={todayString}
            onShiftDate={shiftDate}
            styles={commonStyles}
          />
        );
      case "count":
        return (
          <CounterStep
            label={t("progressLogging.kaffarahMealsLabel")}
            unit={t("progressLogging.kaffarahMealsUnit")}
            value={count}
            onChangeText={setCount}
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
  const durationTotalMinutes =
    (parseInt(durationHours || "0", 10) || 0) * 60 +
    (parseInt(durationMinutes || "0", 10) || 0);
  const canConfirm =
    isLastStep &&
    !isLogging &&
    (Number.parseInt(count || "0", 10) || 0) > 0 &&
    durationTotalMinutes >= 1;

  return (
    <>
      {flowMode === "active" && <Pressable style={commonStyles.backdrop} />}
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
                  <FlowCardFoodReliefIcon
                    size={19}
                    color={Colors.light.white}
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
                  <Text style={localStyles.summaryTitle} numberOfLines={3}>
                    {summaryTitle}
                  </Text>
                </View>
              </View>

              <View style={localStyles.footerRow}>
                {showInsights ? (
                  <TouchableOpacity
                    style={localStyles.insightsBtn}
                    onPress={sadaqahFrame?.openInsights}
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

              {canLog && !goalCompleted ? (
                <TouchableOpacity
                  style={localStyles.addButton}
                  onPress={handleOpenFlow}
                  activeOpacity={0.8}
                >
                  <AddLoggingFlowIcon size={32} />
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <View
              style={[
                commonStyles.flowCardLayer,
                isPeriodDropdownOpen &&
                  commonStyles.flowCardLayerDropdownOpen,
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
                canConfirm={canConfirm}
                showConfirmButton={isLastStep}
                styles={commonStyles}
                style={[
                  commonStyles.inPlaceFlowCard,
                  isPeriodDropdownOpen && commonStyles.flowCardDropdownOpen,
                ]}
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.selectcategory,
    alignItems: "center",
    justifyContent: "center",
    // Align with title (below badge) — same offset as prayer summary cards.
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
});
