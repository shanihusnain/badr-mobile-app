import { RecordIcon } from "@/assets/icons";
import { MoonProgress } from "@/components/atoms/MoonProgress";
import SecondaryButton from "@/components/atoms/Secondary-button";
import { TopSpace } from "@/components/atoms/TopSpace";
import {
  PastAchievementStudyMaterial,
  StudyMaterialItem,
} from "@/components/molecules/PastAchievementStudyMaterial";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ManageNotificationsCard } from "./ManageNotificationsCard";
import { PlanSectionHeader } from "./PlanSectionHeader";
import { planStyles as styles } from "../styles";
import { router } from "expo-router";

const RECORD_DATA = [
  {
    id: 1,
    duration: "Monthly",
    value: "November",
    icon: <RecordIcon size={34} color={Colors.light.white} />,
  },
  {
    id: 2,
    duration: "Quarterly",
    value: "Sep - Nov",
    icon: <RecordIcon size={34} color={Colors.light.white} />,
  },
];

type GoalTabContentProps = {
  studyMaterial: StudyMaterialItem[];
};

export function GoalTabContent({ studyMaterial }: GoalTabContentProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      contentContainerStyle={styles.goalTabContent}
    >
      <View style={styles.goalsHeaderRow}>
        <Text style={styles.goalsTitle}>My Goals</Text>
        <SecondaryButton
          text="PLAN NEXT MONTH'S GOALS"
          onPress={() => {}}
          style={styles.goalPlanButton}
          variant="green"
          size="compact"
        />
      </View>
      <TopSpace top={20} />
      <View style={styles.goalProgressCard}>
        <View style={styles.goalProgressRow}>
          <View style={styles.moonProgressWrap}>
            <MoonProgress progressPercent={66} />
          </View>
          <View style={styles.goalProgressTextBlock}>
            <Text style={styles.goalProgressText}>
              You're on day{" "}
              <Text style={styles.goalProgressTextBold}>18</Text> of your{" "}
              <Text style={styles.goalProgressTextBold}>28-day cycle</Text>,
              with a <Text style={styles.goalProgressTextBold}>66%</Text>{" "}
              achievement score. If you'd like, tap to explore a proposed plan
              to help complete your remaining goals.
            </Text>
            <TopSpace top={12} />
            <Pressable style={styles.viewProposedPlanRow}>
              <Text style={styles.viewProposedPlanText}>VIEW PROPOSED PLAN</Text>
              <Feather
                name="chevron-right"
                size={20}
                color={Colors.light.green}
              />
            </Pressable>
          </View>
        </View>
      </View>
      <TopSpace top={20} />
      <ManageNotificationsCard />
      <TopSpace top={36} />
      <PlanSectionHeader title="ACHIEVEMENT REPORTS" actionLabel="VIEW ALL" />
      <TopSpace top={12} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        style={styles.recordScroll}
        contentContainerStyle={styles.recordScrollContent}
      >
        {RECORD_DATA.map((item) => (
          <Pressable key={item.id} style={styles.recordCard}>
            <View style={styles.recordCardRow}>
              <View style={styles.recordCardText}>
                <Text style={styles.recordCardDuration}>{item.duration}</Text>
                <TopSpace top={6} />
                <Text style={styles.recordCardValue}>{item.value}</Text>
              </View>
              {item.icon}
            </View>
          </Pressable>
        ))}
      </ScrollView>
      <PastAchievementStudyMaterial
        items={studyMaterial}
        title="LEARN MORE"
        seeAllLabel="VIEW ALL"
        showSeeAll={true}
        onSeeAllPress={() => router.push("/(tabs)/(connect)/learnmorescreen")}
      />
    </ScrollView>
  );
}
