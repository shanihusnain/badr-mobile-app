import { HeaderWithCrossTitleDynamicIcon } from "@/components/atoms/HeaderWithCrossTitleDynamicIcon";
import { router, useNavigation } from "expo-router";
import { useLayoutEffect, useState } from "react";
import { View } from "react-native";
import { ChooseBannerStep } from "./components/ChooseBannerStep";
import { ChooseLeaderboardStep } from "./components/ChooseLeaderboardStep";
import { ChooseLogoStep } from "./components/ChooseLogoStep";
import { ChooseTeamNameStep } from "./components/ChooseTeamNameStep";
import type { LeaderboardCategoryId } from "./leaderboardMockData";
import { createTeamStyles as styles } from "./styles";

type CreateTeamStep = "name" | "banner" | "logo" | "leaderboard";

const STEP_META: Record<
  CreateTeamStep,
  { highlight: string; secondTitle: string; backTo: CreateTeamStep | null }
> = {
  name: {
    highlight: "01",
    secondTitle: "CHOOSE TEAM NAME",
    backTo: null,
  },
  banner: {
    highlight: "02",
    secondTitle: "CHOOSE YOUR BANNER",
    backTo: "name",
  },
  logo: {
    highlight: "03",
    secondTitle: "CHOOSE YOUR LOGO",
    backTo: "banner",
  },
  leaderboard: {
    highlight: "04",
    secondTitle: "CHOOSE YOUR LEADERBOARD",
    backTo: "logo",
  },
};

export const CreateTeam = () => {
  const navigation = useNavigation();
  const [step, setStep] = useState<CreateTeamStep>("name");
  const [teamName, setTeamName] = useState("");
  const [bannerUri, setBannerUri] = useState<string | null>(null);
  const [logoUri, setLogoUri] = useState<string | null>(null);

  useLayoutEffect(() => {
    const meta = STEP_META[step];

    navigation.setOptions({
      header: () => (
        <HeaderWithCrossTitleDynamicIcon
          titleHighlight={meta.highlight}
          title="Create Team"
          navigation={navigation}
          bgcolor="transparent"
          secondTitle={meta.secondTitle}
          iconName="chevron-left"
          onBackPress={() => {
            if (meta.backTo) {
              setStep(meta.backTo);
              return;
            }
            navigation.goBack();
          }}
        />
      ),
    });
  }, [navigation, step]);

  const handleNameNext = () => {
    if (!teamName.trim()) return;
    setStep("banner");
  };

  const handleBannerNext = (uri: string) => {
    setBannerUri(uri);
    setStep("logo");
  };

  const handleLogoNext = (uri: string) => {
    setLogoUri(uri);
    setStep("leaderboard");
  };

  const handleLeaderboardNext = (
    selectedByCategory: Record<LeaderboardCategoryId, string[]>,
  ) => {
    console.log("Create team payload:", {
      teamName: teamName.trim(),
      bannerUri,
      logoUri,
      leaderboards: selectedByCategory,
    });

    router.replace({
      pathname: "/teamprofile",
      params: {
        teamName: teamName.trim(),
        ...(bannerUri ? { bannerUri } : {}),
        ...(logoUri ? { logoUri } : {}),
      },
    });
  };

  return (
    <View style={styles.screen}>
      {step === "name" ? (
        <ChooseTeamNameStep
          teamName={teamName}
          onChangeTeamName={setTeamName}
          onNext={handleNameNext}
        />
      ) : step === "banner" ? (
        <ChooseBannerStep onNext={handleBannerNext} />
      ) : step === "logo" ? (
        <ChooseLogoStep onNext={handleLogoNext} />
      ) : (
        <ChooseLeaderboardStep onNext={handleLeaderboardNext} />
      )}
    </View>
  );
};
