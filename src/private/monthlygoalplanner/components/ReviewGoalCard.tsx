import { fonts } from "@/assets/fonts";
import { Divider } from "@/components/atoms/Divider";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

export const ReviewGoalCard = ({
  goal,
  handleEditPress,
}: {
  goal: any;
  handleEditPress: (goal: any) => void;
}) => {
  return (
    <View key={goal.id}>
      <View style={styles.appliedGoalContainer} key={goal.id}>
        <View style={styles.appliedGoalRow}>
          <View style={styles.appliedGoalLeftGroup}>
            <Text style={styles.appliedGoalTitleText}>{goal?.label}</Text>
            <Pressable onPress={handleEditPress}>
              <Feather name="edit-2" size={14} color="white" />
            </Pressable>
          </View>
          <Text style={styles.appliedGoalValueText}>{goal?.totalValue}</Text>
        </View>

        {goal?.selectedGoals && goal?.selectedGoals.length > 0 && <Divider />}
        {goal.selectedGoals &&
          goal.selectedGoals.length > 0 &&
          goal?.selectedGoals.map((subGoal: any, subIdx: number) => (
            <View
              key={
                subGoal?.id != null
                  ? String(subGoal.id)
                  : `${String(goal?.id)}-sub-${subIdx}`
              }
              style={styles.subGoalWrapper}
            >
              <View style={styles.subGoalRow}>
                <Text style={styles.subGoalText}>{subGoal?.label}</Text>
                <Text style={styles.subGoalValueText}>{subGoal?.value}</Text>
              </View>
            </View>
          ))}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  appliedGoalContainer: {
    marginTop: 10,
    backgroundColor: Colors.light.calendarBg,
    padding: 10,
    borderRadius: 6,
  },
  appliedGoalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  appliedGoalLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  appliedGoalTitleText: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  appliedGoalValueText: {
    color: Colors.light.green,
    fontSize: 14,
    marginTop: 8,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  subGoalWrapper: {
    marginTop: 6,
  },
  subGoalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subGoalText: {
    color: Colors.light.white,
    fontSize: 12,
    marginTop: 8,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    opacity: 0.8,
  },
  subGoalValueText: {
    color: Colors.light.white,
    fontSize: 12,
    marginTop: 8,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    opacity: 0.8,
  },
});
