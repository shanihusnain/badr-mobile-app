import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { useCallback, useState } from "react";
import { StyleSheet, useWindowDimensions, View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
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
} from "react-native-reanimated";
import { ContainerCard, type ContainerCardData } from "./ContainerCard";

const SCREEN_H_PADDING = 16;
const CARD_HEIGHT = 160;
const SWIPE_THRESHOLD = 100;
const STACK_OFFSET_Y = 8;
const STACK_SCALE = 0.04;
const MAX_ROTATION = 5;

type SwipeCardDeckProps = {
  data: ContainerCardData[];
  renderTextWithHighlight: (
    text: string,
    highlightedTexts: string[],
  ) => Array<{ text: string; highlighted: boolean }>;
};

type DeckSwipeCardProps = {
  item: ContainerCardData;
  cardWidth: number;
  stackIndex: number;
  total: number;
  renderTextWithHighlight: SwipeCardDeckProps["renderTextWithHighlight"];
  onSwiped: () => void;
};

const DeckSwipeCard = ({
  item,
  cardWidth,
  stackIndex,
  total,
  renderTextWithHighlight,
  onSwiped,
}: DeckSwipeCardProps) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .enabled(stackIndex === 0)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      const shouldDismiss =
        Math.abs(e.translationX) > SWIPE_THRESHOLD ||
        Math.abs(e.velocityX) > 800;

      if (shouldDismiss) {
        const direction = e.translationX > 0 ? 1 : -1;
        translateX.value = withTiming(
          direction * (cardWidth + 150),
          { duration: 280 },
          (finished) => {
            if (finished) runOnJS(onSwiped)();
          },
        );
        translateY.value = withTiming(e.translationY - 120, { duration: 280 });
      } else {
        translateX.value = withSpring(0, { damping: 18, stiffness: 200 });
        translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
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
          { translateY: translateY.value - pivotOffsetY },
          { rotate: `${rotateDeg}deg` },
        ],
        zIndex: total,
      };
    }

    return {
      transform: [
        { translateY: STACK_OFFSET_Y * stackIndex },
        { scale: 1 - STACK_SCALE * stackIndex },
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
}: SwipeCardDeckProps) => {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = windowWidth - SCREEN_H_PADDING * 2;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  const remainingCards = data.slice(activeIndex);
  const deckHeight =
    CARD_HEIGHT + STACK_OFFSET_Y * Math.min(remainingCards.length - 1, 2);

  const handleCardSwiped = useCallback(() => {
    setActiveIndex((prev) => Math.min(prev + 1, data.length));
  }, [data.length]);

  return (
    <View>
      <View style={[styles.deckContainer, { height: deckHeight, width: cardWidth }]}>
        {remainingCards.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateCenter}>
              <AllDoneCheckIcon size={48} color={Colors.light.white} />
              <Text style={styles.emptyStateText}>You're all set!</Text>
            </View>
            <TouchableOpacity 
              activeOpacity={0.8} 
              style={styles.emptyStateDoneBtn}
              onPress={() => setIsDismissed(true)}
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
                  renderTextWithHighlight={renderTextWithHighlight}
                  onSwiped={stackIndex === 0 ? handleCardSwiped : () => { }}
                />
              );
            })
        )}
      </View>

      {remainingCards.length > 0 && (
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
    </View>
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
    top: 12,
    right: 12,
    width: 28,
    paddingVertical: 6,
    borderRadius: 8,
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
  },
  emptyStateCenter: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 46, // Moved down slightly per request
  },
  emptyStateText: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.semiBold,
    marginTop: 6,
  },
  emptyStateDoneBtn: {
    position: "absolute",
    top: 10, // Moved down (was -24)
    right: 6, // Moved left (was -16)
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.light.green,
    justifyContent: "center",
    alignItems: "center",
  },
});
