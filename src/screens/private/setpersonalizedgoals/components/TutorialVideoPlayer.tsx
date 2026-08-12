import { fonts } from "@/assets/fonts";
import { TimePieceIcon } from "@/assets/icons";
import { TutorialPlayIcon } from "@/assets/icons/TutorialPlayIcon";
import { Colors } from "@/constants/theme";
import {
  createVideoPlayer,
  VideoView,
  type VideoPlayer,
  type VideoSource,
} from "expo-video";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

/** Bundled scenic placeholder (CC0 nature clip) until the real tutorial is wired. */
const PLACEHOLDER_VIDEO_SOURCE: VideoSource = require("@/assets/videos/tutorial-scenery.mp4");

/** Tutorial length shown in Figma while real asset is wired. */
const TUTORIAL_DURATION_SEC = 45;

/** Match BlackScreenWrapper padding so the player can span nearly full width. */
const PARENT_HORIZONTAL_PADDING = 16;
const SCREEN_SIDE_INSET = 8;
const PLAYER_WIDTH = Dimensions.get("window").width - SCREEN_SIDE_INSET * 2;

interface TutorialVideoPlayerProps {
  videoUrl?: string;
  onSkip?: () => void;
}

export const TutorialVideoPlayer = ({
  videoUrl,
  onSkip,
}: TutorialVideoPlayerProps) => {
  const { t } = useTranslation();
  const source: VideoSource = videoUrl ?? PLACEHOLDER_VIDEO_SOURCE;
  const [player, setPlayer] = useState<VideoPlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Manage the native player ourselves — useVideoPlayer can hand back a released
  // SharedObject after React Strict Mode / Fast Refresh remounts.
  useEffect(() => {
    const nextPlayer = createVideoPlayer(source);
    nextPlayer.loop = true;
    setPlayer(nextPlayer);
    setIsPlaying(nextPlayer.playing);

    const subscription = nextPlayer.addListener(
      "playingChange",
      ({ isPlaying: playing }) => {
        setIsPlaying(playing);
      },
    );

    return () => {
      subscription.remove();
      try {
        nextPlayer.pause();
        nextPlayer.release();
      } catch {
        // Already released during Strict Mode / Fast Refresh teardown.
      }
      setPlayer(null);
      setIsPlaying(false);
    };
  }, [source]);

  const handleTogglePlayback = useCallback(() => {
    if (!player) return;
    try {
      if (player.playing) {
        player.pause();
      } else {
        player.play();
      }
    } catch {
      // Native player already released (e.g. mid-unmount).
    }
  }, [player]);

  const durationLabel = t("setpersonalizedgoals.durationSec", {
    count: TUTORIAL_DURATION_SEC,
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.player}>
        {player ? (
          <VideoView
            style={StyleSheet.absoluteFill}
            player={player}
            nativeControls={false}
            contentFit="cover"
            allowsPictureInPicture
          />
        ) : null}

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
            <Text style={styles.skipText}>
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
    width: PLAYER_WIDTH,
    marginHorizontal: -(PARENT_HORIZONTAL_PADDING - SCREEN_SIDE_INSET),
    alignSelf: "center",
    borderRadius: 18,
  },
  player: {
    flex: 1,
    width: "100%",
    borderRadius: 18,
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
