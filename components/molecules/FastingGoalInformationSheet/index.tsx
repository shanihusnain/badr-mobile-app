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
import { useGetFastingGoalInsights } from "@/src/api/queries/useGetFastingGoalInsights";
import { TopSpace } from "@/components/atoms/TopSpace";
import {
  GoldenTickIcon,
  InsightGreenClockIcon,
  LighteningIcon,
  WeighBalanceIcon,
} from "@/assets/icons";

type Props = {
  fastingType: string;
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
  switch (normalizedIcon) {
    case "CHECK":
      return <GoldenTickIcon size={22} />;
    case "BOLT":
      return <LighteningIcon />;
    case "STAR":
      return <BestdayStarIcon />;
    default:
      return <WeighBalanceIcon />;
  }
}

function defaultStatLabel(key: string): string {
  switch (String(key).toUpperCase()) {
    case "LONGEST_STREAK":
      return "Longest streak";
    case "TIME_SPENT":
      return "Time spent";
    default:
      return key.replaceAll("_", " ").toLowerCase();
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

export const FastingGoalInformationSheet = forwardRef<BottomSheet, Props>(
  function FastingGoalInformationSheet({ fastingType, onClose }, ref) {
    const { t } = useTranslation();

    const { data, isLoading, isError, refetch } = useGetFastingGoalInsights(
      fastingType,
      { enabled: !!fastingType },
    );

    const achievementPct = data?.ring?.achievementPct ?? 0;
    const targetLabel = data?.ring?.targetLabel?.trim() ?? "";

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

            {Array.isArray(data.stats) && data.stats.length > 0 ? (
              <View style={styles.statsList}>
                {data.stats.map((stat) => {
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
                      {`${labelWithColon} `}
                      <Text style={styles.statValue}>
                        {renderWithNumberStyle(
                          String(stat.value ?? ""),
                          styles.statValueNumber,
                        )}
                      </Text>
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
    textAlign: "center",
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
    marginBottom: 15,
  },
  statsList: {
    marginTop: 8,
    gap: 12,
    width: "100%",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statIcon: {
    width: 24,
    alignItems: "center",
  },
  statText: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
  },
  statValue: {
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  statValueNumber: {
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
  },
});
