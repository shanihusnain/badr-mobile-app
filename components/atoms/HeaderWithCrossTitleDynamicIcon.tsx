import React from "react";
import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const HeaderWithCrossTitleDynamicIcon = ({
  title,
  navigation,
  letterSpacing = 0,
  iconName = "x",
}: {
  title: string;
  navigation: any;
  letterSpacing?: number;
  iconName?: keyof typeof Feather.glyphMap;
}) => (
  <View
    style={{
      height: 100,
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 40,
      paddingHorizontal: 24,
      backgroundColor: Colors.light.blackBackground,
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
      <Text
        style={{
          color: Colors.light.white,
          fontFamily: fonts.primary.semiBold,
          fontSize: 14,
          letterSpacing: letterSpacing,
        }}
      >
        {title}
      </Text>
    </View>

    {/* Close button — sits on top of title via zIndex */}
    <Pressable
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.light.greybuttonBackground,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
      }}
      onPress={() => navigation.goBack()}
    >
      <Feather name={iconName} size={20} color={Colors.light.white} />
    </Pressable>
  </View>
);
