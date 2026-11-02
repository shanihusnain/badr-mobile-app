import React from "react";
import { StyleSheet, View } from "react-native";
import { Colors } from "@/constants/theme";
import { HouseWithHeartIcon } from "@/assets/icons/HouseWithHeartIcon";
import { BulbIcon } from "@/assets/icons/BulbIcon";
import {
  SadaqahJariyahCloathIcon,
  SadaqahJariyahMedicalAidIcon,
  SadaqahJariyahMosqueIcon,
  SadaqahJariyahReligiousIcon,
  SadaqahJariyahSponsoringOrphanIcon,
  SadaqahJariyahSpirtualIcon,
  SadaqahJariyahTreePlantIcon,
  SadaqahJariyahWaterWellIcon,
} from "@/assets/icons";
import type { SadaqahJariyahCategoryId } from "@/src/screens/private/goalprogressloggingscreen/sadaqahJariyahCategories";

export type SadaqahJariyahRingCategory = SadaqahJariyahCategoryId | null;

type Props = {
  size: number;
  category: SadaqahJariyahRingCategory;
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
  category: SadaqahJariyahCategoryId;
  size: number;
  color: string;
}) {
  switch (category) {
    case "honoring-parents":
      return <SadaqahJariyahSpirtualIcon size={size} color={color} />;
    case "sponsoring-orphans":
      return <SadaqahJariyahSponsoringOrphanIcon size={size} color={color} />;
    case "building-wells":
      return <SadaqahJariyahWaterWellIcon size={size} color={color} />;
    case "sustaining-mosques":
      return <SadaqahJariyahMosqueIcon size={size} color={color} />;
    case "teaching-quran":
      return <SadaqahJariyahReligiousIcon size={size} color={color} />;
    case "sheltering-lives":
      return <HouseWithHeartIcon size={size} color={color} />;
    case "providing-healthcare":
      return <SadaqahJariyahMedicalAidIcon size={size} color={color} />;
    case "spreading-knowledge":
      return <BulbIcon size={size} color={color} />;
    case "providing-clothing":
      return <SadaqahJariyahCloathIcon size={size} color={color} />;
    case "planting-trees":
      return <SadaqahJariyahTreePlantIcon size={size} color={color} />;
    default:
      return <SadaqahJariyahSpirtualIcon size={size} color={color} />;
  }
}

/**
 * Sadaqah Jariyah 7-day rings:
 * - logged: green circle + white category icon
 * - best day: green circle + gold (#E4D27E) category icon
 * - border only when today grey chip is present
 */
export function SadaqahJariyahDayRing({
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
