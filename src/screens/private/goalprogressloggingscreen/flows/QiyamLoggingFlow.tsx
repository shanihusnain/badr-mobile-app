import React, { useCallback, useState } from "react";
import { Pressable, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import moment from "moment-hijri";
import { Colors } from "@/constants/theme";
import { GoalData } from "../../home/components/goalsData";
import { DateStep } from "../components/DateStep";
import { formatProgressLoggingDateLabel } from "../progressLoggingConfig";
import { PrayerQuantityInputStep } from "../components/PrayerQuantityInputStep";
import { StartTimeStep, DurationStep } from "../components/TimePickerSteps";
import { FlowCard } from "../components/FlowCard";
import { styles as commonStyles, FLOW_CARD_HEIGHT } from "../components/DailyProgressLogging.styles";
import { fonts } from "@/assets/fonts";
import { AddLoggingFlowIcon } from "@/assets/icons";
import type { ProgressLogEntry } from "../types";

const QiyamTimingStep = ({
  loggedTime,
  setLoggedTime,
  isOpen,
  setIsOpen,
}: {
  loggedTime: "after-isha" | "before-fajr";
  setLoggedTime: (val: "after-isha" | "before-fajr") => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  styles: any;
}) => {
  const options = [
    { value: "after-isha", label: "After Isha", icon: "star-crescent" },
    { value: "before-fajr", label: "Before Fajr (Tahajjud)", icon: "human-handsdown" },
  ];

  const selectedOption = options.find(o => o.value === loggedTime);

  return (
    <View style={{ width: '100%', marginTop: 8 }}>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor: Colors.light.white,
          borderRadius: 6,
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 0, marginRight: 8 }}>
          <MaterialCommunityIcons name={selectedOption?.icon as any} size={16} color={Colors.light.white} />
          <Text style={{ color: Colors.light.white, fontFamily: fonts.primary.semiBold, fontSize: 13, fontWeight: '600', flexShrink: 1 }} numberOfLines={1}>
            {selectedOption?.label}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={14} color={Colors.light.white} />
      </TouchableOpacity>

      {isOpen && (
        <View style={{
          backgroundColor: Colors.light.blackBackground,
          borderRadius: 6,
          marginTop: 10,
        }}>
          {options.filter(opt => opt.value !== loggedTime).map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 10,
                paddingVertical: 10,
                gap: 8,
              }}
              onPress={() => {
                setLoggedTime(opt.value as any);
                setIsOpen(false);
              }}
              activeOpacity={0.8}
            >
              <View style={{
                width: 14, height: 14, borderRadius: 7,
                borderWidth: 1.5, borderColor: Colors.light.green,
                alignItems: 'center', justifyContent: 'center'
              }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.light.green }} />
              </View>
              <MaterialCommunityIcons name={opt.icon as any} size={15} color={Colors.light.white} />
              <Text style={{ color: Colors.light.white, fontFamily: fonts.primary.semiBold, fontSize: 13, fontWeight: '600' }}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {!isOpen && (
        <Text style={{ color: Colors.light.white, fontFamily: fonts.primary.regular, fontSize: 11, lineHeight: 15, opacity: 0.9, marginTop: 6 }}>
          {loggedTime === "before-fajr"
            ? "(Rising from sleep in the final third of the night to pray before the Fajr Adhan.)"
            : "(Praying in the early part of the night, before sleeping.)"
          }
        </Text>
      )}
    </View>
  );
};

type QiyamStepId = "date" | "prayers-quantity" | "when-pray" | "start-time" | "time-spent";
const STEPS: QiyamStepId[] = ["date", "prayers-quantity", "when-pray", "start-time", "time-spent"];

type Props = { goalData: GoalData; onLogComplete?: (entry: ProgressLogEntry) => void; };
type FlowMode = "collapsed" | "active";
const toDateString = (date: Date) => moment(date).format("YYYY-MM-DD");

