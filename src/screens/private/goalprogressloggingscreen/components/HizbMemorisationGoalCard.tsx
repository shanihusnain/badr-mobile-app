import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { AddLoggingFlowIcon, QuranMemorizationIcon } from "@/assets/icons";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { quranFrameCycleEnded, quranFrameShowsInsights } from "@/src/utils/quranGoalFrameMap";
import { GoalData } from "../../home/components/goalsData";
import QuranMemorisationHizbLoggingFlow from "../flows/QuranMemorisationHizbLoggingFlow";
import { useOptionalQuranGoalFrameContext } from "../quranGoalFrameContext";
import type { HizbMemorisationGoal } from "../quranMemorisationHizbGoals";
import { resolveHizbRangeLabel } from "../quranHizbVerseMap";
import type { QuranMemorisationHizbLogEntry } from "../types";
import { FLOW_CARD_HEIGHT, styles } from "./DailyProgressLogging.styles";
import { resolveQuranGoalCardStatusLabel } from "./resolveQuranGoalCardStatusLabel";
import { surahGoalStyles } from "./SurahRecitationGoals.styles";

type Props = {
  goal: HizbMemorisationGoal;
  goalData: GoalData;
  cardWidth: number;
  isInView: boolean;
  isFlowActive: boolean;
  onStartFlow: (goalId: string) => void;
  onFlowClose: () => void;
  onLogComplete?: (entry: QuranMemorisationHizbLogEntry) => void;
};

function isTotalVersesLabel(value: string) {
  return /^\(?\s*total\b/i.test(value) || /\bverses?\s*\)?\s*$/i.test(value);
}

export function HizbMemorisationGoalCard({
  goal,
  goalData,
  cardWidth,
  isInView,
  isFlowActive,
  onStartFlow,
  onFlowClose,
  onLogComplete,
}: Props) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const quranFrame = useOptionalQuranGoalFrameContext();
  const showInsights = quranFrame?.frame
    ? quranFrameShowsInsights(quranFrame.frame)
    : false;
  const isFullyAchieved =
    (quranFrame?.frame?.goal.achievementPct ?? 0) >= 100 ||
    goal.completed === true;

  const statusChip = useMemo(
    () =>
      resolveQuranGoalCardStatusLabel({
        status: goal.status,
        pillLabel: goal.pillLabel,
        progressPercent: goal.progressPercentage,
        completed: goal.completed,
        cycleEnded: quranFrame?.frame
          ? quranFrameCycleEnded(quranFrame.frame)
          : false,
        t,
        formatNumber,
      }),
    [
      formatNumber,
      goal.completed,
      goal.pillLabel,
      goal.progressPercentage,
      goal.status,
      quranFrame?.frame,
      t,
    ],
  );

  const totalAyahsLabel = formatNumber(goal.totalAyahs);
  const showTotalAyahs = goal.totalAyahs > 0;

  /** Figma: "Hizb 1 | Al-Fatiha 1:1 - Al-Baqarah 2:74" */
  const titleLabel = useMemo(() => {
    const name =
      goal.hizbName?.trim() ||
      (goal.displayName?.includes("|")
        ? goal.displayName.split("|")[0]!.trim()
        : goal.displayName?.trim()) ||
      "";
    const rawRange = goal.rangeLabel?.trim() || goal.subtitle?.trim() || "";
    const range =
      rawRange && !isTotalVersesLabel(rawRange)
        ? rawRange
        : resolveHizbRangeLabel(goal.itemNumber ?? goal.id);

    if (name.includes("|")) {
      const [left, ...rest] = name.split("|");
      const right = rest.join("|").trim();
      if (right && !isTotalVersesLabel(right)) return name;
      if (left?.trim() && range) return `${left.trim()} | ${range}`;
      return left?.trim() || name;
    }
    if (goal.displayName?.includes("|")) {
      const display = goal.displayName.trim();
      const [left, ...rest] = display.split("|");
      const right = rest.join("|").trim();
      if (right && !isTotalVersesLabel(right)) return display;
      if (left?.trim() && range) return `${left.trim()} | ${range}`;
      return left?.trim() || display;
    }
    if (name && range) return `${name} | ${range}`;
    return name || goal.displayName?.trim() || "";
  }, [
    goal.displayName,
    goal.hizbName,
    goal.id,
    goal.itemNumber,
    goal.rangeLabel,
    goal.subtitle,
  ]);

  const handleLogProgress = () => {
    onStartFlow(goal.id);
  };

  const handleFlowModeChange = (mode: "collapsed" | "active") => {
    if (mode === "collapsed") {
      onFlowClose();
    }
  };

  const canLog = goal.canLog !== false && !goal.completed;

  return (
    <View
      style={[
        { width: cardWidth, height: FLOW_CARD_HEIGHT },
        isFlowActive ? styles.activeSection : undefined,
      ]}
    >
      <View style={surahGoalStyles.cardAnchor}>
        {!isFlowActive ? (
          <View
            style={[
              surahGoalStyles.card,
              isInView
                ? surahGoalStyles.cardActive
                : surahGoalStyles.cardInactive,
            ]}
          >
            <View style={surahGoalStyles.bodyRow}>
              <View style={surahGoalStyles.iconCircle}>
                <QuranMemorizationIcon color={Colors.light.white} size={26} />
              </View>

              <View style={surahGoalStyles.textColumn}>
                <View
                  style={[
                    surahGoalStyles.statusChip,
                    statusChip.showPercent &&
                      surahGoalStyles.statusChipAchieved,
                  ]}
                >
                  <Text
                    style={[
                      surahGoalStyles.statusChipText,
                      statusChip.showPercent &&
                        surahGoalStyles.statusChipTextAchieved,
                    ]}
                  >
                    {statusChip.label}
                  </Text>
                </View>

                <View style={surahGoalStyles.textLines}>
                  <Text style={surahGoalStyles.surahName} numberOfLines={2}>
                    {titleLabel}
                  </Text>
                  {showTotalAyahs ? (
                    <Text style={surahGoalStyles.metaRegular}>
                      {`(total `}
                      <Text style={surahGoalStyles.metaBold}>
                        {totalAyahsLabel}
                      </Text>
                      {` verses)`}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={surahGoalStyles.footerRow}>
              {showInsights ? (
                <TouchableOpacity
                  style={surahGoalStyles.insightsBtn}
                  onPress={() => quranFrame?.openInsights?.()}
                  activeOpacity={0.8}
                  hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                >
                  <Text style={surahGoalStyles.insightsText}>
                    {t("progressLogging.viewInsights")}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={22}
                    color={Colors.light.white}
                  />
                </TouchableOpacity>
              ) : null}
            </View>

            {canLog ? (
              <TouchableOpacity
                style={[
                  surahGoalStyles.addButtonIconOnly,
                  isFullyAchieved && surahGoalStyles.addButtonDisabled,
                ]}
                onPress={handleLogProgress}
                activeOpacity={0.8}
                disabled={isFullyAchieved}
              >
                <AddLoggingFlowIcon size={32} />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <QuranMemorisationHizbLoggingFlow
            goalData={goalData}
            preselectedHizbId={goal.id}
            activeHizbGoal={goal}
            hideCollapsedSummary
            embedded
            suppressOverlay
            flowMode="active"
            onFlowModeChange={handleFlowModeChange}
            onLogComplete={onLogComplete}
          />
        )}
      </View>
    </View>
  );
}
