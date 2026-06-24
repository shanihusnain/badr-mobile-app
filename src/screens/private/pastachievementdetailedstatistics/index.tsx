import { ScrollView, StyleSheet, View } from "react-native";
import { Colors } from "@/constants/theme";
import { PrayerPastAchievements } from "@/components/molecules/PrayerPastAchievements";
import type { GoalId } from "@/src/screens/private/home/components/goalsData";

type Props = {
    goalId: GoalId;
};

export default function PastAchievementDetailedStatisticsScreen({ goalId }: Props) {
    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.inner}>
                <PrayerPastAchievements goalId={goalId} isDetailed={true} />
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
