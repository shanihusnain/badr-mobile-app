import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MY_TEAMS_INITIAL_VISIBLE, type MyTeam } from "../myTeamsMockData";
import { MyTeamCard } from "./MyTeamCard";

type MyTeamsListProps = {
  teams: MyTeam[];
  /** How many teams to show before "SHOW MORE". Falls back to mock default. */
  visibleTeamCount?: number;
  onTeamPress?: (team: MyTeam) => void;
};

export function MyTeamsList({
  teams,
  visibleTeamCount = MY_TEAMS_INITIAL_VISIBLE,
  onTeamPress,
}: MyTeamsListProps) {
  const [showAll, setShowAll] = useState(false);
  const initialVisible = Math.max(1, visibleTeamCount);
  console.log("teams", teams);
  const visibleTeams = useMemo(() => {
    if (showAll || teams.length <= initialVisible) {
      return teams;
    }
    return teams.slice(0, initialVisible);
  }, [initialVisible, showAll, teams]);

  const canShowMore = !showAll && teams.length > initialVisible;

  if (teams.length === 0) return null;

  return (
    <View>
      <Text style={styles.subtitle}>MY TEAMS</Text>
      {visibleTeams.map((team) => (
        <MyTeamCard key={team.id} team={team} onPress={onTeamPress} />
      ))}
      {canShowMore ? (
        <Pressable
          style={styles.showMoreButton}
          onPress={() => setShowAll(true)}
        >
          <Text style={styles.showMoreText}>SHOW MORE</Text>
          <Ionicons name="chevron-down" size={16} color={Colors.light.white} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    color: Colors.light.subtext,
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
  },
  showMoreText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
  },
});
