import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { TaperedCircleBorder } from "@/components/atoms/TaperedCircleBorder";

type Props = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  percentage: string;
  progressColor: string;
  isSelected?: boolean;
  onPress?: () => void;
};

export const IbadahsProgressCard = ({
  title,
  subtitle,
  icon,
  iconBgColor,
  percentage,
  progressColor,
  isSelected = false,
  onPress,
}: Props) => {
  const percentNum = percentage.replace("%", "");

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        { borderColor: isSelected ? Colors.light.green : "transparent" },
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.leftSection}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: iconBgColor || Colors.light.calendarBg },
          ]}
        >
          {icon}
        </View>
        <View style={styles.textWrapper}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <TaperedCircleBorder
          percentage={percentage}
          borderColor={Colors.light.dullWhiteOpacity}
          size={50}
          variant="illuminated"
        >
          <View style={styles.percentTextContainer}>
            <Text style={styles.percentText}>{percentNum}</Text>
            <Text style={styles.percentSymbol}>%</Text>
          </View>
        </TaperedCircleBorder>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: "100%",
        //height: 72,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Colors.light.greybuttonBackground,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 19,
        marginBottom: 12,
    },
    leftSection: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    iconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    textWrapper: {
        justifyContent: "center",
    },
    title: {
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontWeight: "700",
        fontSize: 15,
        letterSpacing: 0.5,
        textTransform: "uppercase",
        marginBottom: 2,
    },
    subtitle: {
        color: Colors.light.subtext,
        fontFamily: fonts.primary.regular,
        fontSize: 14,
    },
    rightSection: {
        justifyContent: "center",
        alignItems: "center",
        marginRight: 13,
    },
    percentTextContainer: {
        flexDirection: "row",
        alignItems: "baseline",
        justifyContent: "center",
    },
    percentText: {
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontSize: 12,
        fontWeight: "600",
    },
    percentSymbol: {
        color: Colors.light.white,
        fontFamily: fonts.primary.regular,
        fontSize: 6.5,
        marginLeft: 1,
    },
});
