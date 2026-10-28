import {
  CresentAndStarIcon,
  HomeBondIcon,
  PersonalGrowthIcon,
  SocialResponsibilityIcon,
} from "@/assets/icons";
import { TaperedCircleBorder } from "@/components/atoms/TaperedCircleBorder";
import { Colors } from "@/constants/theme";
import { Pressable, Text, View } from "react-native";
import type { PlanJournalHabit } from "../planJournalConsistencyMockData";
import { planStyles as styles } from "../styles";

type JournalHabitCardProps = {
  habit: PlanJournalHabit;
  onPress: () => void;
  isLoading?: boolean;
};

function getHabitIcon(id: number | string) {
  const key = String(id).toUpperCase();

  switch (key) {
    case "1":
    case "RELIGIOUS_HABITS":
      return <CresentAndStarIcon color={Colors.light.white} />;
    case "2":
    case "PERSONAL_GROWTH":
      return <PersonalGrowthIcon color={Colors.light.white} />;
    case "3":
    case "SOCIAL_RESPONSIBILITY":
      return <SocialResponsibilityIcon color={Colors.light.white} />;
    case "4":
    case "FAMILY_BONDS":
    case "HOME_BOND":
    default:
      return <HomeBondIcon color={Colors.light.white} />;
  }
}

export function JournalHabitCard({
  habit,
  onPress,
  isLoading = false,
}: JournalHabitCardProps) {
  const showPlaceholder = isLoading || habit.percent == null;
  const percentNum = showPlaceholder ? "---" : String(habit.percent);

  return (
    <Pressable
      style={styles.journalHabitCard}
      onPress={onPress}
      disabled={isLoading}
    >
      <View style={styles.journalHabitRow}>
        <View style={styles.journalHabitIconWrap}>
          {getHabitIcon(habit.id)}
        </View>
        <Text style={styles.journalHabitName}>{habit.name}</Text>
        <View style={styles.journalHabitRingWrap}>
          <TaperedCircleBorder
            percentage={showPlaceholder ? "0%" : `${habit.percent}%`}
            borderColor={Colors.light.ringTrackEmpty}
            size={50}
            variant="illuminated"
          >
            <View style={styles.journalHabitPercentRow}>
              {showPlaceholder ? (
                <Text style={styles.journalHabitPercentText}>---</Text>
              ) : (
                <>
                  <Text style={styles.journalHabitPercentText}>
                    {percentNum}
                  </Text>
                  <Text style={styles.journalHabitPercentSymbol}>%</Text>
                </>
              )}
            </View>
          </TaperedCircleBorder>
        </View>
      </View>
    </Pressable>
  );
}
