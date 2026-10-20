import React, { forwardRef } from "react";
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
import { useGetSadaqahGoalInsights } from "@/src/api/queries/useGetSadaqahGoalInsights";
import { useGetSadaqahGoalFrame } from "@/src/api/queries/useGetSadaqahGoalFrame";
import { getSadaqahFrameAchievementPct } from "@/src/utils/sadaqahGoalFrameMap";
import { TopSpace } from "@/components/atoms/TopSpace";
import {
  GoldenTickIcon,
  InsightGreenClockIcon,
  LighteningIcon,
  WeighBalanceIcon,
} from "@/assets/icons";

type Props = {
  sadaqahType: string;
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

function getStatIcon(icon: string | null | undefined, key: string) {
  const normalizedKey = String(key ?? "").toUpperCase();
  const normalizedIcon = String(icon ?? "").toUpperCase();

  if (
    normalizedKey.includes("TIME") ||
    normalizedIcon === "CLOCK" ||
    normalizedIcon === "TIME"
  ) {
    return <InsightGreenClockIcon size={17} />;
  }
  if (
    normalizedKey.includes("STREAK") ||
    normalizedIcon === "STREAK" ||
    normalizedIcon === "BOLT"
  ) {
    return <LighteningIcon />;
  }
  if (
    normalizedKey.includes("BEST") ||
    normalizedKey.includes("PERSONAL") ||
    normalizedIcon === "STAR"
  ) {
    return <BestdayStarIcon />;
  }
  if (
    normalizedKey.includes("AVERAGE") ||
    normalizedKey.includes("WEEKLY") ||
    normalizedIcon === "CHART" ||
    normalizedIcon === "SCALE"
  ) {
    return <WeighBalanceIcon />;
  }
  if (
    normalizedKey.includes("COMPLETED") ||
    normalizedKey.includes("ACTIVE") ||
    normalizedIcon === "CHECK"
  ) {
    return <GoldenTickIcon size={22} />;
  }
  switch (normalizedIcon) {
    case "CHECK":
      return <GoldenTickIcon size={22} />;
    case "STAR":
      return <BestdayStarIcon />;
    default:
      return <WeighBalanceIcon />;
  }
}

function defaultStatLabel(key: string): string {
  switch (String(key).toUpperCase()) {
    case "COMPLETED_IN":
    case "ACTIVE_DAYS":
      return "Completed in";
    case "LONGEST_STREAK":
      return "Longest streak";
    case "PERSONAL_BEST":
    case "BEST_DAY":
      return "Personal Best";
    case "WEEKLY_AVERAGE":
      return "Weekly Average";
    case "TIME_SPENT":
      return "Time Spent";
    default:
      return key.split("_").join(" ").toLowerCase();
  }
}

function StatRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
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

/**
 * Sadaqah insights sheet. Ring usage matches `InformationSheet` /
 * `QuranHoursInformationSheet`: size 160 + variant="illuminated".
 */
export const SadaqahGoalInformationSheet = forwardRef<BottomSheet, Props>(
  function SadaqahGoalInformationSheet({ sadaqahType, onClose }, ref) {
    const { t } = useTranslation();

    const { data, isLoading, isError, refetch } = useGetSadaqahGoalInsights(
      sadaqahType,
      { enabled: !!sadaqahType },
    );
    const { data: frame } = useGetSadaqahGoalFrame(sadaqahType, {
      enabled: !!sadaqahType,
    });

    // Same priority as InformationSheet: prefer live frame %, then insights ring.
    const achievementPct = Math.max(
      0,
      Math.min(
        100,
        Number(
          frame != null
            ? getSadaqahFrameAchievementPct(frame)
            : (data?.ring?.achievementPct ?? 0),
        ) || 0,
      ),
    );
    const targetLabel =
      data?.ring?.targetLabel?.trim() ||
      frame?.goal?.targetLabel?.trim() ||
      "";
    const stats = Array.isArray(data?.stats) ? data.stats : [];

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
              overflow: "visible",
            }}
          >
            <View style={styles.ringWrap}>
              <TaperedCircleBorder
                percentage={`${achievementPct}%`}
                borderColor={Colors.light.dullWhiteOpacity}
                size={110}
                variant="illuminated"
              >
                <View style={styles.ringInner}>
                  {targetLabel ? (
                    <Text style={styles.ringGoalText}>{targetLabel}</Text>
                  ) : null}
                  <View style={styles.percentRow}>
                    <Text style={styles.percentNumber}>{achievementPct}</Text>
                    <Text style={styles.percentSymbol}>%</Text>
                  </View>
                </View>
              </TaperedCircleBorder>
            </View>
            <TopSpace top={14} />
            {data.greeting ? (
              <Text style={styles.headline}>
                {renderWithNumberStyle(data.greeting, styles.boldNumber)}
              </Text>
            ) : null}
            {data.headline ? (
              <Text style={styles.body}>
                {renderWithNumberStyle(data.headline, styles.boldNumber)}
              </Text>
            ) : null}
            {data.body ? (
              <Text style={styles.closing}>
                {renderWithNumberStyle(data.body, styles.boldNumber)}
              </Text>
            ) : null}

            {stats.length > 0 ? (
              <View style={styles.statsList}>
                {stats.map((stat) => {
                  const label = String(
                    stat.label?.trim() || defaultStatLabel(stat.key),
                  ).trim();
                  const labelWithColon = label.endsWith(":")
                    ? label
                    : `${label}:`;
                  return (
                    <StatRow
                      key={stat.key || `${stat.label}-${stat.value}`}
                      icon={getStatIcon(stat.icon, stat.key)}
                    >
                      <StatLabelValue
                        label={labelWithColon}
                        value={String(stat.value ?? "")}
                      />
                    </StatRow>
                  );
                })}
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
    overflow: "visible",
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
