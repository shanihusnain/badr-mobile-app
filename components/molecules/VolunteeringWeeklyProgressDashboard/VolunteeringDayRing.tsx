import React from "react";
import { StyleSheet, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Colors } from "@/constants/theme";
import { KaffarahMealIcon } from "@/assets/icons/KaffarahMealIcon";
import type { VolunteeringCategoryId } from "@/src/screens/private/goalprogressloggingscreen/volunteeringCategories";

export type VolunteeringRingCategory = VolunteeringCategoryId | null;

type Props = {
  size: number;
  category: VolunteeringRingCategory;
  hasLog: boolean;
  isBestDay: boolean;
  isToday: boolean;
  isFuture: boolean;
  isBlurDay: boolean;
  showEmptyOutline: boolean;
};

/** Best-day ring is slightly larger (same boost as SinglePrayerDayRing). */
const BEST_DAY_SIZE_BOOST = 6;

function CategoryIcon({
  category,
  size,
  color,
}: {
  category: VolunteeringCategoryId;
  size: number;
  color: string;
}) {
  switch (category) {
    case "distributing-food":
      return <KaffarahMealIcon size={size} color={color} />;
    case "shaping-futures":
      return (
        <MaterialCommunityIcons
          name="account-group"
          size={size}
          color={color}
        />
      );
    case "offering-compassion":
      return (
        <MaterialCommunityIcons
          name="wheelchair-accessibility"
          size={size}
          color={color}
        />
      );
    default:
      return (
        <MaterialCommunityIcons
          name="hand-heart"
          size={size}
          color={color}
        />
      );
  }
}

/**
 * Volunteering 7-day rings:
 * - logged: green circle + white category icon (fitted inside ring)
 * - best day: green circle + gold (#E4D27E) category icon
 * - border only when today grey chip is present
 */
export function VolunteeringDayRing({
  size,
  category,
  hasLog,
  isBestDay,
  isToday,
  isFuture,
  isBlurDay,
  showEmptyOutline,
}: Props) {
  const showBestBoost = isBestDay && hasLog && !isFuture && !showEmptyOutline;
  const circleSize = showBestBoost ? size + BEST_DAY_SIZE_BOOST : size;
  // Keep glyphs inside the green ring (no overflow).
  const iconSize = Math.round(circleSize * 0.55);
  const iconColor = isBestDay
    ? Colors.light.qiyamIconGold
    : Colors.light.white;

  const innerSizeStyle = {
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
  };

  const renderInner = () => {
    if (showEmptyOutline || (isBlurDay && !hasLog)) {
      return (
        <View
          style={[innerSizeStyle, styles.ringInner, styles.ringInnerDimOutline]}
        />
      );
    }

    if (isFuture) {
      return (
        <View
          style={[innerSizeStyle, styles.ringInner, styles.ringInnerFuture]}
        />
      );
    }

    if (hasLog && category) {
      return (
        <View
          style={[
            innerSizeStyle,
            styles.ringInner,
            styles.ringInnerLogged,
            isToday && styles.ringInnerLoggedToday,
          ]}
        >
          <View style={styles.iconSlot}>
            <CategoryIcon
              category={category}
              size={iconSize}
              color={iconColor}
            />
          </View>
        </View>
      );
    }

    if (isToday) {
      return (
        <View
          style={[
            innerSizeStyle,
            styles.ringInner,
            styles.ringInnerSelectedEmpty,
          ]}
        />
      );
    }

    return (
      <View style={[innerSizeStyle, styles.ringInner, styles.ringInnerEmpty]} />
    );
  };

  return (
    <View
      style={[
        styles.ringOuter,
        {
          width: size + BEST_DAY_SIZE_BOOST + 5,
          height: size + BEST_DAY_SIZE_BOOST + 5,
          borderRadius: 8,
        },
        isBlurDay && styles.ringOuterBlur,
      ]}
    >
      {renderInner()}
    </View>
  );
}

const styles = StyleSheet.create({
  ringOuter: {
    alignItems: "center",
    justifyContent: "center",
    borderColor: "transparent",
  },
  ringOuterBlur: {
    opacity: 0.3,
  },
  ringInner: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  iconSlot: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  ringInnerLogged: {
    backgroundColor: Colors.light.green,
  },
  ringInnerLoggedToday: {
    borderWidth: 1.5,
    borderColor: Colors.light.bordercolortodayselectedring,
  },
  ringInnerFuture: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.32)",
  },
  ringInnerEmpty: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
  },
  ringInnerSelectedEmpty: {
    backgroundColor: Colors.light.greybuttonBackground,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.32)",
  },
  ringInnerDimOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
});
