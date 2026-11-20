import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  useWindowDimensions,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { AllDoneCheckIcon } from "@/assets/icons/AllDoneCheckIcon";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
  type SharedValue,
} from "react-native-reanimated";
import { ContainerCard, type ContainerCardData } from "./ContainerCard";

const SCREEN_H_PADDING = 16;
const CARD_HEIGHT = 160;
const SWIPE_THRESHOLD = 100;
const STACK_OFFSET_Y = 8;
const STACK_SCALE = 0.04;
const MAX_ROTATION = 5;
const EMPTY_AUTO_COLLAPSE_MS = 1500;
const COLLAPSE_DURATION_MS = 320;

type SwipeCardDeckProps = {
  data: ContainerCardData[];
  renderTextWithHighlight: (
    text: string,
    highlightedTexts: string[],
  ) => Array<{ text: string; highlighted: boolean }>;
  /** Fires once the top card finishes its dismiss animation. */
  onCardSwiped?: (swipedIndex: number) => void;
  /** Fires when the last card has been fully swiped away. */
  onAllCardsSwiped?: () => void;
  showPagination?: boolean;
};

type DeckSwipeCardProps = {
  item: ContainerCardData;
  cardWidth: number;
  stackIndex: number;
  total: number;
  /** True when this is the only remaining content card. */
  isLastCard: boolean;
  dragX: SharedValue<number>;
  renderTextWithHighlight: SwipeCardDeckProps["renderTextWithHighlight"];
  onSwiped: () => void;
};

