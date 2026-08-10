import React from "react";
import { Text, TextStyle, View } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
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
  return (
    <View
      style={{
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: insets.top + 10,
        // paddingBottom: hp(1),
        backgroundColor: backgroundColor ?? Colors.light.blackBackground,
      }}
    >
      {showBackBtn && (
        <BackButton
          onPress={onBackPress}
          bgcolor={arrowBg ? arrowBg : Colors.light.greybuttonBackground}
        />
      )}
      {title ? (
        <Text
          style={{
            color: Colors.light.white,
            fontFamily: fonts.primary.semiBold,
            fontWeight: "600",
            fontSize: fontSize ?? 14,
            textAlign: textAlign ?? "center",
            lineHeight: lineHeight ?? 24,
          }}
        >
          {title}
        </Text>
      ) : (
        <View style={{ width: 130 }} />
      )}
      <View style={{ width: 30 }} />
    </View>
  );
};

export default Header;
