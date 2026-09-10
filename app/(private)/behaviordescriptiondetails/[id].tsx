import { BehaviorDetailDescription } from "@/src/screens/private/behaviordetaildescription";
import { useLocalSearchParams } from "expo-router";

export default function BehaviorDescriptionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <BehaviorDetailDescription behavior={id} />;
}
