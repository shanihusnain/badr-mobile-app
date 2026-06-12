import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { useVideoPlayer, VideoView } from "expo-video";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from "react-native-responsive-screen";

// Dummy public video for placeholder
const DUMMY_VIDEO_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

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

  return (
    <View style={styles.wrapper}>
      <VideoView
        style={styles.video}
        player={player}
        nativeControls
        allowsPictureInPicture
      />
      <Pressable style={styles.skipBtn} onPress={onSkip}>
        <Text style={styles.skipText}>{t("setpersonalizedgoals.skip")}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 16,
    alignItems: "center",
  },
  video: {
    width: widthPercentageToDP(92),
    height: heightPercentageToDP(35),
    borderRadius: 12,
    backgroundColor: Colors.light.calendarBg,
  },
  skipBtn: {
    marginTop: 16,
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    color: Colors.light.icon,
    fontSize: 14,
    fontFamily: fonts.primary.medium,
    textDecorationLine: "underline",
  },
});
