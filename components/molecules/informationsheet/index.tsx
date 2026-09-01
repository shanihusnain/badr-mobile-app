import React, { forwardRef, type ReactNode } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
} from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import { BottomSheetWrapper } from "../BottomSheetWrapper";
import { TaperedCircleBorder } from "@/components/atoms/TaperedCircleBorder";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { BestdayStarIcon } from "@/assets/icons/BestdayStarIcon";
import { useGetPrayerGoalInsights, isQiyamAlLaylInsights, type PrayerGoalInsightsStats } from "@/src/api/queries/useGetPrayerGoalInsights";
import { useGetPrayerGoalFrame } from "@/src/api/queries/useGetPrayerGoalFrame";
import { TopSpace } from "@/components/atoms/TopSpace";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  FilledWallClock,
  FlowCardMosqueIcon,
  GoldenTickIcon,
  LighteningIcon,
  QiyamAfterIshaIcon,
  QiyamMaleBothIshaAndTahajudIcon,
  QiyamMaleUserIcon,
  WeighBalanceIcon,
} from "@/assets/icons";
import { resolvePrayerType } from "@/src/utils/prayerGoalMap";

type Props = {
  prayerType: string;
  onClose?: () => void;
};

function renderWithNumberStyle(
  text: string,
  numberStyle: StyleProp<TextStyle>,
) {
  return String(text)
    .split(/(\d+)/)
    .map((part, index) =>
      /^\d+$/.test(part) ? (
        <Text key={`${part}-${index}`} style={numberStyle}>
          {part}
        </Text>
      ) : (
        part
      ),
    );
}

function formatTimeSpent(totalMinutes: number): string {
  const safe = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

function parseJumuahFraction(fraction: string | undefined): {
  done: number;
  total: number;
} {
  if (!fraction) return { done: 0, total: 0 };
  const [doneRaw, totalRaw] = fraction.split("/");
  const done = Number.parseInt(doneRaw ?? "0", 10);
  const total = Number.parseInt(totalRaw ?? "0", 10);
  return {
    done: Number.isFinite(done) ? done : 0,
    total: Number.isFinite(total) ? total : 0,
  };
}

function StatRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <View style={styles.statRow}>
      <View style={styles.statIcon}>{icon}</View>
      <Text style={styles.statText}>{children}</Text>
    </View>
  );
}

function StatLabelValue({ label, value }: { label: string; value: string }) {
  return (
    <>
      {`${label} `}
      <Text style={styles.statValue}>
        {renderWithNumberStyle(value, styles.statValueNumber)}
      </Text>
    </>
  );
}

