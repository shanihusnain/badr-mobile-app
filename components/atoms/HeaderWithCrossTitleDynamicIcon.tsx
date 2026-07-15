import React, { type ReactNode } from "react";
import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const HeaderWithCrossTitleDynamicIcon = ({
  title,
  navigation,
  letterSpacing = 0,
  iconName = "x",
  bgcolor = Colors.light.blackBackground,
  secondTitle = "",
  titleHighlight,
  onBackPress,
  rightIconName,
  rightIcon,
  onRightPress,
  leftButtonBackground,
}: {
  title: string;
  navigation: any;
  letterSpacing?: number;
  iconName?: keyof typeof Feather.glyphMap;
  bgcolor?: string;
  secondTitle?: string;
  /** Optional prefix rendered in green (e.g. "01") */
  titleHighlight?: string;
  onBackPress?: () => void;
  rightIconName?: keyof typeof Feather.glyphMap;
  /** Custom right icon node (takes precedence over rightIconName). */
  rightIcon?: ReactNode;
  onRightPress?: () => void;
  leftButtonBackground?: string;
}) => (
  <View
    style={{
      height: 100,
      position: "relative",
      paddingTop: 40,
      backgroundColor: bgcolor ?? Colors.light.blackBackground,
    }}
  >
    {/* Centered title */}
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 40,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
      }}
      pointerEvents="none"
    >
      {!!title || !!titleHighlight ? (
        <Text
          style={{
            color: Colors.light.white,
            fontFamily: fonts.primary.semiBold,
            fontSize: 14,
            letterSpacing: letterSpacing,
          }}
        >
          {!!titleHighlight && (
            <Text style={{ color: Colors.light.green }}>{titleHighlight} </Text>
          )}
          {title}
        </Text>
      ) : null}
      {!!secondTitle && (
        <Text
          style={{
            color: Colors.light.white,
            fontFamily: fonts.primary.semiBold,
            fontSize: 16,
            letterSpacing: letterSpacing,
            marginTop: 2,
            textTransform: "uppercase",
          }}
        >
          {secondTitle}
        </Text>
      )}
    </View>

    {/* Close button — fixed top-left position */}
    <Pressable
      style={{
        position: "absolute",
        left: 18,
        top: 52,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: leftButtonBackground ?? Colors.light.greybuttonBackground,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
      }}
      onPress={() => (onBackPress ? onBackPress() : navigation.goBack())}
    >
      <Feather name={iconName} size={20} color={Colors.light.white} />
    </Pressable>

    {rightIcon || rightIconName ? (
      <Pressable
        style={{
          position: "absolute",
          right: 18,
          top: 52,
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: rightIcon
            ? "transparent"
            : Colors.light.greybuttonBackground,
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10,
        }}
        onPress={onRightPress}
        hitSlop={8}
      >
        {rightIcon ?? (
          <Feather
            name={rightIconName!}
            size={18}
            color={Colors.light.white}
          />
        )}
      </Pressable>
    ) : null}
  </View>
);

export default HeaderWithCrossTitleDynamicIcon;