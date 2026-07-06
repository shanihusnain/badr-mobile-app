import { RecordIcon } from "@/assets/icons";
import MoonProgress from "@/components/atoms/MoonProgress";
import SecondaryButton from "@/components/atoms/Secondary-button";
import { TopSpace } from "@/components/atoms/TopSpace";
import {
  PastAchievementStudyMaterial,
  StudyMaterialItem,
} from "@/components/molecules/PastAchievementStudyMaterial";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { PlanNotificationsCard } from "./PlanNotificationsCard";
import { PlanSectionHeader } from "./PlanSectionHeader";
import { planStyles as styles } from "../styles";

const GOAL_PROGRESS_TEXT =
  "You're on day 18 of your 28-day cycle, with a 66% achievement score. If you'd like, tap to explore a proposed plan to help complete your remaining goals.";

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
        />
      </View>
      <TopSpace top={20} />
      <View style={styles.goalProgressCard}>
        <View style={styles.goalProgressRow}>
          <View style={styles.moonProgressWrap}>
            {/* <MoonProgress progressPercent={66} /> */}
          </View>
          <Text style={styles.goalProgressText}>{GOAL_PROGRESS_TEXT}</Text>
        </View>
        <TopSpace top={16} />
        <Pressable style={styles.viewProposedPlanRow}>
          <Text style={styles.viewProposedPlanText}>VIEW PROPOSED PLAN</Text>
          <Feather name="chevron-right" size={24} color={Colors.light.green} />
        </Pressable>
      </View>
      <TopSpace top={20} />
      <PlanNotificationsCard
        description={GOAL_PROGRESS_TEXT}
        callToActionText="MANAGE NOTIFICATIONS"
      />
      <TopSpace top={20} />
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
        title="Study Material"
        showSeeAll={true}
        onSeeAllPress={() => {}}
      />
    </ScrollView>
  );
}
