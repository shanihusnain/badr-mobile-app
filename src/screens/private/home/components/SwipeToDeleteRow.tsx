import { Colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useEffect } from "react";
import {
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  Pressable,
} from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Feather from "@expo/vector-icons/Feather";

const DELETE_ACTION_WIDTH = 80;
const DELETE_GAP = 8;
const SNAP_OPEN = -(DELETE_ACTION_WIDTH + DELETE_GAP);
const SPRING_CONFIG = { damping: 20, stiffness: 200 };

type SwipeToDeleteRowProps = {
  rowId: string;
  onDelete: (id: string) => void;
  onSwipeOpen: (id: string | null) => void;
  openRowId: string | null;
  children: React.ReactNode;
  wrapperStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export function SwipeToDeleteRow({
  rowId,
  onDelete,
  onSwipeOpen,
  openRowId,
  children,
  wrapperStyle,
  contentStyle,
}: SwipeToDeleteRowProps) {
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const itemWidth = useSharedValue(0);
  const itemHeight = useSharedValue(0);
  const itemOpacity = useSharedValue(1);
  const isDeleting = useSharedValue(false);

  const notifySwipeOpen = useCallback(
    (id: string | null) => {
      onSwipeOpen(id);
    },
    [onSwipeOpen],
  );

  const removeItem = useCallback(() => {
    onDelete(rowId);
  }, [onDelete, rowId]);

  const handleLayout = (event: LayoutChangeEvent) => {
    itemWidth.value = event.nativeEvent.layout.width;
    itemHeight.value = event.nativeEvent.layout.height;
  };

  const animateDelete = () => {
    "worklet";
    isDeleting.value = true;
    translateX.value = withTiming(-itemWidth.value, { duration: 220 });
    itemOpacity.value = withTiming(0, { duration: 220 });
    itemHeight.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(removeItem)();
      }
    });
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-12, 12])
    .onBegin(() => {
      if (isDeleting.value) {
        return;
      }
      startX.value = translateX.value;
      runOnJS(notifySwipeOpen)(rowId);
    })
    .onChange((event) => {
      if (isDeleting.value) {
        return;
      }
      const next = startX.value + event.translationX;
      translateX.value = Math.min(0, Math.max(next, -itemWidth.value));
    })
    .onFinalize(() => {
      if (isDeleting.value) {
        return;
      }

      const currentX = translateX.value;
      const deleteTrigger = -itemWidth.value * 0.45;

      if (currentX > SNAP_OPEN / 2) {
        translateX.value = withSpring(0, SPRING_CONFIG);
        runOnJS(notifySwipeOpen)(null);
        return;
      }

      if (currentX > deleteTrigger) {
        translateX.value = withSpring(SNAP_OPEN, SPRING_CONFIG);
        return;
      }

      animateDelete();
    });

  const containerStyle = useAnimatedStyle(() => ({
    height: isDeleting.value ? itemHeight.value : undefined,
    opacity: itemOpacity.value,
    overflow: "hidden",
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deleteActionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SNAP_OPEN],
      [0, 1],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        scale: interpolate(
          translateX.value,
          [0, SNAP_OPEN],
          [0.85, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const handleTrashPress = () => {
    if (openRowId !== rowId) {
      return;
    }
    runOnUI(animateDelete)();
  };

  useEffect(() => {
    if (openRowId !== null && openRowId !== rowId) {
      translateX.value = withSpring(0, SPRING_CONFIG);
    }
  }, [openRowId, rowId, translateX]);

  return (
    <Animated.View style={[containerStyle, styles.itemContainer, wrapperStyle]}>
      <Animated.View style={[styles.deleteAction, deleteActionStyle]}>
        <Pressable style={styles.deletePressable} onPress={handleTrashPress}>
          <Feather name="trash" size={24} color={Colors.light.white} />
        </Pressable>
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[cardStyle, styles.card, contentStyle]}
          onLayout={handleLayout}
        >
          {children}
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 8,
  },
  card: {
    paddingVertical: 24,
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 8,
  },
  deleteAction: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: DELETE_ACTION_WIDTH,
    backgroundColor: Colors.light.red,
    justifyContent: "center",
    alignItems: "center",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  deletePressable: {
    width: DELETE_ACTION_WIDTH,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
