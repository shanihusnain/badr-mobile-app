import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import {
  AddLoggingFlowIcon,
  QuranRecitationBySurahFlowCardImage,
} from "@/assets/icons";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { quranFrameShowsInsights } from "@/src/utils/quranGoalFrameMap";
import { GoalData } from "../../home/components/goalsData";
import QuranJuzLoggingFlow from "../flows/QuranJuzLoggingFlow";
import { useOptionalQuranGoalFrameContext } from "../quranGoalFrameContext";
import type { QuranJuzLogEntry } from "../types";
import { styles } from "./DailyProgressLogging.styles";
import { surahGoalStyles } from "./SurahRecitationGoals.styles";

type Props = {
  goalData: GoalData;
  isFlowActive: boolean;
  onStartFlow: () => void;
  onFlowClose: () => void;
  onLogComplete?: (entry: QuranJuzLogEntry) => void;
};

/**
 * RECITATION_JUZ My Progress card — ONE AGGREGATE card from the frame
 * ("From Juz X to Juz Y (total N Juz)"), never mock progress.
 */
export function JuzRecitationGoalCard({
  goalData,
  isFlowActive,
  onStartFlow,
  onFlowClose,
  onLogComplete,
}: Props) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const quranFrame = useOptionalQuranGoalFrameContext();
  const frame = quranFrame?.frame;
  const frameItem = frame?.items?.[0];

  const frameTitle = frameItem?.title?.trim() || frame?.title?.trim() || "";

  const parsedRange = useMemo(() => {
    const match = frameTitle.match(
      /^From\s+Juz\s+(\d+)\s+to\s+Juz\s+(\d+)/i,
    );
    if (!match) return null;
    return {
      start: Number(match[1]),
      end: Number(match[2]),
    };
  }, [frameTitle]);

  const rangeTitle =
    frameTitle ||
    t("progressLogging.juzCardTitleFallback");

  const totalFromTitle = frameTitle.match(
    /\(\s*total\s+(\d+)\s+juz\s*\)/i,
  );
  // Prefer title / range count. Frame `target` is often ayahs (e.g. 4362), not juz.
  const totalFromRange =
    parsedRange && parsedRange.end >= parsedRange.start
      ? parsedRange.end - parsedRange.start + 1
      : 0;
  const totalFromTarget = (() => {
    const raw =
      Number(frameItem?.target) || Number(frame?.goal?.target) || 0;
    return raw >= 1 && raw <= 30 ? raw : 0;
  })();
  const totalJuz =
    (totalFromTitle ? Number(totalFromTitle[1]) : 0) ||
    totalFromRange ||
    totalFromTarget;
  const totalLabel = totalJuz > 0 ? formatNumber(totalJuz) : "";

  const achievementPct = Math.round(
    frameItem?.achievementPct ?? frame?.goal?.achievementPct ?? 0,
  );

  const pillLabel = frameItem?.pill?.label?.trim();
  const pillState = String(frameItem?.pill?.state ?? "").toUpperCase();
  const goalStatus = String(frame?.goal?.status ?? "").toUpperCase();
  const isComplete =
    pillState === "COMPLETED" ||
    pillState === "ACHIEVED" ||
    goalStatus === "COMPLETED" ||
    achievementPct >= 100;

  const statusLabel = useMemo(() => {
    if (pillLabel) return pillLabel;
    if (isComplete) return t("progressLogging.fullyAchieved");
    if (
      goalStatus === "IN_PROGRESS" ||
      achievementPct > 0 ||
      Number(frame?.goal?.completed ?? 0) > 0
    ) {
      return t("progressLogging.surahStatusInProgress");
    }
    return t("progressLogging.surahStatusNotStarted");
  }, [
    achievementPct,
    frame?.goal?.completed,
    goalStatus,
    isComplete,
    pillLabel,
    t,
  ]);

  const showInsights = frame ? quranFrameShowsInsights(frame) : false;

  const handleFlowModeChange = (mode: "collapsed" | "active") => {
    if (mode === "collapsed") {
      onFlowClose();
    }
  };

  // Pack Juz-4: keep + visible at 100% when API still allows logging.
  const canLog = frameItem?.canLog !== false;

  return (
    <View style={isFlowActive ? styles.activeSection : undefined}>
      {/* Width matches Tahiyat / prayer flow cards (`cardAnchor` = 62%). */}
      <View style={styles.cardAnchor}>
        {!isFlowActive ? (
          <View style={[surahGoalStyles.card, surahGoalStyles.cardActive]}>
            <View style={surahGoalStyles.bodyRow}>
              <View style={surahGoalStyles.iconCircle}>
                <QuranRecitationBySurahFlowCardImage
                  size={25}
                  color={Colors.light.white}
                />
              </View>

              <View style={surahGoalStyles.textColumn}>
                <View
                  style={[
                    surahGoalStyles.statusChip,
                    isComplete && surahGoalStyles.statusChipAchieved,
                  ]}
                >
                  <Text
                    style={[
                      surahGoalStyles.statusChipText,
                      isComplete && surahGoalStyles.statusChipTextAchieved,
                    ]}
                  >
                    {statusLabel}
                  </Text>
                </View>

                <View style={surahGoalStyles.textLines}>
                  {parsedRange ? (
                    <>
                      <Text style={surahGoalStyles.surahName} numberOfLines={1}>
                        {`From Juz ${formatNumber(parsedRange.start)} to`}
                      </Text>
                      <Text style={surahGoalStyles.surahName} numberOfLines={1}>
                        {`Juz ${formatNumber(parsedRange.end)}`}
                      </Text>
                    </>
                  ) : (
                    <Text style={surahGoalStyles.surahName} numberOfLines={2}>
                      {rangeTitle.replace(/\s*\(\s*total\b[^)]*\)\s*$/i, "").trim()}
                    </Text>
                  )}
                  {totalLabel ? (
                    <Text style={surahGoalStyles.metaRegular}>
                      {`(total `}
                      <Text style={surahGoalStyles.metaBold}>{totalLabel}</Text>
                      {` ${t("progressLogging.unitJuzSingular")})`}
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
                style={surahGoalStyles.addButtonIconOnly}
                onPress={onStartFlow}
                activeOpacity={0.8}
              >
                <AddLoggingFlowIcon size={32} />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <QuranJuzLoggingFlow
            goalData={goalData}
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
