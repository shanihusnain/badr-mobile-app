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
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Pressable,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import { router, useNavigation } from "expo-router";
import { GreenTextButton } from "@/components/atoms/GreenTextButton";
import { FrameIndicator } from "./components/FrameIndicator";
import { GoalProgressCard } from "./components/GoalProgressCard";
import { TutorialVideoPlayer } from "./components/TutorialVideoPlayer";
import { styles } from "./styles";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";

export const SetPersonalizedGoalsScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const currentLanguage = i18n.language as SupportedLanguage;

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

  const [activeFrame, setActiveFrame] = useState(1);

  useEffect(() => {
    if (activeFrame === 2) {
      navigation.setOptions({
        title: t("SetGoals.tutorial"),
        headerTitleAlign: "center",
        headerLeft: () => (
          <Pressable onPress={() => setActiveFrame(1)} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.light.white} />
          </Pressable>
        ),
      });
    } else {
      navigation.setOptions({
        title: t("SetGoals.Setyourperosnalizedgoals"),
        headerTitleAlign: "left",
        headerLeft: () => null,
        headerBackVisible: false,
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
      {/* ── Frame 1 sub-header ── */}
      {activeFrame === 1 && (
        <View style={globalStyles.rowCenter}>
          <GreenDash />
          <Text style={styles.howItWorksText}>{t("SetGoals.howItWorks")}</Text>
        </View>
      )}
      <FrameIndicator total={2} active={activeFrame} />
      {activeFrame === 1 && (
        <GoalProgressCard
          currentDay={10}
          totalDays={28}
          lastActiveDays={12}
          overallProgress={23}
        />
      )}
      {activeFrame === 1 && (
        <>
          <TopSpace top={16} />
          <Text style={styles.descriptionText}>
            {t("SetGoals.setPersonalizedDescription")}
          </Text>
        </>
      )}
      {activeFrame === 2 && <TutorialVideoPlayer onSkip={handleSkipTutorial} />}
      {/* ── Language Switcher (dummy) ── */}
      <GreenTextButton
        title="WATCH OUR TUTORIAL"
        onPress={onWatchTutorialPress}
      />
      <TopSpace top={32} />
      <View style={styles.languageRow}>
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = lang === currentLanguage;
          return (
            <TouchableOpacity
              key={lang}
              style={[styles.langBtn, isSelected && styles.langBtnActive]}
              onPress={() => handleLanguageChange(lang)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.langText, isSelected && styles.langTextActive]}
              >
                {LANGUAGE_LABELS[lang]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </BlackScreenWrapper>
  );
};
