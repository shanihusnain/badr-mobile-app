import React from "react";
import { Text, TextStyle, View } from "react-native";
import { fonts } from "../assets/fonts";
import { Colors } from "../constants/theme";
import BackButton from "./atoms/Backbutton";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HeaderProps {
  title: string;
  backgroundColor?: string;
  onBackPress?: () => void;
  arrowBg?: string;
  showBackBtn?: boolean;
  fontSize?: number;
  textAlign?: TextStyle["textAlign"];
  lineHeight?: number;
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
}) => {
  const insets = useSafeAreaInsets();
  const showSideSlots = showBackBtn;

  return (
    <View
      style={{
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: insets.top + 10,
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
          adjustsFontSizeToFit
          minimumFontScale={0.75}
          style={{
            flex: 1,
            flexShrink: 1,
            marginHorizontal: showSideSlots ? 8 : 0,
            color: Colors.light.white,
            fontFamily: fonts.primary.semiBold,
            fontWeight: "600",
            fontSize: fontSize ?? 14,
            textAlign: textAlign ?? "center",
            lineHeight: lineHeight ?? 18,
          }}
        >
          {title}
        </Text>
      ) : (
        <View style={{ flex: 1 }} />
      )}
      {showSideSlots ? <View style={{ width: SIDE_SLOT_WIDTH }} /> : null}
    </View>
  );
};

export default Header;