function QiyamInsightStatRows({
  stats,
  t,
}: {
  stats: PrayerGoalInsightsStats;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const nightLabel = (count: number) =>
    t("progressLogging.insightsNightCount", { count });

  return (
    <>
      <StatRow icon={<LighteningIcon />}>
        <StatLabelValue
          label={t("progressLogging.insightsLongestStreakLabel")}
          value={nightLabel(stats.longestStreak)}
        />
      </StatRow>

      {stats.personalBest != null && stats.personalBestDaysCount != null ? (
        <StatRow icon={<BestdayStarIcon />}>
          <StatLabelValue
            label={t("progressLogging.insightsPersonalBestLabel")}
            value={t("progressLogging.insightsPersonalBestValue", {
              count: stats.personalBest,
              daysLabel: t("progressLogging.insightsDayCount", {
                count: stats.personalBestDaysCount,
              }),
            })}
          />
        </StatRow>
      ) : null}

      <StatRow icon={<WeighBalanceIcon />}>
        <StatLabelValue
          label={t("progressLogging.insightsWeeklyAverageLabel")}
          value={t("progressLogging.insightsWeeklyAverageValue", {
            count: stats.weeklyAverage,
          })}
        />
      </StatRow>

      <StatRow icon={<FilledWallClock />}>
        <StatLabelValue
          label={t("progressLogging.insightsTimeSpentLabel")}
          value={formatTimeSpent(stats.timeSpentMinutes)}
        />
      </StatRow>
    </>
  );
}

function QiyamTimingStatRows({
  stats,
  t,
}: {
  stats: PrayerGoalInsightsStats;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <>
      {stats.afterIshaStats ? (
        <StatRow
          icon={
            <QiyamAfterIshaIcon
              size={20}
              color={Colors.light.qiyamIconGold}
            />
          }
        >
          <Text style={styles.statValue}>
            {renderWithNumberStyle(
              t("progressLogging.insightsQiyamAfterIshaRow", {
                nights: stats.afterIshaStats.nights,
                total: stats.afterIshaStats.total,
              }),
              styles.statValueNumber,
            )}
          </Text>
        </StatRow>
      ) : null}

      {stats.tahajjudStats ? (
        <StatRow
          icon={
            <QiyamMaleUserIcon size={20} color={Colors.light.green} />
          }
        >
          <Text style={styles.statValue}>
            {renderWithNumberStyle(
              t("progressLogging.insightsQiyamTahajjudRow", {
                nights: stats.tahajjudStats.nights,
                total: stats.tahajjudStats.total,
              }),
              styles.statValueNumber,
            )}
          </Text>
        </StatRow>
      ) : null}

      {stats.bothStats ? (
        <StatRow
          icon={
            <QiyamMaleBothIshaAndTahajudIcon size={20} color={Colors.light.green} />
          }
        >
          <Text style={styles.statValue}>
            {renderWithNumberStyle(
              t("progressLogging.insightsQiyamBothRow", {
                nights: stats.bothStats.nights,
              }),
              styles.statValueNumber,
            )}
          </Text>
        </StatRow>
      ) : null}

      {stats.witrStats ? (
        <StatRow
          icon={
            <MaterialCommunityIcons
              name="candle"
              size={20}
              color={Colors.light.white}
            />
          }
        >
          <Text style={styles.statValue}>
            {renderWithNumberStyle(
              t("progressLogging.insightsQiyamWitrRow", {
                withWitr: stats.witrStats.nightsWithWitr,
                total: stats.witrStats.totalNights,
              }),
              styles.statValueNumber,
            )}
          </Text>
        </StatRow>
      ) : null}
    </>
  );
}

export const InformationSheet = forwardRef<BottomSheet, Props>(
  function InformationSheet({ prayerType, onClose }, ref) {
    const { t } = useTranslation();
    const resolvedType = resolvePrayerType(prayerType);
    const isFiveDaily = resolvedType === "FIVE_DAILY_PRAYERS";

    const { data, isLoading, isError, refetch } = useGetPrayerGoalInsights(
      prayerType,
      {
        enabled: !!prayerType,
      },
    );
    const isQiyam = isQiyamAlLaylInsights(data);
    const { data: frame } = useGetPrayerGoalFrame(prayerType, {
      enabled: !!prayerType,
    });

    const achievementPct =
      frame?.goal.achievementPct ?? data?.achievementPct ?? 0;
    const goalCount = frame?.goal.targetCount;
    const stats = data?.stats;

    const completedInValue =
      stats == null
        ? ""
        : isQiyam
          ? t("progressLogging.insightsCompletedInActiveNights", {
              count: stats.activeDaysCount,
            })
          : stats.dayGoalCompleted != null
            ? t("progressLogging.insightsCompletedInDaysOnDay", {
                days: stats.activeDaysCount,
                day: stats.dayGoalCompleted,
              })
            : t("progressLogging.insightsCompletedInActiveDays", {
                count: stats.activeDaysCount,
              });

    const ringVariant =
      isQiyam && achievementPct >= 100 ? "golden" : "illuminated";

    const jumuah = parseJumuahFraction(stats?.jumuahFraction);

    return (
      <BottomSheetWrapper
        ref={ref}
        snapPoints={["85%"]}
        bgColor={Colors.light.blackBackground}
        onClose={onClose}
        onChange={(index) => {
          if (index >= 0) {
            void refetch();
          }
        }}
      >
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={Colors.light.white} />
          </View>
        ) : isError || !data ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>
              {t("progressLogging.insightsLoadError")}
            </Text>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: Colors.light.darkgrey,
              alignSelf: "center",
              marginTop: 75,
              borderRadius: 16,
              paddingVertical: 20,
              paddingHorizontal: 14,
            }}
          >
            <View style={styles.ringWrap}>
              <TaperedCircleBorder
                percentage={`${achievementPct}%`}
                borderColor={Colors.light.dullWhiteOpacity}
                size={160}
                variant={ringVariant}
              >
                <View style={styles.ringInner}>
                  {goalCount != null ? (
                    <Text style={styles.ringGoalText}>
                      {t("progressLogging.insightsGoalRingLabel", {
                        count: goalCount,
                      })}
                    </Text>
                  ) : null}
                  <View style={styles.percentRow}>
                    <Text style={styles.percentNumber}>{achievementPct}</Text>
                    <Text style={styles.percentSymbol}>%</Text>
                  </View>
                </View>
              </TaperedCircleBorder>
            </View>
            <TopSpace top={14} />
            <Text style={styles.headline}>
              {renderWithNumberStyle(data.headline, styles.boldNumber)}
            </Text>
            <Text style={styles.body}>
              {renderWithNumberStyle(data.body, styles.boldNumber)}
            </Text>
            <Text style={styles.closing}>
              {renderWithNumberStyle(
                data.motivationalClosing,
                styles.boldNumber,
              )}
            </Text>

            {stats ? (
              <View style={styles.statsList}>
                <StatRow icon={<GoldenTickIcon size={22} />}>
                  <StatLabelValue
                    label={t("progressLogging.insightsCompletedInLabel")}
                    value={completedInValue}
                  />
                </StatRow>

                {isFiveDaily ? (
                  <>
                    {stats.mosqueCount != null ? (
                      <StatRow
                        icon={
                          <FlowCardMosqueIcon
                            size={22}
                            color={Colors.light.lightblue}
                          />
                        }
                      >
                        <Text style={styles.statValue}>
                          {renderWithNumberStyle(
                            t("progressLogging.insightsFiveDailyMosqueRow", {
                              mosqueCount: stats.mosqueCount,
                              jumuahDone: jumuah.done,
                              jumuahTotal: jumuah.total,
                            }),
                            styles.statValueNumber,
                          )}
                        </Text>
                      </StatRow>
                    ) : null}

                    <StatRow icon={<LighteningIcon />}>
                      <Text style={styles.statValue}>
                        {renderWithNumberStyle(
                          t("progressLogging.insightsFiveDailyStreakRow", {
                            streak: stats.longestStreak,
                          }),
                          styles.statValueNumber,
                        )}
                      </Text>
                    </StatRow>

                    <StatRow icon={<FilledWallClock />}>
                      <StatLabelValue
                        label={t("progressLogging.insightsTimeSpentLabel")}
                        value={formatTimeSpent(stats.timeSpentMinutes)}
                      />
                    </StatRow>

                    <StatRow icon={<WeighBalanceIcon />}>
                      <StatLabelValue
                        label={t(
                          "progressLogging.insightsWeeklyAveragePerPrayerLabel",
                        )}
                        value={t("progressLogging.insightsWeeklyAverageValue", {
                          count: stats.weeklyAverage,
                        })}
                      />
                    </StatRow>
                  </>
                ) : isQiyam ? (
                  <>
                    <QiyamTimingStatRows stats={stats} t={t} />
                    <QiyamInsightStatRows stats={stats} t={t} />
                  </>
                ) : (
                  <>
                    <StatRow icon={<LighteningIcon />}>
                      <StatLabelValue
                        label={t("progressLogging.insightsLongestStreakLabel")}
                        value={t("progressLogging.insightsDayCount", {
                          count: stats.longestStreak,
                        })}
                      />
                    </StatRow>

                    {stats.personalBest != null &&
                    stats.personalBestDaysCount != null ? (
                      <StatRow icon={<BestdayStarIcon />}>
                        <StatLabelValue
                          label={t("progressLogging.insightsPersonalBestLabel")}
                          value={t(
                            "progressLogging.insightsPersonalBestValue",
                            {
                              count: stats.personalBest,
                              daysLabel: t("progressLogging.insightsDayCount", {
                                count: stats.personalBestDaysCount,
                              }),
                            },
                          )}
                        />
                      </StatRow>
                    ) : null}

                    <StatRow icon={<WeighBalanceIcon />}>
                      <StatLabelValue
                        label={t("progressLogging.insightsWeeklyAverageLabel")}
                        value={t("progressLogging.insightsWeeklyAverageValue", {
                          count: stats.weeklyAverage,
                        })}
                      />
                    </StatRow>

                    <StatRow icon={<FilledWallClock />}>
                      <StatLabelValue
                        label={t("progressLogging.insightsTimeSpentLabel")}
                        value={formatTimeSpent(stats.timeSpentMinutes)}
                      />
                    </StatRow>
                  </>
                )}
              </View>
            ) : null}
          </View>
        )}
      </BottomSheetWrapper>
    );
  },
);

const styles = StyleSheet.create({
  centered: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    textAlign: "center",
    opacity: 0.85,
  },
  ringWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
    paddingBottom: 30,
    position: "relative",
  },
  ringInner: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    width: "100%",
    height: "100%",
  },
  ringGoalText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    fontWeight: "500",
  },
  percentRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
  },
  percentNumber: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 32,
    fontWeight: "400",
  },
  percentSymbol: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 12,
    marginLeft: 2,
  },
  headline: {
    color: Colors.light.white,
    fontFamily: fonts.primary.bold,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "left",
    lineHeight: 22,
    marginBottom: 6,
  },
  boldNumber: {
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
  },
  body: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    fontWeight: "400",
    textAlign: "left",
    lineHeight: 20,
    marginBottom: 15,
  },
  closing: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    fontWeight: "400",
    textAlign: "left",
    lineHeight: 20,
    marginBottom: 20,
  },
  statsList: {
    gap: 12,
    paddingBottom: 8,
    paddingHorizontal: 24,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statIcon: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  statText: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  statValue: {
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: 14,
    color: Colors.light.white,
  },
  statValueNumber: {
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
});
