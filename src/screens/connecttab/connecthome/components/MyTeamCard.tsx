import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatTeamRank, type MyTeam } from "../myTeamsMockData";

type MyTeamCardProps = {
  team: MyTeam;
  onPress?: (team: MyTeam) => void;
};

export function MyTeamCard({ team, onPress }: MyTeamCardProps) {
  return (
    <Pressable style={styles.card} onPress={() => onPress?.(team)}>
      <Image
        source={{ uri: team.avatarUri }}
        style={styles.avatar}
        contentFit="cover"
      />

      <View style={styles.main}>
        <Text style={styles.teamName} numberOfLines={1}>
          {team.name}
        </Text>

        <View style={styles.rankPill}>
          <Text style={styles.rankPillText} numberOfLines={1}>
            {team.displayRankLabel}
          </Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color={Colors.light.white}
          />
        </View>
      </View>

      <Text style={styles.rankPosition}>
        {formatTeamRank(team.rankPosition, team.rankTotal)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.darkgrey,
  },
  main: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  teamName: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 13,
    textTransform: "uppercase",
  },
  rankPill: {
    alignSelf: "flex-start",
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.light.darkgrey,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  rankPillText: {
    flexShrink: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 10,
    textTransform: "uppercase",
  },
  rankPosition: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    fontWeight: "500",
  },
});
