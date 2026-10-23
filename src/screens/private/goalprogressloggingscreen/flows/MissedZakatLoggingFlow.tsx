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
import { FinancialInputStep } from "../components/FinancialInputStep";
import {
  StartTimeStep,
  DurationStep,
  getCurrentStartTimeParts,
} from "../components/TimePickerSteps";
import { FlowCard } from "../components/FlowCard";
import { styles as commonStyles } from "../components/DailyProgressLogging.styles";
import { fonts } from "@/assets/fonts";
import { FlowCardZakatIcon } from "@/assets/icons/FlowCardZakatIcon";
import type { ProgressLogEntry } from "../types";
import { FlowCardCallender, TimeSpentIcon } from "@/assets/icons";
import { FlowCardWalletIcon } from "@/assets/icons/FlowCardWalletIcon";
import { FlowCardClockIcon } from "@/assets/icons/FlowCardClockIcon";
import { useOptionalSadaqahGoalFrameContext } from "../sadaqahGoalFrameContext";
import { useLogSadaqahGoal } from "@/src/api/mutations/useLogSadaqahGoal";
import {
  getSadaqahFrameAchievementLabel,
  getSadaqahFrameAchievementPct,
  getSadaqahFrameCurrencyCode,
  getSadaqahFrameFlowCardTitle,
  sadaqahFrameShowsInsights,
} from "@/src/utils/sadaqahGoalFrameMap";

type MissedZakatStepId =
  | "date"
  | "financial-amount"
  | "start-time"
  | "time-spent";
const STEPS: MissedZakatStepId[] = [
  "date",
  "financial-amount",
  "start-time",
  "time-spent",
];

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

export default function MissedZakatLoggingFlow({
  goalData,
  onLogComplete,
}: Props) {
  const { t } = useTranslation();
  const sadaqahFrame = useOptionalSadaqahGoalFrameContext();
  const frame = sadaqahFrame?.frame;
  const { mutateAsync: logSadaqah, isPending: isLogging } = useLogSadaqahGoal();

  const [flowMode, setFlowMode] = useState<FlowMode>("collapsed");
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [amount, setAmount] = useState("0");
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
  const [durationMinutes, setDurationMinutes] = useState("00");

  const badgeStatus = useMemo(() => {
    if (!frame) {
      return {
        text: t("progressLogging.notStarted"),
        type: "not-started" as const,
      };
    }
    return getSadaqahFrameAchievementLabel(frame, t);
  }, [frame, t]);

  const currencyCode = getSadaqahFrameCurrencyCode(frame);
  const summaryTitle = frame
    ? getSadaqahFrameFlowCardTitle(frame)
    : `${currencyCode} Toward Missed Zakat`;
  const achievementPct = getSadaqahFrameAchievementPct(frame);
  const showInsights = frame ? sadaqahFrameShowsInsights(frame) : false;
  const canLog = frame ? Boolean(frame.items?.[0]?.canLog ?? true) : true;
  const goalCompleted =
    achievementPct >= 100 ||
    String(frame?.goal?.status ?? "").toUpperCase() === "COMPLETED";

  const todayString = toDateString(new Date());
  const currentStep = STEPS[stepIndex];
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
    setAmount("0");
    setStartHour(now.hour);
    setStartMinute(now.minute);
    setStartPeriod(now.period);
    setDurationHours("0");
    setDurationMinutes("10");
    setIsPeriodDropdownOpen(false);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedDate || isLogging) return;
    const numericAmount = Number.parseFloat(amount) || 0;
    if (numericAmount <= 0) return;

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
          sadaqahType: "MISSED_ZAKAT",
          logDate: selectedDate,
          amount: numericAmount,
          startTime,
          durationMinutes: durationTotalMinutes,
        });
        await sadaqahFrame?.refetch();
        onLogComplete?.({
          type: "missed-zakat" as any,
          goalId: goalData.id,
          date: result.logDate ?? result.date ?? selectedDate,
          amount: String(result.amount ?? numericAmount),
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
    amount,
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
    setStepIndex((i) => i - 1);
  };

  const handleForward = () => {
    if (!isLastStep) setStepIndex((i) => i + 1);
  };

  const handleOpenFlow = useCallback(() => {
    if (!canLog || goalCompleted) return;
    setFlowMode("active");
  }, [canLog, goalCompleted]);

  const getStepHeader = (step: MissedZakatStepId) => {
    switch (step) {
      case "date":
        return {
          icon: <FlowCardCallender size={20} color={Colors.light.white} />,
          label: "Which day are you logging for?",
        };
      case "financial-amount":
        return {
          icon: <FlowCardWalletIcon size={20} color={Colors.light.white} />,
          label: "How much did you fulfill?",
        };
      case "start-time":
        return {
          icon: <FlowCardClockIcon size={20} color={Colors.light.white} />,
          label: "Enter start time.",
        };
      case "time-spent":
        return {
          icon: <TimeSpentIcon size={20} color={Colors.light.white} />,
          label: "Enter time spent.",
        };
    }
  };

  const renderStepContent = (step: MissedZakatStepId) => {
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
      case "financial-amount":
        return (
          <FinancialInputStep
            amount={amount}
            setAmount={setAmount}
            currencySymbol={currencyCode}
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
  const durationTotalMinutes =
    (parseInt(durationHours || "0", 10) || 0) * 60 +
    (parseInt(durationMinutes || "0", 10) || 0);
  const canConfirm =
    isLastStep &&
    !isLogging &&
    (Number.parseFloat(amount) || 0) > 0 &&
    durationTotalMinutes >= 1;

  return (
    <View style={commonStyles.section}>
      <Text style={commonStyles.sectionTitle}>
        {t("progressLogging.myProgress")}
      </Text>

      <View style={commonStyles.cardAnchor}>
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

        {flowMode === "collapsed" ? (
          <View style={localStyles.summaryCard}>
            <View style={localStyles.summaryBody}>
              <View style={localStyles.summaryIconCircle}>
                <FlowCardZakatIcon size={20} color={Colors.light.white} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
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
                <Text style={[localStyles.summaryTitle, { flex: undefined }]}>
                  {summaryTitle}
                </Text>
              </View>
            </View>

            <View style={localStyles.footerRow}>
              {showInsights ? (
                <TouchableOpacity
                  style={localStyles.insightsBtn}
                  onPress={sadaqahFrame?.openInsights}
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

              {canLog && !goalCompleted ? (
                <TouchableOpacity
                  style={localStyles.addButton}
                  onPress={handleOpenFlow}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={22} color={Colors.light.white} />
                </TouchableOpacity>
              ) : null}
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
              canGoForward={!isLastStep}
              canGoBack={stepIndex > 0}
              canConfirm={canConfirm}
              showConfirmButton={isLastStep}
              styles={commonStyles}
              style={commonStyles.inPlaceFlowCard}
            >
              {renderStepContent(currentStep)}
            </FlowCard>
          </View>
        )}
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  summaryCard: {
    backgroundColor: Colors.light.green,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    position: "relative",
    overflow: "hidden",
    height: 145,
  },
  summaryBody: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  summaryIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: -6,
  },
  badgeInProgress: {
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  badgeCompleted: {
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  badgeText: {
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  badgeTextInProgress: {
    color: Colors.light.lightblue,
  },
  badgeTextCompleted: {
    color: Colors.light.green,
  },
  summaryTitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 15,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 16,
  },
  insightsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  insightsText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.bold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.light.white,
    alignItems: "center",
    justifyContent: "center",
  },
  spacer: {
    flex: 1,
  },
});
