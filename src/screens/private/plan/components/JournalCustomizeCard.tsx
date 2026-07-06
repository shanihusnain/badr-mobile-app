import { FilterIcon } from "@/assets/icons";
import { BeforeJournalCustomization } from "@/assets/images";
import PrimaryButton from "@/components/atoms/Primary-button";
import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import { Image } from "expo-image";
import { Text, View } from "react-native";
import { planStyles as styles } from "../styles";

const CUSTOMIZE_DESCRIPTION =
  "Choose from over 100 behaviors to track daily, fostering growth in your character and helping you become your best self.";

type JournalCustomizeCardProps = {
  onGetStartedPress?: () => void;
};

export function JournalCustomizeCard({
  onGetStartedPress,
}: JournalCustomizeCardProps) {
  return (
    <View style={styles.journalCustomizeCard}>
      <Image
        source={BeforeJournalCustomization}
        style={styles.journalCustomizeImage}
        contentFit="cover"
      />
      <TopSpace top={30} />
      <Text style={styles.journalCustomizeTitle}>Customize Your Journal</Text>
      <TopSpace top={12} />
      <View style={styles.proposedPlanContent}>
        <FilterIcon size={35} color={Colors.light.white} />
        <View style={styles.proposedPlanTextBlock}>
          <Text style={styles.proposedPlanDescription}>
            {CUSTOMIZE_DESCRIPTION}
          </Text>
        </View>
      </View>
      <TopSpace top={30} />
      <PrimaryButton text="Get Started" onPress={onGetStartedPress ?? (() => {})} />
    </View>
  );
}
