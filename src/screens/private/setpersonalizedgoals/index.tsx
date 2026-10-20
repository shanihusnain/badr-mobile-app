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
  Platform,
} from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { router, useNavigation } from "expo-router";
import PrimaryButton from "@/components/atoms/Primary-button";
import { TutorialVideoPlayer } from "./components/TutorialVideoPlayer";
import { styles } from "./styles";
import Header from "@/components/Header";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { setPendingOnboardingRoute } from "@/src/storage/onboardingRouteStorage";
import { GoalProgressCard } from "./components/GoalProgressCard";
import { useGetMe } from "@/src/api/queries/useGetMe";
import { useAuth } from "@/provider/useAuth";
import { ms } from "@/src/utils/responsive";

export const SetPersonalizedGoalsScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const currentLanguage = i18n.language as SupportedLanguage;
  // Prefer auth cache (instant, same as greetings); /me only as fallback.
  const { user: authUser } = useAuth();
  const { data: meUser } = useGetMe();

  const displayName = useMemo(() => {
    const fromUsername =
      authUser?.username?.trim() || meUser?.username?.trim();
    if (fromUsername) return fromUsername;
    const email =
      authUser?.email?.trim() || meUser?.email?.trim() || "";
    return email.split("@")[0]?.trim() || "";
  }, [
    authUser?.email,
    authUser?.username,
    meUser?.email,
    meUser?.username,
  ]);

  const [activeFrame, setActiveFrame] = useState(1);

  useEffect(() => {
    void setPendingOnboardingRoute("/(private)/setpersonalizedgoals");
  }, []);

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
    console.log("🟢 activeFrame changed to:", activeFrame);
    if (activeFrame === 2) {
      console.log("📺 Showing tutorial frame");
      navigation.setOptions({
        headerShown: true,
        header: () => (
          <Header
            title={t("setpersonalizedgoals.intro")}
            onBackPress={() => setActiveFrame(1)}
          />
        ),
      });
    } else {
      console.log("📋 Showing goals frame");
      navigation.setOptions({
        headerShown: true,
        header: () => (
          <Header
            title={t("setpersonalizedgoals.Setyourperosnalizedgoals", {
              name: displayName,
            })}
            showBackBtn={false}
            fontSize={18}
            textAlign="left"
            lineHeight={22}
            forceSmallCaps
            extraTopPadding={Platform.OS === "ios" ? 10 : 0}
          />
        ),
      });
    }
  }, [activeFrame, displayName, navigation, t]);

  const onWatchTutorialPress = useCallback(() => {
    console.log("👁️ Watch tutorial pressed");
    setActiveFrame(2);
  }, []);

  const handleSkipTutorial = useCallback(() => {
    // Open the full-screen goal planner with the cycle tab selected.

    router.push({
      pathname: "/(private)/monthlygoalplanner",
      // params: { tab: "cycle" },
    });
  }, []);

  return (
    <BlackScreenWrapper edges={["bottom", "left", "right"]}>
      {activeFrame === 1 ? (
        <>
          <ScrollView
            style={{}}
            contentContainerStyle={{}}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View
              style={[
                globalStyles.rowCenter,
                {
                  marginTop: ms(22),
                },
              ]}
            >
              <GreenDash />
              <Text style={styles.howItWorksText}>
                {t("setpersonalizedgoals.howItWorks")}
              </Text>
            </View>
            {/* npxe */}
            {activeFrame === 1 && (
              <>
                <TopSpace top={ms(30)} />
                <GoalProgressCard
                  currentDay={28}
                  totalDays={28}
                  lastActiveDays={28}
                  overallProgress={100}
                  animate
                />
              </>
            )}
            <TopSpace top={ms(26)} />
            <Text style={styles.descriptionText}>
              {t("setpersonalizedgoals.setPersonalizedDescription")}
            </Text>
            <View
              style={{
                alignSelf: "center",
                marginTop: ms(36),
              }}
            >
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
          </ScrollView>
        </>
      ) : (
        <View style={styles.introVideoScreen}>
          <TutorialVideoPlayer onSkip={handleSkipTutorial} />
        </View>
      )}
    </BlackScreenWrapper>
  );
};
