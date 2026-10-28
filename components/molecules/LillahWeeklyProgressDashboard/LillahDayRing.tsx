import React from "react";
import { StyleSheet, View } from "react-native";
import { Colors } from "@/constants/theme";
import { GoatIcon } from "@/assets/icons/GoatIcon";
import { HouseWithHeartIcon } from "@/assets/icons/HouseWithHeartIcon";
import { DebtAssistanceIcon } from "@/assets/icons/DebtAssistanceIcon";
import { FlowCardQardHassanIcon } from "@/assets/icons/FlowCardQardHassanIcon";
import { KaffarahMealIcon } from "@/assets/icons/KaffarahMealIcon";
import type { LillahCategoryId } from "@/src/screens/private/goalprogressloggingscreen/lillahCategories";

export type LillahRingCategory = LillahCategoryId | null;

type Props = {
  size: number;
  category: LillahRingCategory;
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
  category: LillahCategoryId;
  size: number;
  color: string;
}) {
  switch (category) {
    case "qurbani":
      return <GoatIcon size={size} color={color} />;
    case "household-essentials":
      return <HouseWithHeartIcon size={size} color={color} />;
    case "debt-assistance":
      return <DebtAssistanceIcon size={size} color={color} />;
    case "qard-hassan":
      return <FlowCardQardHassanIcon size={size} color={color} />;
    case "food-relief":
    default:
      return <KaffarahMealIcon size={size} color={color} />;
  }
}

/**
 * Lillah 7-day rings:
 * - logged: green circle + white category icon
 * - best day: green circle + gold (#E4D27E) category icon
 * - border only when today grey chip is present
 */
export function LillahDayRing({
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
  const iconSize = circleSize * 0.72;
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
          <CategoryIcon
            category={category}
            size={iconSize}
            color={iconColor}
          />
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
    overflow: "visible",
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