const DeckSwipeCard = ({
  item,
  cardWidth,
  stackIndex,
  total,
  isLastCard,
  dragX,
  renderTextWithHighlight,
  onSwiped,
}: DeckSwipeCardProps) => {
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .enabled(stackIndex === 0)
    .activeOffsetX([-12, 12])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      translateX.value = e.translationX;
      dragX.value = e.translationX;
    })
    .onEnd((e) => {
      const wentFarEnough =
        Math.abs(e.translationX) > SWIPE_THRESHOLD ||
        Math.abs(e.velocityX) > 800;
      const direction =
        e.translationX !== 0
          ? Math.sign(e.translationX)
          : Math.sign(e.velocityX);
      // Last card: only dismiss left (WHOOP video). Intermediate: either side.
      const shouldDismiss = wentFarEnough && (!isLastCard || direction < 0);

      if (shouldDismiss) {
        translateX.value = withTiming(
          direction * (cardWidth + 150),
          { duration: 280 },
          (finished) => {
            if (finished) {
              dragX.value = 0;
              runOnJS(onSwiped)();
            }
          },
        );
      } else {
        translateX.value = withSpring(0, { damping: 18, stiffness: 200 });
        dragX.value = withSpring(0, { damping: 18, stiffness: 200 });
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    if (stackIndex === 0) {
      // Rotate from bottom-center pivot so the top of the card swings away
      // while the bottom stays anchored — matches the Figma peeling motion.
      const rotateDeg = interpolate(
        translateX.value,
        [-cardWidth / 2, 0, cardWidth / 2],
        [-MAX_ROTATION, 0, MAX_ROTATION],
        Extrapolation.CLAMP,
      );
      const rotateRad = (rotateDeg * Math.PI) / 180;
      const pivotY = CARD_HEIGHT / 2;
      const pivotOffsetX = -pivotY * Math.sin(rotateRad);
      const pivotOffsetY = pivotY - pivotY * Math.cos(rotateRad);

      return {
        transform: [
          { translateX: translateX.value + pivotOffsetX },
          { translateY: -pivotOffsetY },
          { rotate: `${0}deg` },
        ],
        zIndex: total,
      };
    }

    // Under-cards rise toward the front as the top card is dragged.
    const progress = interpolate(
      Math.abs(dragX.value),
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    );
    const baseOffset = STACK_OFFSET_Y * stackIndex;
    const baseScale = 1 - STACK_SCALE * stackIndex;
    const nextOffset = STACK_OFFSET_Y * (stackIndex - 1);
    const nextScale = 1 - STACK_SCALE * (stackIndex - 1);

    return {
      transform: [
        {
          translateY: interpolate(progress, [0, 1], [baseOffset, nextOffset]),
        },
        {
          scale: interpolate(progress, [0, 1], [baseScale, nextScale]),
        },
      ],
      zIndex: total - stackIndex,
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[styles.cardWrapper, { width: cardWidth }, cardAnimatedStyle]}
      >
        <ContainerCard
          item={item}
          cardWidth={cardWidth}
          renderTextWithHighlight={renderTextWithHighlight}
        />
        {stackIndex === 0 && (
          <View style={styles.remainingBadge}>
            <Text style={styles.remainingBadgeTick}>✓</Text>
            <Text style={styles.remainingBadgeText}>{total}</Text>
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
};

export const SwipeCardDeck = ({
  data,
  renderTextWithHighlight,
  onCardSwiped,
  onAllCardsSwiped,
  showPagination = true,
}: SwipeCardDeckProps) => {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = windowWidth - SCREEN_H_PADDING * 2;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const collapsingRef = useRef(false);
  const autoCollapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const dragX = useSharedValue(0);
  const deckHeight = useSharedValue(
    CARD_HEIGHT + STACK_OFFSET_Y * Math.min(Math.max(data.length - 1, 0), 2),
  );
  const deckOpacity = useSharedValue(1);

  const remainingCards = data.slice(activeIndex);
  const contentRemaining = remainingCards.length;
  const targetContentHeight =
    contentRemaining === 0
      ? CARD_HEIGHT
      : CARD_HEIGHT +
        STACK_OFFSET_Y * Math.min(Math.max(contentRemaining - 1, 0), 2);

  useEffect(() => {
    if (!showEmptyState && !collapsingRef.current) {
      deckHeight.value = withTiming(targetContentHeight, { duration: 180 });
    }
  }, [targetContentHeight, showEmptyState, deckHeight]);

  const finishUnmount = useCallback(() => {
    setIsDismissed(true);
  }, []);

  const collapseDeck = useCallback(() => {
    if (collapsingRef.current) return;
    collapsingRef.current = true;
    if (autoCollapseTimerRef.current) {
      clearTimeout(autoCollapseTimerRef.current);
      autoCollapseTimerRef.current = null;
    }
    deckOpacity.value = withTiming(0, { duration: COLLAPSE_DURATION_MS });
    deckHeight.value = withTiming(
      0,
      { duration: COLLAPSE_DURATION_MS },
      (finished) => {
        if (finished) runOnJS(finishUnmount)();
      },
    );
  }, [deckHeight, deckOpacity, finishUnmount]);

  // Auto-collapse ~1.5s after "You're all set" (FAB can dismiss early).
  useEffect(() => {
    if (!showEmptyState || collapsingRef.current) return;
    autoCollapseTimerRef.current = setTimeout(() => {
      collapseDeck();
    }, EMPTY_AUTO_COLLAPSE_MS);
    return () => {
      if (autoCollapseTimerRef.current) {
        clearTimeout(autoCollapseTimerRef.current);
        autoCollapseTimerRef.current = null;
      }
    };
  }, [showEmptyState, collapseDeck]);

  const handleCardSwiped = useCallback(() => {
    const swipedIndex = activeIndex;
    const next = Math.min(activeIndex + 1, data.length);
    setActiveIndex(next);
    onCardSwiped?.(swipedIndex);
    if (next >= data.length) {
      setShowEmptyState(true);
      onAllCardsSwiped?.();
    }
  }, [activeIndex, data.length, onAllCardsSwiped, onCardSwiped]);

  const deckAnimatedStyle = useAnimatedStyle(() => ({
    height: deckHeight.value,
    opacity: deckOpacity.value,
    overflow: "hidden" as const,
  }));

  if (isDismissed) {
    return null;
  }

  return (
    <Animated.View style={deckAnimatedStyle}>
      <View
        style={[styles.deckContainer, { width: cardWidth, height: "100%" }]}
      >
        {showEmptyState || contentRemaining === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateCenter}>
              <AllDoneCheckIcon size={48} color={Colors.light.white} />
              <Text style={styles.emptyStateText}>You're all set!</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.emptyStateDoneBtn}
              onPress={collapseDeck}
            >
              <AntDesign name="check" size={22} color={Colors.light.white} />
            </TouchableOpacity>
          </View>
        ) : (
          remainingCards
            .slice()
            .reverse()
            .map((item, reversedIndex) => {
              const stackIndex = remainingCards.length - 1 - reversedIndex;
              return (
                <DeckSwipeCard
                  key={`${activeIndex}-${item.id}`}
                  item={item}
                  cardWidth={cardWidth}
                  stackIndex={stackIndex}
                  total={remainingCards.length - stackIndex}
                  isLastCard={remainingCards.length === 1}
                  dragX={dragX}
                  renderTextWithHighlight={renderTextWithHighlight}
                  onSwiped={stackIndex === 0 ? handleCardSwiped : () => {}}
                />
              );
            })
        )}
      </View>

      {showPagination && contentRemaining > 0 && !showEmptyState && (
        <View style={styles.dotRow}>
          {data.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  deckContainer: {
    position: "relative",
  },
  cardWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    height: CARD_HEIGHT,
  },
  remainingBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: Colors.light.calendarBg,
    justifyContent: "center",
    alignItems: "center",
    gap: 1,
  },
  remainingBadgeTick: {
    color: Colors.light.white,
    fontSize: 12,
    fontFamily: fonts.primary.semiBold,
    lineHeight: 14,
  },
  remainingBadgeText: {
    color: Colors.light.white,
    fontSize: 13,
    fontFamily: fonts.primary.semiBold,
    lineHeight: 16,
  },
  dotRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: Colors.light.green,
  },
  dotInactive: {
    backgroundColor: Colors.light.calendarBg,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.blackBackground,
    borderRadius: 12,
    padding: 16,
    position: "relative",
    minHeight: CARD_HEIGHT,
  },
  emptyStateCenter: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 46,
  },
  emptyStateText: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.semiBold,
    marginTop: 6,
  },
  emptyStateDoneBtn: {
    position: "absolute",
    top: 10,
    right: 6,
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.light.green,
    justifyContent: "center",
    alignItems: "center",
  },
});
