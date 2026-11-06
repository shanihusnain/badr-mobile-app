import { fonts } from "@/assets/fonts";
import { HeaderWithCrossTitleDynamicIcon } from "@/components/atoms/HeaderWithCrossTitleDynamicIcon";
import { LoadingComponent } from "@/components/atoms/LoadingComponent";
import { Colors } from "@/constants/theme";
import { useCreateConnectTeam } from "@/src/api/mutations/useCreateConnectTeam";
import { useGetConnectTeamOptions } from "@/src/api/queries/useGetConnectTeamOptions";
import axios from "axios";
import { router, useNavigation } from "expo-router";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { Alert, Text, View } from "react-native";
import { ChooseBannerStep } from "./components/ChooseBannerStep";
import { ChooseLeaderboardStep } from "./components/ChooseLeaderboardStep";
import { ChooseLogoStep } from "./components/ChooseLogoStep";
import { ChooseTeamNameStep } from "./components/ChooseTeamNameStep";
import { createTeamStyles as styles } from "./styles";
import type { TeamBanner } from "./teamBannerMockData";
import type { TeamLogo } from "./teamLogoMockData";

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
  const { data: teamOptions, isLoading, isError } = useGetConnectTeamOptions();
  const { mutateAsync: createTeam, isPending: isCreating } =
    useCreateConnectTeam();

  const [step, setStep] = useState<CreateTeamStep>("name");
  const [teamName, setTeamName] = useState("");
  const [bannerUri, setBannerUri] = useState<string | null>(null);
  const [bannerKey, setBannerKey] = useState<string | null>(null);
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [logoKey, setLogoKey] = useState<string | null>(null);

  const bannerItems = useMemo<TeamBanner[]>(
    () =>
      (teamOptions?.banners ?? []).map((banner) => ({
        id: banner.key,
        uri: banner.url,
      })),
    [teamOptions?.banners],
  );

  const logoItems = useMemo<TeamLogo[]>(
    () =>
      (teamOptions?.logos ?? []).map((logo) => ({
        id: logo.key,
        uri: logo.url,
      })),
    [teamOptions?.logos],
  );

  const metricCategories = teamOptions?.metricCategories ?? [];
  const maxMetricsPerCategory = teamOptions?.maxMetricsPerCategory ?? 2;

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

  const handleBannerNext = (uri: string, key?: string) => {
    setBannerUri(uri);
    setBannerKey(key?.startsWith("upload-") ? null : (key ?? null));
    setStep("logo");
  };

  const handleLogoNext = (uri: string, key?: string) => {
    setLogoUri(uri);
    setLogoKey(key?.startsWith("upload-") ? null : (key ?? null));
    setStep("leaderboard");
  };

  const handleLeaderboardNext = useCallback(
    async (selectedByCategory: Record<string, string[]>) => {
      const name = teamName.trim();
      const metrics = Object.values(selectedByCategory).flat();

      if (!name) {
        Alert.alert("Missing team name", "Please enter a team name.");
        return;
      }

      if (!bannerKey || !logoKey) {
        Alert.alert(
          "Select banner and logo",
          "Please choose a banner and logo from the gallery (custom uploads are not supported yet).",
        );
        return;
      }

      if (metrics.length === 0) {
        Alert.alert(
          "Select leaderboards",
          "Please choose at least one leaderboard metric.",
        );
        return;
      }

      try {
        const created = await createTeam({
          name,
          bannerKey,
          logoKey,
          metrics,
        });

        router.replace({
          pathname: "/teamprofile",
          params: {
            teamName: created?.name ?? name,
            ...(typeof created?.id === "string" ? { teamId: created.id } : {}),
            ...(bannerUri ? { bannerUri } : {}),
            ...(logoUri ? { logoUri } : {}),
            ...(typeof created?.bannerUrl === "string"
              ? { bannerUri: created.bannerUrl }
              : {}),
            ...(typeof created?.logoUrl === "string"
              ? { logoUri: created.logoUrl }
              : {}),
          },
        });
      } catch (error: unknown) {
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message ?? error.message
          : error instanceof Error
            ? error.message
            : "Unable to create team. Please try again.";
        Alert.alert("Create team failed", String(message));
      }
    },
    [bannerKey, bannerUri, createTeam, logoKey, logoUri, teamName],
  );

  if (isLoading) {
    return (
      <View style={[styles.screen, { justifyContent: "center" }]}>
        <LoadingComponent size="large" />
      </View>
    );
  }

  if (isError || !teamOptions) {
    return (
      <View
        style={[
          styles.screen,
          { justifyContent: "center", paddingHorizontal: 24 },
        ]}
      >
        <Text
          style={{
            color: Colors.light.white,
            fontFamily: fonts.primary.medium,
            fontSize: 14,
            textAlign: "center",
          }}
        >
          Unable to load team options. Please try again.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {step === "name" ? (
        <ChooseTeamNameStep
          teamName={teamName}
          onChangeTeamName={setTeamName}
          onNext={handleNameNext}
        />
      ) : step === "banner" ? (
        <ChooseBannerStep items={bannerItems} onNext={handleBannerNext} />
      ) : step === "logo" ? (
        <ChooseLogoStep items={logoItems} onNext={handleLogoNext} />
      ) : (
        <ChooseLeaderboardStep
          categories={metricCategories}
          maxMetricsPerCategory={maxMetricsPerCategory}
          isSubmitting={isCreating}
          onNext={handleLeaderboardNext}
        />
      )}
    </View>
  );
};
