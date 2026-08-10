import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { GreenDash } from "@/components/atoms/GreenDash";
import { TopSpace } from "@/components/atoms/TopSpace";
import { globalStyles } from "@/src/globalstyles/globalstyles";
import { changeLanguage } from "@/i18next/changeLanguage";
import {
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "@/i18next/i18next";
import { useTranslation } from "react-i18next";
import {
  Text,
  TouchableOpacity,
  View,
  Alert,
  Pressable,
  ScrollView,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import { router, useNavigation } from "expo-router";
import PrimaryButton from "@/components/atoms/Primary-button";
import { FrameIndicator } from "./components/FrameIndicator";
import { GoalProgressCard } from "./components/GoalProgressCard";
import { TutorialVideoPlayer } from "./components/TutorialVideoPlayer";
import { styles } from "./styles";
import Header from "@/components/Header";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const SetPersonalizedGoalsScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const currentLanguage = i18n.language as SupportedLanguage;

  const [activeFrame, setActiveFrame] = useState(1);

  const handleLanguageChange = useCallback(
    (lang: SupportedLanguage) => {
      if (lang === currentLanguage) return;

      const isDirectionChange =
        (lang === "ar" && currentLanguage !== "ar") ||
        (lang !== "ar" && currentLanguage === "ar");

      if (isDirectionChange) {
        Alert.alert(
          "Restart Required",
          "The app needs to restart to apply the new layout direction.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Restart",
              onPress: () => changeLanguage(lang),
            },
          ],
        );
      } else {
        changeLanguage(lang);
      }
    },
    [currentLanguage],
  );

  useEffect(() => {
    if (activeFrame === 2) {
      navigation.setOptions({
        headerShown: true,
        header: () => (
          <Header
            title={t("setpersonalizedgoals.tutorial")}
            onBackPress={() => setActiveFrame(1)}
          />
        ),
      });
    } else {
      navigation.setOptions({
        headerShown: true,
        header: () => (
          <Header
            title={t("setpersonalizedgoals.Setyourperosnalizedgoals")}
            showBackBtn={false}
            fontSize={18}
            textAlign="left"
            lineHeight={24}
          />
        ),
      });
    }
  }, [activeFrame, navigation, t]);

  const onWatchTutorialPress = useCallback(() => {
    setActiveFrame(2);
  }, []);

  const handleSkipTutorial = useCallback(() => {
    router.push("/monthlygoalplanner");
  }, []);

  return (
    <BlackScreenWrapper>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Frame 1 sub-header ── */}
        {activeFrame === 2 && (
          <>
            <Text style={globalStyles.onboardingHeading}>
              {t("setpersonalizedgoals.Setyourperosnalizedgoals")}
            </Text>
            <TopSpace top={14} />
          </>
        )}
        <View style={globalStyles.rowCenter}>
          <GreenDash />
          <Text style={styles.howItWorksText}>
            {t("setpersonalizedgoals.howItWorks")}
          </Text>
        </View>
        <FrameIndicator total={2} active={activeFrame} />
        {activeFrame === 1 && (
          <GoalProgressCard
            currentDay={28}
            totalDays={28}
            lastActiveDays={28}
            overallProgress={100}
            animate
          />
        )}
        {activeFrame === 1 && (
          <>
            <TopSpace top={16} />
            <Text style={styles.descriptionText}>
              {t("setpersonalizedgoals.setPersonalizedDescription")}
            </Text>
          </>
        )}
        {activeFrame === 2 && (
          <TutorialVideoPlayer onSkip={handleSkipTutorial} />
        )}
        {activeFrame === 1 && (
          <View style={{ marginTop: 24, paddingBottom: 16 }}>
            <Pressable
              onPress={onWatchTutorialPress}
              style={{
                alignSelf: "center",
              }}
            >
              <Text style={globalStyles.greenCTA}>
                {t("setpersonalizedgoals.watchTutorial")}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </BlackScreenWrapper>
  );
};
