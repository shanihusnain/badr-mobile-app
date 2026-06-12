import { GoalProgressOverView } from "@/src/screens/private/goalprogressoverview";
import { useLocalSearchParams } from "expo-router";

export default function GoalProgressOverViewScreen() {
  const params = useLocalSearchParams();
  return <GoalProgressOverView goal={params.goal as string} />;
}
