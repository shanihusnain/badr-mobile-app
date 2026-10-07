import { fonts } from "@/assets/fonts";
import { Icon } from "@/assets/images";
import { SwitchButton } from "@/components/atoms/SwitchButton";
import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import { ImageBackground } from "expo-image";
import { useState, useEffect, useMemo } from "react";
import { StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { useTranslation } from "react-i18next";

/** Figma shows ~4 lines with "... read more" inline on the last line. */
const DESCRIPTION_MAX_LINES = 4;
const ELLIPSIS = "... ";
/** Approx. average glyph width for 14px primary font. */
const AVG_CHAR_WIDTH = 7.2;

export const GoalCardWithDescriptionAndOptionToSelectGoal = ({
  initialValue = false,
  title,
  description,
  handleSeeMorePRess,
  onToggle,
  onSwicthPress,
  canToggle,
  imageSource,
  isLoading = false,
}: {
  initialValue?: boolean;
  title: string;
  description: string;
  handleSeeMorePRess: () => void;
  onToggle?: (value: boolean) => void;
  onSwicthPress?: () => void;
  /** Return false to block the switch flip (e.g. another goal is unfinished). */
  canToggle?: (nextValue: boolean) => boolean;
  imageSource?: any;
  isLoading?: boolean;
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const isOn = useSharedValue(initialValue);
  const readMoreLabel = t("monthlyGoalPlanner.readMore");

  const displayTitle = isLoading ? "" : title;
  // Strip trailing ellipses from CMS/API copy so we never stack dots with "read more".
  const displayDescription = useMemo(
    () =>
      isLoading
        ? ""
        : description.replace(/(?:\s*\.{2,}|…)+\s*$/u, "").trimEnd(),
    [description, isLoading],
  );

  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (isOn.value !== initialValue) {
      isOn.value = initialValue;
    }
  }, [initialValue, isOn]);

  const truncatedBody = useMemo(() => {
    if (!displayDescription) return "";

    const width = containerWidth > 0 ? containerWidth : 300;
    const charsPerLine = Math.max(18, Math.floor(width / AVG_CHAR_WIDTH));
    const suffixBudget = ELLIPSIS.length + readMoreLabel.length;
    const maxChars = Math.max(
      24,
      charsPerLine * DESCRIPTION_MAX_LINES - suffixBudget,
    );

    if (displayDescription.length <= maxChars) {
      return displayDescription;
    }

    let slice = displayDescription.slice(0, maxChars).trimEnd();
    const lastSpace = slice.lastIndexOf(" ");
    if (lastSpace >= Math.floor(slice.length * 0.5)) {
      slice = slice.slice(0, lastSpace).trimEnd();
    }
    return slice;
  }, [containerWidth, displayDescription, readMoreLabel]);

  const handleSwitchPress = () => {
    if (isLoading) return;
    const newValue = !isOn.value;
    if (canToggle && canToggle(newValue) === false) return;
    isOn.value = newValue;

    // Defer the heavy parent state updates slightly to allow the switch's local
    // animation to start and run with absolute fluidity on the UI thread first.
    setTimeout(() => {
      onToggle?.(newValue);
      onSwicthPress?.();
    }, 50);
  };

  const onBodyLayout = (event: LayoutChangeEvent) => {
    const width = Math.round(event.nativeEvent.layout.width);
    if (width > 0 && width !== containerWidth) {
      setContainerWidth(width);
    }
  };

  return (
    <View style={styles.conatiner}>
      {isLoading ? (
        <View style={[styles.backgroundImage, styles.loadingImage]}>
          <SwitchButton
            value={isOn}
            onPress={handleSwitchPress}
            style={[styles.switch, isRtl && { alignSelf: "flex-start" }]}
            size="small"
          />
        </View>
      ) : (
        <ImageBackground
          style={styles.backgroundImage}
          source={imageSource || Icon}
        >
          <SwitchButton
            value={isOn}
            onPress={handleSwitchPress}
            style={[styles.switch, isRtl && { alignSelf: "flex-start" }]}
            size="small"
          />
        </ImageBackground>
      )}
      <TopSpace top={16} />
      <Text style={[styles.title, isRtl && { textAlign: "right" }]}>
        {displayTitle}
      </Text>
      <TopSpace top={8} />

      <View style={styles.descriptionWrap} onLayout={onBodyLayout}>
        <Text style={[styles.description, isRtl && { textAlign: "right" }]}>
          {truncatedBody}
          {!isLoading && displayDescription ? (
            <Text onPress={handleSeeMorePRess}>
              <Text style={styles.seeMoreEllipsis}>{ELLIPSIS}</Text>
              <Text style={styles.seeMoreText}>{readMoreLabel}</Text>
            </Text>
          ) : null}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  seeMoreText: {
    color: Colors.light.green,
    fontSize: 14,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
  },
  seeMoreEllipsis: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
  },
  descriptionWrap: {
    width: "100%",
  },
  description: {
    color: Colors.light.white,
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0.02,
  },
  title: {
    color: Colors.light.white,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    fontSize: 16,
    lineHeight: 20,
    textTransform: "capitalize",
  },
  backgroundImage: {
    width: "100%",
    height: 120,
    padding: 16,
    borderRadius: 4,
    overflow: "hidden",
  },
  loadingImage: {
    backgroundColor: Colors.light.blackBackground,
  },
  conatiner: {
    borderRadius: 8,
    backgroundColor: Colors.light.greybuttonBackground,
    justifyContent: "center",
    padding: 16,
  },
  switch: {
    alignSelf: "flex-end",
  },
});
