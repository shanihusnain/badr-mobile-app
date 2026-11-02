import { FilterIcon } from "../../../../../assets/icons/FilterIcon";
import JournalGetStartedImage from "../../../../../assets/images/journalgetstartedcard.png";
import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { ImageBackground } from "expo-image";
import { Pressable, Text, View } from "react-native";
import { planStyles as styles } from "../styles";
import { router } from "expo-router";

const DEFAULT_DESCRIPTION =
  "You're on day 18 of your 28-day cycle, with a 66% achievement score. If you'd like, tap to explore a proposed plan to help complete your remaining goals.";

type PlanNotificationsCardProps = {
  title?: string;
  description?: string;
  iconSize?: number;
  showAction?: boolean;
  callToActionText?: string;
  onActionPress?: () => void;
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
  title,
  description = DEFAULT_DESCRIPTION,
  iconSize = 35,
  showAction = true,
  callToActionText = "MANAGE NOTIFICATIONS",
  onActionPress,
}: PlanNotificationsCardProps) {
  return (
    <ImageBackground
      source={JournalGetStartedImage}
      style={styles.proposedPlanCard}
      imageStyle={styles.proposedPlanCardImage}
      contentFit="cover"
    >
      <View style={styles.proposedPlanOverlay} />
      <View style={styles.proposedPlanContent}>
        <FilterIcon size={iconSize} color={Colors.light.white} />
        <View style={styles.proposedPlanTextBlock}>
          {title ? <Text style={styles.proposedPlanTitle}>{title}</Text> : null}
          <Text style={styles.proposedPlanDescription}>
            {renderDescriptionWithHighlightedDigits(description)}
          </Text>
          {showAction ? (
            <>
              <TopSpace top={12} />
              <Pressable
                style={styles.proposedPlanAction}
                onPress={() => {
                  if (onActionPress) {
                    onActionPress();
                    return;
                  }
                  router.push("/notifications");
                }}
              >
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
