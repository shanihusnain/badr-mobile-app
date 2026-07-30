import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { TaperedCircleBorder } from "@/components/atoms/TaperedCircleBorder";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";
import { styles } from "../styles";
import { ShootIcon } from "@/assets/icons/ShootIcon";
import { JournalBookIconGoldenFabButtonIcon } from "@/assets/icons/JournalBookIconGoldenFabButtonIcon";
import { HomeScreenGlowyMinusIcon, PlusGlowyIcon } from "@/assets/icons";

const FAB_SPRING_CONFIG = {
  friction: 6,
  tension: 40,
  useNativeDriver: true as const,
};

type Props = {
  bottomInset: number;
  onAddDailyProgress: () => void;
  onSetNextMonthsGoals?: () => void;
  onCompleteJournal?: () => void;
};

function HomeFabSpeedDialComponent({
  bottomInset,
  onAddDailyProgress,
  onSetNextMonthsGoals,
  onCompleteJournal,
}: Props) {
  const { t } = useTypedTranslation();
  const fabAnimation = useRef(new Animated.Value(0)).current;
  const [isMenuMounted, setIsMenuMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fabTranslateY = useMemo(
    () =>
      fabAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [30, 0],
      }),
    [fabAnimation],
  );

  const menuBottomStyle = useMemo(
    () => ({ bottom: bottomInset + 80 }),
    [bottomInset],
  );

  const fabBottomStyle = useMemo(
    () => ({ bottom: bottomInset + 20 }),
    [bottomInset],
  );

  const closeMenu = useCallback(() => {
    setIsExpanded(false);
    Animated.spring(fabAnimation, {
      ...FAB_SPRING_CONFIG,
      toValue: 0,
    }).start(({ finished }) => {
      if (finished) {
        setIsMenuMounted(false);
      }
    });
  }, [fabAnimation]);

  const openMenu = useCallback(() => {
    setIsMenuMounted(true);
    setIsExpanded(true);
    fabAnimation.setValue(0);
    requestAnimationFrame(() => {
      Animated.spring(fabAnimation, {
        ...FAB_SPRING_CONFIG,
        toValue: 1,
      }).start();
    });
  }, [fabAnimation]);

  const toggleFabMenu = useCallback(() => {
    if (isExpanded) {
      closeMenu();
      return;
    }
    openMenu();
  }, [closeMenu, isExpanded, openMenu]);

  const handleSetNextMonthsGoals = useCallback(() => {
    closeMenu();
    onSetNextMonthsGoals?.();
  }, [closeMenu, onSetNextMonthsGoals]);

  const handleCompleteJournal = useCallback(() => {
    closeMenu();
    onCompleteJournal?.();
  }, [closeMenu, onCompleteJournal]);

  const handleAddDailyProgress = useCallback(() => {
    closeMenu();
    onAddDailyProgress();
  }, [closeMenu, onAddDailyProgress]);

  return (
    <>
      {isMenuMounted ? (
        <Animated.View style={[styles.backdrop, { opacity: fabAnimation }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={closeMenu}
          />
        </Animated.View>
      ) : null}

      {isMenuMounted ? (
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.fabMenuContainer,
            menuBottomStyle,
            {
              opacity: fabAnimation,
              transform: [{ translateY: fabTranslateY }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.fabOptionRow}
            activeOpacity={0.8}
            onPress={handleSetNextMonthsGoals}
          >
            <Text style={styles.fabOptionLabel}>
              {t("homeScreen.setNextMonthsGoals")}
            </Text>
            <View style={styles.fabOptionIconContainer}>
              <ShootIcon size={28} Color="white" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fabOptionRow}
            activeOpacity={0.8}
            onPress={handleCompleteJournal}
          >
            <Text style={styles.fabOptionLabel}>
              {t("homeScreen.completeYourJournal")}
            </Text>
            <View style={styles.fabOptionIconContainer}>
              <JournalBookIconGoldenFabButtonIcon size={24} color="white" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fabOptionRow}
            activeOpacity={0.8}
            onPress={handleAddDailyProgress}
          >
            <Text style={styles.fabOptionLabel}>
              {t("homeScreen.addDailyProgress")}
            </Text>
            <View style={styles.fabOptionIconContainer}>
              <Ionicons name="add" size={24} color="white" />
            </View>
          </TouchableOpacity>
        </Animated.View>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggleFabMenu}
        style={[styles.goldenFab, fabBottomStyle]}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
      >
        {/* <TaperedCircleBorder variant="golden" size={30}>
          <View style={styles.goldenFabInner}>
            <Text style={styles.goldenFabPlus}>{isExpanded ? "−" : "+"}</Text>
          </View>
        </TaperedCircleBorder> */}

        {!isExpanded ? <PlusGlowyIcon /> : <HomeScreenGlowyMinusIcon />}
      </TouchableOpacity>
    </>
  );
}

export const HomeFabSpeedDial = memo(HomeFabSpeedDialComponent);
