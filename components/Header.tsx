import React, { useMemo } from "react";
import { Text, TextStyle, View } from "react-native";
import { fonts } from "../assets/fonts";
import { Colors } from "../constants/theme";
import BackButton from "./atoms/Backbutton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getFigmaForcedSmallCapsTextStyle,
  prepareFigmaForcedSmallCapsText,
} from "@/src/utils/figmaTypography";
import { rfs } from "@/src/utils/responsive";

interface HeaderProps {
  title: string;
  backgroundColor?: string;
  onBackPress?: () => void;
  arrowBg?: string;
  showBackBtn?: boolean;
  fontSize?: number;
  textAlign?: TextStyle["textAlign"];
  lineHeight?: number;
  /**
   * Figma “Forced small caps” — uniform short small-cap height for every letter
   * via `getFigmaForcedSmallCapsTextStyle` + lowercased display text.
   */
  forceSmallCaps?: boolean;
  /** Extra space below the safe-area inset (screen-specific tweaks). */
  extraTopPadding?: number;
  /** Extra space under the title row before screen content (screen-specific). */
  extraBottomPadding?: number;
}

const SIDE_SLOT_WIDTH = 40;

const Header: React.FC<HeaderProps> = ({
  title,
  backgroundColor,
  onBackPress,
  arrowBg,
  showBackBtn = true,
  fontSize,
  textAlign,
  lineHeight,
  forceSmallCaps = false,
  extraTopPadding = 0,
  extraBottomPadding = 0,
}) => {
  const insets = useSafeAreaInsets();
  const showSideSlots = showBackBtn;
  const resolvedFontSize = fontSize ?? rfs(14);
  const resolvedLineHeight = lineHeight ?? rfs(18);

  const displayTitle = useMemo(
    () => (forceSmallCaps ? prepareFigmaForcedSmallCapsText(title) : title),
    [forceSmallCaps, title],
  );

  const titleStyle: TextStyle = forceSmallCaps
    ? {
        flex: 1,
        // Don't compress the line — flex-shrink made glyphs feel stretched vs Figma.
        flexShrink: 0,
        marginHorizontal: showSideSlots ? 8 : 0,
        ...getFigmaForcedSmallCapsTextStyle({
          fontSize: resolvedFontSize,
          lineHeight: resolvedLineHeight,
          color: Colors.light.white,
          textAlign: textAlign ?? "center",
        }),
      }
    : {
        flex: 1,
        flexShrink: 1,
        marginHorizontal: showSideSlots ? 8 : 0,
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontWeight: "600",
        fontSize: resolvedFontSize,
        textAlign: textAlign ?? "center",
        lineHeight: resolvedLineHeight,
        letterSpacing: 0,
      };

  return (
    <View
      style={{
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: insets.top + 10 + extraTopPadding,
        paddingBottom: extraBottomPadding,
        backgroundColor: backgroundColor ?? Colors.light.blackBackground,
      }}
    >
      {showSideSlots ? (
        <View style={{ width: SIDE_SLOT_WIDTH, alignItems: "flex-start" }}>
          <BackButton
            onPress={onBackPress}
            bgcolor={arrowBg ? arrowBg : Colors.light.greybuttonBackground}
          />
        </View>
      ) : null}
      {title ? (
        <Text
          numberOfLines={2}
          adjustsFontSizeToFit={!forceSmallCaps}
          minimumFontScale={0.75}
          style={titleStyle}
        >
          {displayTitle}
        </Text>
      ) : (
        <View style={{ flex: 1 }} />
      )}
      {showSideSlots ? <View style={{ width: SIDE_SLOT_WIDTH }} /> : null}
    </View>
  );
};

export default Header;
