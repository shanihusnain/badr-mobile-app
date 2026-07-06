import { FilterIcon } from "@/assets/icons";
import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { ImageBackground } from "expo-image";
import { Pressable, Text, View } from "react-native";
import { planStyles as styles } from "../styles";

const DEFAULT_DESCRIPTION =
  "You're on day 18 of your 28-day cycle, with a 66% achievement score. If you'd like, tap to explore a proposed plan to help complete your remaining goals.";

type PlanNotificationsCardProps = {
  description?: string;
  iconSize?: number;
  showAction?: boolean;
  callToActionText?: string;
};

function renderDescriptionWithHighlightedDigits(description: string) {
  return description.split(/(\d+)/g).map((part, index) => {
    if (!/^\d+$/.test(part)) {
      return part;
    }

    return (
      <Text
        key={`digit-${index}-${part}`}
        style={styles.proposedPlanDescriptionDigit}
      >
        {part}
      </Text>
    );
  });
}

export function PlanNotificationsCard({
  description = DEFAULT_DESCRIPTION,
  iconSize = 35,
  showAction = true,
  callToActionText = "MANAGE NOTIFICATIONS",
}: PlanNotificationsCardProps) {
  return (
    <ImageBackground
      source={require("@/assets/images/icon.png")}
      style={styles.proposedPlanCard}
      contentFit="cover"
    >
      <View style={styles.proposedPlanOverlay} />
      <View style={styles.proposedPlanContent}>
        <FilterIcon size={iconSize} color={Colors.light.white} />
        <View style={styles.proposedPlanTextBlock}>
          <Text style={styles.proposedPlanDescription}>
            {renderDescriptionWithHighlightedDigits(description)}
          </Text>
          {showAction ? (
            <>
              <TopSpace top={12} />
              <Pressable style={styles.proposedPlanAction}>
                <Text style={styles.proposedPlanActionText}>
                  {callToActionText}
                </Text>
                <Feather
                  name="chevron-right"
                  size={20}
                  color={Colors.light.green}
                />
              </Pressable>
            </>
          ) : null}
        </View>
      </View>
    </ImageBackground>
  );
}
