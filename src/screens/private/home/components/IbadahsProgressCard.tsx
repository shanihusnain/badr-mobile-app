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
  /** Show "---" for goals count + ring until the categories API responds. */
  loading?: boolean;
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
  loading = false,
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
      disabled={!onPress || loading}
    >
      <View style={styles.leftSection}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: iconBgColor || Colors.light.calendarBg },
          ]}
        >
          {loading ? (
            <Text style={styles.iconPlaceholder}>---</Text>
          ) : (
            icon
          )}
        </View>
        <View style={styles.textWrapper}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{loading ? "---" : subtitle}</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <TaperedCircleBorder
          percentage={loading ? "0%" : percentage}
          borderColor={Colors.light.dullWhiteOpacity}
          size={70}
          variant="illuminated"
        >
          <View style={styles.percentTextContainer}>
            {loading ? (
              <Text style={styles.percentText}>---</Text>
            ) : (
              <>
                <Text style={styles.percentText}>{percentNum}</Text>
                <Text style={styles.percentSymbol}>%</Text>
              </>
            )}
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
    iconPlaceholder: {
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontWeight: "600",
        fontSize: 11,
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
        width: 50,
        height: 50,
        overflow: "visible",
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