export default function QiyamLoggingFlow({ goalData, onLogComplete }: Props) {
  const { t } = useTranslation();
  const [flowMode, setFlowMode] = useState<FlowMode>("collapsed");
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [prayersCount, setPrayersCount] = useState("4");
  const [loggedTime, setLoggedTime] = useState<"after-isha" | "before-fajr">("before-fajr");
  const [isTimingDropdownOpen, setIsTimingDropdownOpen] = useState(false);
  const [startHour, setStartHour] = useState("02");
  const [startMinute, setStartMinute] = useState("00");
  const [startPeriod, setStartPeriod] = useState<"am" | "pm">("am");
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [durationHours, setDurationHours] = useState("0");
  const [durationMinutes, setDurationMinutes] = useState("20");
  const MOCK_PERCENTAGE = 40;
  const totalPrayersRequired = 40;
  const mockTitle = `${totalPrayersRequired} 2-Rak'ah Qiyam Al-Layl Prayers`;
  const [hasLogged, setHasLogged] = useState(false);

  const getBadgeStatus = () => {
    if (!hasLogged) return { text: "In Progress", type: "in-progress" };
    if (MOCK_PERCENTAGE >= 100) return { text: "100% Achieved!", type: "completed" };
    return { text: `${MOCK_PERCENTAGE}% Achieved`, type: "completed" };
  };

  const badgeStatus = getBadgeStatus();
  const isCompleted = hasLogged;
  const todayString = toDateString(new Date());
  const currentStep = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;
  const dateLabel = formatProgressLoggingDateLabel(selectedDate, todayString, t("progressLogging.today"));

  const shiftDate = (direction: -1 | 1) => {
    const next = moment(selectedDate, "YYYY-MM-DD").add(direction, "days").format("YYYY-MM-DD");
    if (direction === 1 && next > todayString) return;
    setSelectedDate(next);
  };

  const resetFlow = useCallback(() => {
    setFlowMode("collapsed"); setStepIndex(0); setSelectedDate(toDateString(new Date()));
    setPrayersCount("4"); setLoggedTime("before-fajr"); setIsTimingDropdownOpen(false); setStartHour("02"); setStartMinute("00"); setStartPeriod("am");
    setDurationHours("0"); setDurationMinutes("20"); setIsPeriodDropdownOpen(false);
  }, []);

  const handleConfirm = () => {
    setHasLogged(true);
    onLogComplete?.({ type: "qiyam-al-layl", goalId: goalData.id, date: selectedDate, prayersCount, loggedTime, startTime: `${startHour}:${startMinute} ${startPeriod}`, durationHours, durationMinutes } as any);
    resetFlow();
  };

  const handleBack = () => { if (stepIndex === 0) { resetFlow(); return; } setStepIndex((i) => i - 1); };
  const handleForward = () => { if (!isLastStep) setStepIndex((i) => i + 1); };
  const handleOpenFlow = useCallback(() => { setFlowMode("active"); }, []);

  const getStepHeader = (step: QiyamStepId) => {
    switch (step) {
      case "date": return { icon: <Ionicons name="calendar-outline" size={15} color={Colors.light.white} />, label: "Which night are you logging for?" };
      case "prayers-quantity": return { icon: <MaterialCommunityIcons name="star-crescent" size={16} color={Colors.light.white} />, label: "How many 2-rak'ah prayers did you pray?" };
      case "when-pray": return { icon: <MaterialCommunityIcons name="star-crescent" size={16} color={Colors.light.white} />, label: "When did you pray?" };
      case "start-time": return { icon: <Ionicons name="time-outline" size={15} color={Colors.light.white} />, label: "Enter start time." };
      case "time-spent": return { icon: <Ionicons name="timer-outline" size={15} color={Colors.light.white} />, label: "Enter time spent." };
    }
  };

  const renderStepContent = (step: QiyamStepId) => {
    switch (step) {
      case "date": return <DateStep dateLabel={dateLabel} selectedDate={selectedDate} todayString={todayString} onShiftDate={shiftDate} styles={commonStyles} />;
      case "prayers-quantity": return <PrayerQuantityInputStep quantity={prayersCount} setQuantity={setPrayersCount} styles={commonStyles} />;
      case "when-pray": return <QiyamTimingStep loggedTime={loggedTime} setLoggedTime={setLoggedTime} isOpen={isTimingDropdownOpen} setIsOpen={setIsTimingDropdownOpen} styles={commonStyles} />;
      case "start-time": return <StartTimeStep startHour={startHour} setStartHour={setStartHour} startMinute={startMinute} setStartMinute={setStartMinute} startPeriod={startPeriod} setStartPeriod={setStartPeriod} isPeriodDropdownOpen={isPeriodDropdownOpen} setIsPeriodDropdownOpen={setIsPeriodDropdownOpen} styles={commonStyles} />;
      case "time-spent": return <DurationStep durationHours={durationHours} setDurationHours={setDurationHours} durationMinutes={durationMinutes} setDurationMinutes={setDurationMinutes} styles={commonStyles} />;
    }
  };

  const stepHeader = getStepHeader(currentStep);

  return (
    <View style={commonStyles.section}>
      <Text style={commonStyles.sectionTitle}>{t("progressLogging.myProgress")}</Text>
      <View style={commonStyles.cardAnchor}>
        {flowMode === "active" && <Pressable style={commonStyles.backdrop} onPress={resetFlow} />}
        {flowMode === "active" && <TouchableOpacity style={commonStyles.cancelButton} onPress={resetFlow} activeOpacity={0.8}><Ionicons name="close" size={20} color={Colors.light.white} /></TouchableOpacity>}
        {flowMode === "collapsed" ? (
          <View style={localStyles.summaryCard}>
            <View style={localStyles.summaryBody}>
              <View style={localStyles.summaryIconCircle}>
                <MaterialCommunityIcons
                  name="star-crescent"
                  size={25}
                  color={Colors.light.white}
                />
              </View>
              <View style={{ flex: 1, gap: 9 }}>
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
                  {mockTitle}
                </Text>
              </View>
            </View>

            <View style={localStyles.footerRow}>
              {isCompleted ? (
                <TouchableOpacity style={localStyles.insightsBtn}>
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
              style={localStyles.addButton}
              onPress={handleOpenFlow}
              activeOpacity={0.8}
            >
              <AddLoggingFlowIcon size={32} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={commonStyles.flowCardLayer}>
            <FlowCard headerIcon={stepHeader.icon} headerLabel={stepHeader.label} onBack={handleBack} onForward={handleForward} onConfirm={handleConfirm} canGoForward={!isLastStep} styles={commonStyles} style={[commonStyles.inPlaceFlowCard, currentStep === "when-pray" ? { height: 210 } : {}]}>
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
  badgeRow: {
    flexDirection: "row",
    marginLeft: 14,
  },
  spacer: {
    flex: 1,
  },
});