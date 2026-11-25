import { FilterIcon } from "@/assets/icons";
import { BeforeJournalCustomization } from "@/assets/images";
import PrimaryButton from "@/components/atoms/Primary-button";
import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import { Image } from "expo-image";
import { Text, View } from "react-native";
import { planStyles as styles } from "../styles";

const CUSTOMIZE_TITLE = "Customize Your Journal";
const CUSTOMIZE_DESCRIPTION =
  "Choose from over 100 behaviors to track daily, fostering growth in your character and helping you become your best self.";
const CUSTOMIZE_CTA = "Get Started";

type JournalCustomizeCardProps = {
  onGetStartedPress?: () => void;
  title?: string | null;
  description?: string | null;
  buttonLabel?: string | null;
};

export function JournalCustomizeCard({
  onGetStartedPress,
  title,
  description,
  buttonLabel,
}: JournalCustomizeCardProps) {
  return (
    <View style={styles.journalCustomizeCard}>
      <Image
        source={BeforeJournalCustomization}
        style={styles.journalCustomizeImage}
        contentFit="cover"
      />
      <TopSpace top={30} />
      <Text style={styles.journalCustomizeTitle}>
        {title?.trim() || CUSTOMIZE_TITLE}
      </Text>
      <TopSpace top={12} />
      <View style={styles.journalCustomizeDescriptionRow}>
        <FilterIcon size={35} color={Colors.light.white} />
        <View style={styles.proposedPlanTextBlock}>
          <Text style={styles.journalCustomizeDescription}>
            {description?.trim() || CUSTOMIZE_DESCRIPTION}
          </Text>
        </View>
      </View>
      <TopSpace top={48} />
      <PrimaryButton
        text={buttonLabel?.trim() || CUSTOMIZE_CTA}
        onPress={onGetStartedPress ?? (() => {})}
        style={styles.journalCustomizeButton}
      />
    </View>
  );
}
