import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  formatRankScore,
  RANK_PERIODS,
  type RankLeaderboardEntry,
  type RankPeriod,
} from "../rankMockData";

type ViewRankTabProps = {
  metricLabel: string;
  period: RankPeriod;
  onPeriodChange: (period: RankPeriod) => void;
  totalLabel: string;
  periodLabel: string;
  lastUpdated: string;
  entries: RankLeaderboardEntry[];
};

export function ViewRankTab({
  metricLabel,
  period,
  onPeriodChange,
  totalLabel,
  periodLabel,
  lastUpdated,
  entries,
}: ViewRankTabProps) {
  return (
    <View style={styles.container}>
      <View style={styles.periodBar}>
        {RANK_PERIODS.map((item) => {
          const selected = item.id === period;
          return (
            <Pressable
              key={item.id}
              style={[styles.periodChip, selected && styles.periodChipSelected]}
              onPress={() => onPeriodChange(item.id)}
            >
              <Text
                style={[
                  styles.periodChipText,
                  selected && styles.periodChipTextSelected,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statsLeft}>
          <Text style={styles.statsTitle}>{metricLabel}</Text>
          <Text style={styles.statsTotal}>{totalLabel}</Text>
        </View>
        <View style={styles.statsRight}>
          <Text style={styles.statsTitle}>{periodLabel}</Text>
          <Text style={styles.statsMeta}>{lastUpdated}</Text>
        </View>
      </View>

      <View style={styles.list}>
        {entries.map((entry) => (
          <View key={entry.id} style={styles.row}>
            <Image
              source={{ uri: entry.avatarUri }}
              style={styles.avatar}
              contentFit="cover"
            />
            <View style={styles.meta}>
              <Text style={styles.nameLine}>
                <Text style={styles.name}>{entry.name} </Text>
                <Text style={styles.score}>{formatRankScore(entry.score)}</Text>
              </Text>
              <Text style={styles.handle}>{entry.handle}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const MUTED = "#8E98A8";

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  periodBar: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: MUTED,
    borderRadius: 22,
    marginBottom: 18,
    marginTop: 50,
  },
  periodChip: {
    flex: 1,
    minHeight: 34,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  periodChipSelected: {
    backgroundColor: Colors.light.green,
  },
  periodChipText: {
    color: MUTED,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 11,
    textTransform: "uppercase",
  },
  periodChipTextSelected: {
    color: Colors.light.white,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
    gap: 12,
  },
  statsLeft: {
    flex: 1,
    gap: 4,
  },
  statsRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  statsTitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 12,
    textTransform: "uppercase",
  },
  statsTotal: {
    color: Colors.light.green,
    fontFamily: fonts.primary.medium,
    fontSize: 13,
  },
  statsMeta: {
    color: MUTED,
    fontFamily: fonts.primary.regular,
    fontSize: 12,
  },
  list: {
    gap: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.darkgrey,
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  nameLine: {
    flexWrap: "wrap",
  },
  name: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 14,
  },
  score: {
    color: Colors.light.green,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 14,
  },
  handle: {
    color: MUTED,
    fontFamily: fonts.primary.regular,
    fontSize: 12,
    marginTop: 2,
  },
});
