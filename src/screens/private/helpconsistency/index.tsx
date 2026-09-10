import { fonts } from "@/assets/fonts";
import {
  CheckBox,
  CrossBox,
  ExerciseIcon,
  HelpingIcon,
  PercentageIcon,
} from "@/assets/icons";
import { PrayringIcon } from "@/assets/icons/PrayringIcon";
import { SadaqahIcon } from "@/assets/icons/SadaqahIcon";
import { TimelineImage } from "@/assets/images";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import { Image } from "expo-image";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const HelpConsistency = () => {
  const insets = useSafeAreaInsets();
  const icons = [
    <PrayringIcon />,
    <SadaqahIcon />,
    <ExerciseIcon />,
    <HelpingIcon />,
  ];
  return (
    <BlackScreenWrapper edges={["left", "right", "bottom"]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 48 },
        ]}
      >
        <TopSpace top={24} />
        <Text style={styles.header}>
          {"How do we calculate your overall consistency?".toLocaleUpperCase()}
        </Text>
        <TopSpace top={50} />
        <View style={styles.iconsContainer}>
          {[icons.slice(0, 2), icons.slice(2, 4)].map((row, rowIndex) => (
            <View key={rowIndex} style={styles.iconsRow}>
              {row.map((icon, index) => (
                <View key={index}>{icon}</View>
              ))}
            </View>
          ))}
        </View>
        <TopSpace top={50} />
        <Text style={styles.header}>Count Total Habits</Text>
        <TopSpace top={8} />
        <Text style={styles.description}>
          We count the total number of habits you have completed in a day.
        </Text>
        <TopSpace top={10} />
        <Image
          source={TimelineImage}
          contentFit="contain"
          style={styles.timelineImage}
        />
        <TopSpace top={50} />
        <Text style={styles.header}>Calculate Total Opportunities</Text>
        <TopSpace top={8} />
        <Text style={styles.description}>
          We multiply the total behaviors by the number of days in the selected
          period.
        </Text>
        <TopSpace top={50} />
        <View style={styles.checkboxContainer}>
          <CheckBox />
          <CrossBox />
        </View>
        <TopSpace top={50} />
        <Text style={styles.header}>Count Completed Habits</Text>
        <TopSpace top={8} />
        <Text style={styles.description}>
          We check how many times you marked your habits as completed during the
          selected period.
        </Text>
        <TopSpace top={50} />
        <View style={{ alignItems: "center" }}>
          <PercentageIcon />
        </View>
        <TopSpace top={50} />
        <Text style={styles.header}>Calculate Consistency</Text>
        <TopSpace top={8} />
        <Text style={styles.description}>
          We divide completed behaviors by total opportunities, then multiply by
          100
        </Text>
      </ScrollView>
    </BlackScreenWrapper>
  );
};
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    lineHeight: 27,
  },
  iconsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 48,
    alignItems: "center",
  },
  iconsContainer: {
    gap: 40,
    alignItems: "center",
  },
  description: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    lineHeight: 21,
  },
  timelineImage: {
    width: "50%",
    height: 100,
    alignSelf: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    alignItems: "center",
  },
});
