import { ScrollView, StyleSheet, View } from "react-native";
import { Colors } from "@/constants/theme";
import { PrayerPastAchievements } from "@/components/molecules/PrayerPastAchievements";
import type { GoalId } from "@/src/screens/private/home/components/goalsData";

type Props = {
    goalId: GoalId;
};

import { getGoalById } from "@/src/screens/private/home/components/goalsData";
import { SadaqahPastAchievements } from "@/components/molecules/SadaqahPastAchievements";

export default function PastAchievementDetailedStatisticsScreen({ goalId }: Props) {
    const goalData = getGoalById(goalId);

    if (!goalData) {
        return null;
    }

    let content = null;
    if (goalData.category === "PRAYER") {
        content = <PrayerPastAchievements goalId={goalId} isDetailed={true} />;
    } else if (goalData.category === "SADAQAH") {
        content = <SadaqahPastAchievements goalId={goalId} isDetailed={true} />;
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.inner}>
                {content}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.blackBackground,
    },
    content: {
        paddingBottom: 40,
    },
    inner: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
});
