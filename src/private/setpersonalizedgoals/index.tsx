import { fonts } from "@/assets/fonts";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { GreenDash } from "@/components/atoms/GreenDash";
import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import { globalStyles } from "@/src/globalstyles/globalstyles";
import { changeLanguage } from "@/i18next/changeLanguage";
import {
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "@/i18next/i18next";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { GreenTextButton } from "@/components/atoms/GreenTextButton";
import { FrameIndicator } from "./components/FrameIndicator";
import { GoalProgressCard } from "./components/GoalProgressCard";
import { TutorialVideoPlayer } from "./components/TutorialVideoPlayer";
import { styles } from "./styles";

export const SetPersonalizedGoalsScreen = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language as SupportedLanguage;

  const handleLanguageChange = (lang: SupportedLanguage) => {
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
  };
  const [activeFrame, setActiveFrame] = useState(1);
  const onWatchTutorialPress = () => {
    setActiveFrame(2);
  };
  return (
    <BlackScreenWrapper>
      <Text style={styles.setPersonalizedGoalText}>
        {t("SetGoals.Setyourperosnalizedgoals")}
      </Text>
      <TopSpace top={16} />
      <View style={globalStyles.rowCenter}>
        <GreenDash />
        <Text style={styles.howItWorksText}>{t("SetGoals.howItWorks")}</Text>
      </View>
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
      {activeFrame === 2 && (
        <TutorialVideoPlayer onSkip={() => setActiveFrame(1)} />
      )}
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
