import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { LoadingComponent } from "@/components/atoms/LoadingComponent";
import { Colors } from "@/constants/theme";
import { TutorialPlayIcon } from "@/assets/icons/TutorialPlayIcon";
import { TutorialClockIcon } from "@/assets/icons/TutorialClockIcon";
import { TutorialVideoPlayer } from "@/src/screens/private/setpersonalizedgoals/components/TutorialVideoPlayer";
import { useMarkTutorialViewed } from "@/src/api/mutations/useMarkTutorialViewed";
import {
  isTutorialViewKey,
  useGetTutorials,
  type TutorialTask,
} from "@/src/api/queries/useGetTutorials";
import { TutorialChartCard } from "./components/TutorialChartCard";
import {
  TUTORIAL_CHART_KEYS,
  TUTORIAL_SVG_CHART_KEYS,
  TUTORIAL_TASKS_WITH_BAKED_TITLE,
  chartSeriesForKey,
  resolveTaskImage,
  resolveVideoThumbnail,
} from "./taskAssets";
import { tutorialsStyles as styles } from "./style";

export default function TutorialsScreen() {
  const router = useRouter();
  const { data, isLoading } = useGetTutorials();
  const markViewed = useMarkTutorialViewed();
  const [videoVisible, setVideoVisible] = useState(false);

  const progressRatio = useMemo(() => {
    const total = Math.max(data?.progress?.total ?? 8, 1);
    const completed = Math.min(data?.progress?.completed ?? 0, total);
    return completed / total;
  }, [data?.progress?.completed, data?.progress?.total]);

  const markIfViewKey = useCallback(
    (key: string) => {
      if (!isTutorialViewKey(key)) return;
      markViewed.mutate(key);
    },
    [markViewed],
  );

  const handleOpenVideo = useCallback(() => {
    setVideoVisible(true);
    markIfViewKey(data?.video?.key ?? "INTRO_VIDEO");
  }, [data?.video?.key, markIfViewKey]);

  const handleCloseVideo = useCallback(() => {
    setVideoVisible(false);
  }, []);

  const handleTaskPress = useCallback(
    (task: TutorialTask) => {
      switch (task.key) {
        case "PERSONALIZE_NOTIFICATIONS":
          router.push("/(private)/notifications");
          return;
        case "SET_UP_JOURNAL":
          router.push("/(private)/journalappsetting");
          return;
        case "VIEW_IBADAT_DETAILS":
          markIfViewKey(task.key);
          router.push("/(tabs)/(home)");
          return;
        case "WEEK_IN_REVIEW":
          markIfViewKey(task.key);
          router.push("/(tabs)/(home)");
          return;
        case "MONTHLY_PROGRESS":
          markIfViewKey(task.key);
          router.push("/(private)/monthlygoalplanner");
          return;
        case "FORGE_SUPPORT_TEAM":
          router.push("/(private)/createteam");
          return;
        case "PREPARE_NEXT_CYCLE":
          router.push("/(private)/monthlygoalplanner");
          return;
        default:
          if (isTutorialViewKey(task.key)) {
            markIfViewKey(task.key);
          }
      }
    },
    [markIfViewKey, router],
  );

  if (isLoading && !data) {
    return (
      <BlackScreenWrapper>
        <View style={styles.loadingWrap}>
          <LoadingComponent size="large" />
        </View>
      </BlackScreenWrapper>
    );
  }

  if (!data) {
    return (
      <BlackScreenWrapper>
        <Text style={styles.emptyText}>Tutorials not available.</Text>
      </BlackScreenWrapper>
    );
  }

  const videoThumb = resolveVideoThumbnail(
    data.video?.thumbnailUrl ?? data.video?.imageUrl,
  );

  return (
    <BlackScreenWrapper>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.welcomeTitle}>{data.welcome?.title}</Text>
        {data.welcome?.message ? (
          <Text style={styles.welcomeMessage}>{data.welcome.message}</Text>
        ) : null}

        <Pressable style={styles.videoCard} onPress={handleOpenVideo}>
          <Image
            source={videoThumb}
            style={styles.videoImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={[
              "rgba(8, 26, 47, 0.15)",
              "transparent",
              "rgba(8, 26, 47, 0.55)",
            ]}
            locations={[0, 0.45, 1]}
            style={styles.videoGradient}
            pointerEvents="none"
          />
          <View style={styles.videoPlayCenter} pointerEvents="none">
            <View style={styles.videoPlayCircle}>
              <TutorialPlayIcon size={22} color={Colors.light.white} />
            </View>
          </View>
          <View style={styles.videoFooter} pointerEvents="none">
            <View style={styles.videoDurationRow}>
              <TutorialClockIcon size={13} color={Colors.light.white} />
              <Text style={styles.videoDuration}>
                {data.video?.durationLabel ?? ""}
              </Text>
            </View>
            {data.video?.done ? (
              <View style={styles.videoDoneBadge}>
                <Feather name="check" size={16} color={Colors.light.blackBackground} />
              </View>
            ) : null}
          </View>
        </Pressable>

        <Text style={styles.progressLabel}>
          {data.progress?.label ??
            `${data.progress?.completed ?? 0}/${data.progress?.total ?? 8} TASKS COMPLETED`}
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
        </View>

        {(data.tasks ?? []).map((task) => {
          const isChart = TUTORIAL_CHART_KEYS.has(task.key);
          const useSvgChart = TUTORIAL_SVG_CHART_KEYS.has(task.key);
          const hasBakedTitle = TUTORIAL_TASKS_WITH_BAKED_TITLE.has(task.key);
          const image = resolveTaskImage(
            task.key,
            task.imageUrl ?? task.thumbnailUrl,
          );
          const series = useSvgChart ? chartSeriesForKey(task.key) : null;

          return (
            <Pressable
              key={task.key}
              style={[styles.taskCard, isChart && styles.taskCardTall]}
              onPress={() => handleTaskPress(task)}
            >
              {useSvgChart && series ? (
                <TutorialChartCard title={task.title} {...series} />
              ) : image ? (
                <Image
                  source={image}
                  style={styles.taskImage}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={[
                    styles.taskImage,
                    { backgroundColor: Colors.light.greybuttonBackground },
                  ]}
                />
              )}
              {!hasBakedTitle && !useSvgChart ? (
                <>
                  <LinearGradient
                    colors={[
                      "rgba(8, 26, 47, 0.1)",
                      "rgba(8, 26, 47, 0.35)",
                      "rgba(8, 26, 47, 0.88)",
                    ]}
                    locations={[0, 0.45, 1]}
                    style={styles.taskGradient}
                    pointerEvents="none"
                  />
                  <View style={styles.taskTitleWrap}>
                    <Text style={styles.taskTitle} numberOfLines={3}>
                      {task.title}
                    </Text>
                  </View>
                </>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>

      <Modal
        visible={videoVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleCloseVideo}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.videoModal}>
          <TutorialVideoPlayer
            videoUrl={data.video?.url ?? undefined}
            onSkip={handleCloseVideo}
          />
        </View>
      </Modal>
    </BlackScreenWrapper>
  );
}
