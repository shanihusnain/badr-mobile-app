import { fonts } from "@/assets/fonts";
import { TimePieceIcon } from "@/assets/icons";
import { TutorialClockIcon } from "@/assets/icons/TutorialClockIcon";
import { TutorialPlayIcon } from "@/assets/icons/TutorialPlayIcon";
import { Colors } from "@/constants/theme";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

const DUMMY_VIDEO_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

/** Tutorial length shown in Figma while real asset is wired. */
const TUTORIAL_DURATION_SEC = 45;

interface TutorialVideoPlayerProps {
  videoUrl?: string;
  onSkip?: () => void;
}

export const TutorialVideoPlayer = ({
  videoUrl = DUMMY_VIDEO_URL,
  onSkip,
}: TutorialVideoPlayerProps) => {
  const { t } = useTranslation();
  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = false;
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  const handleTogglePlayback = useCallback(() => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  }, [isPlaying, player]);

  const durationLabel = t("setpersonalizedgoals.durationSec", {
    count: TUTORIAL_DURATION_SEC,
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.player}>
        <VideoView
          style={StyleSheet.absoluteFill}
          player={player}
          nativeControls={false}
          contentFit="cover"
          allowsPictureInPicture
        />

        {!isPlaying && <View pointerEvents="none" style={styles.dimOverlay} />}

        <Pressable style={styles.centerHitArea} onPress={handleTogglePlayback}>
          {!isPlaying && (
            <View style={styles.playCircle}>
              <View style={styles.playIconOffset}>
                <TutorialPlayIcon size={28} />
              </View>
            </View>
          )}
        </Pressable>

        <View style={styles.footer} pointerEvents="box-none">
          <View style={styles.durationRow}>
            <TimePieceIcon />
            <Text style={styles.durationText}>{durationLabel}</Text>
          </View>

          <Pressable onPress={onSkip} hitSlop={8}>
            <Text style={[styles.skipText]}>
              {t("setpersonalizedgoals.skip")}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const PLAY_SIZE = 64;

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 16,
    flex: 1,
    width: "100%",
  },
  player: {
    flex: 1,
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Colors.light.calendarBg,
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  centerHitArea: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  playCircle: {
    width: PLAY_SIZE,
    height: PLAY_SIZE,
    borderRadius: PLAY_SIZE / 2,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.7,
  },
  playIconOffset: {
    marginLeft: 3,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  durationText: {
    color: Colors.light.grey,
    fontFamily: fonts.primary.regular,
    fontSize: 10,
    lineHeight: 18,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    fontWeight: "400",
  },
  skipText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    textDecorationLine: "underline",
    fontWeight: "500",
  },
});
