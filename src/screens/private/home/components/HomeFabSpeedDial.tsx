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
import { useTypedTranslation } from "@/i18next/useTypedTranslation";
import { styles } from "../styles";
import { FabButtonShootIcon } from "@/assets/icons/FabButtonShootIcon";
import { JournalBookIconGoldenFabButtonIcon } from "@/assets/icons/JournalBookIconGoldenFabButtonIcon";
import { HomeScreenGlowyMinusIcon, PlusGlowyIcon } from "@/assets/icons";

const FAB_SPRING_CONFIG = {
  friction: 6,
  tension: 40,
  useNativeDriver: true as const,
};

const FAB_SIZE = 95;
const FAB_RIGHT =9;
const FAB_BOTTOM_OFFSET = 9;
const OPTION_SIZE = 44;
const MENU_GAP_ABOVE_FAB = -3;
const MENU_ROW_GAP = 17;

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
    () => ({
      bottom: bottomInset + FAB_BOTTOM_OFFSET + FAB_SIZE + MENU_GAP_ABOVE_FAB,
      right: FAB_RIGHT + (FAB_SIZE - OPTION_SIZE) / 2,
    }),
    [bottomInset],
  );

  const fabBottomStyle = useMemo(
    () => ({
      bottom: bottomInset + FAB_BOTTOM_OFFSET,
      right: FAB_RIGHT,
    }),
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
              gap: MENU_ROW_GAP,
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
              <FabButtonShootIcon size={22} color="white" />
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
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: [{ translateX: 3 }],
                }}
              >
                <JournalBookIconGoldenFabButtonIcon size={23} color="white" />
              </View>
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
              <MaterialCommunityIcons name="plus" size={26} color="white" />
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
        {!isExpanded ? <PlusGlowyIcon /> : <HomeScreenGlowyMinusIcon />}
      </TouchableOpacity>
    </>
  );
}

export const HomeFabSpeedDial = memo(HomeFabSpeedDialComponent);
