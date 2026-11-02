import { FilterIcon } from "../../../../../assets/icons/FilterIcon";
import JournalCardImage from "../../../../../assets/images/journalcard.png";
import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { ImageBackground } from "expo-image";
import { Pressable, Text, View } from "react-native";
import { planStyles as styles } from "../styles";
import { router } from "expo-router";

const MANAGE_NOTIFICATIONS_DESCRIPTION =
  "Achieve your goals and stay on track with personalized notifications and reminders.";

export function ManageNotificationsCard() {
  return (
    <ImageBackground
      source={JournalCardImage}
      style={styles.manageNotificationsCard}
      imageStyle={styles.manageNotificationsCardImage}
      contentFit="cover"
    >
      <View style={styles.manageNotificationsOverlay} />
      <View style={styles.manageNotificationsContent}>
        <FilterIcon size={32} color={Colors.light.white} />
        <View style={styles.manageNotificationsTextBlock}>
          <Text style={styles.manageNotificationsDescription}>
            {MANAGE_NOTIFICATIONS_DESCRIPTION}
          </Text>
          <TopSpace top={10} />
          <Pressable
            style={styles.manageNotificationsAction}
            onPress={() => router.push("/notifications")}
          >
            <Text style={styles.manageNotificationsActionText}>
              MANAGE NOTIFICATIONS
            </Text>
            <Feather name="chevron-right" size={16} color={Colors.light.green} />
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}
