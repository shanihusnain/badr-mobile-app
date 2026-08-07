import React, { useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Colors } from "../../constants/theme";
import { useLocaleNumber } from "../../hooks/useLocaleNumber";

import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { runOnJS, useSharedValue } from "react-native-reanimated";
import { EvilIcons } from "@expo/vector-icons";

type CustomSliderProps = {
  maxDays?: number;
  initialDays?: number;
  scale?: number; // Uniform scale factor for track thickness & pointer size
  onChange?: (days: number) => void;
  locked?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  /** Tighter vertical footprint for stacked prayer sliders (Figma). */
  compact?: boolean;
};

export default function CustomSlider({
  maxDays = 28,
  initialDays = 14,
  scale = 1.2, // Default premium 1.2x scale (smaller, highly elegant)
  onChange,
  locked = false,
  containerStyle,
  compact = false,
}: CustomSliderProps) {
  const formatNumber = useLocaleNumber();
  const [days, setDays] = useState(initialDays);
  // Track continuous float values for smooth tracking during drags
  const [continuousVal, setContinuousVal] = useState(initialDays);

  // Dynamically track container width for perfect responsive alignment
  const [width, setWidth] = useState(Dimensions.get("window").width - 40);

  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (initialDays !== days) {
      setDays(initialDays);
      setContinuousVal(initialDays);
    }
  }, [initialDays]);

  const onLayout = (event: any) => {
    const layoutWidth = event.nativeEvent.layout.width;
    if (layoutWidth > 0) {
      setWidth(layoutWidth);
    }
  };

  // Base dimensions (will be scaled uniformly)
  const baseTrackHeight = 8;
  const baseRingSize = 7;
  const baseThumbSize = 16; // 👈 Reduced base size for a smaller, compact white pointer

  // Scaled dimensions
  const trackHeight = baseTrackHeight * scale;
  const ringSize = baseRingSize * scale;
  const thumbSize = baseThumbSize * scale;
  // Compact hugs the thumb/track so stacked rows match Figma (no tall empty hit-area).
  const sliderHeight = compact ? 28 : 50;
  const badgeTop = compact ? -16 : -11;

  // Horizontal inset — room for thumb/badge at min/max.
  // Paired with container width 112% so the visible track aligns with card content edges.
  const paddingX = 20;
  const trackOverlayWidth = width - paddingX * 2;
  const badgeWidth = 32;
  const badgeHalf = badgeWidth / 2;
  const badgeEdgeInset = 4;

  // Use the continuous float value to calculate percentage for 60fps smooth tracking.
  // Clamp so values below the track min (e.g. 0 when disabled) stay at the left edge.
  const percent = Math.max(
    0,
    Math.min(1, (continuousVal - 1) / (maxDays - 1)),
  );

  // Progress width and badge offset track the thumb's dynamic position perfectly and smoothly
  const progressWidth = percent * trackOverlayWidth;

  const rawBadgeLeft = paddingX + progressWidth - badgeHalf;
  const badgeLeft = Math.max(
    badgeEdgeInset,
    Math.min(rawBadgeLeft, width - badgeWidth - badgeEdgeInset),
  );

  const thumbLeft = paddingX + progressWidth - thumbSize / 2;

  const startX = useSharedValue(0);

  const handleChange = (val: number) => {
    if (locked || !isMounted.current) return;

    setContinuousVal(val);
    const roundedDays = Math.round(val);
    if (roundedDays !== days) {
      setDays(roundedDays);
      onChange?.(roundedDays);
    }
  };

  const panGesture = Gesture.Pan()
    .enabled(!locked)
    .runOnJS(true)
    .activeOffsetX([-5, 5])
    .onStart((event) => {
      const currentPercent = (continuousVal - 1) / (maxDays - 1);
      startX.value = currentPercent * trackOverlayWidth;
    })
    .onUpdate((event) => {
      const newX = startX.value + event.translationX;
      const clampedX = Math.max(0, Math.min(newX, trackOverlayWidth));
      const currentPercent = clampedX / trackOverlayWidth;
      const newVal = 1 + currentPercent * (maxDays - 1);
      handleChange(newVal);
    });

  const tapGesture = Gesture.Tap()
    .enabled(!locked)
    .runOnJS(true)
    .onEnd((event) => {
      const tapX = event.x - paddingX;
      const clampedX = Math.max(0, Math.min(tapX, trackOverlayWidth));
      const currentPercent = clampedX / trackOverlayWidth;
      const newVal = 1 + currentPercent * (maxDays - 1);
      handleChange(newVal);
    });

  const composedGesture = Gesture.Exclusive(panGesture, tapGesture);

  // Native slider uses 100% width. Scaling the visual elements only, to preserve hit bounds.

  return (
    <View
      style={[
        styles.container,
        compact && styles.containerCompact,
        containerStyle,
      ]}
      onLayout={onLayout}
    >
      <View style={[styles.sliderWrapper, { height: sliderHeight }]}>
        {/* Floating badge with connection speech-bubble arrow pointing to thumb */}
        <View style={[styles.badgeContainer, { left: badgeLeft, top: badgeTop }]}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{formatNumber(days)}</Text>
          </View>
          <View style={styles.badgeArrow} />
        </View>

        {/* Custom Rounded Track Overlay (Behind the native slider) */}
        <View
          style={[
            styles.trackOverlay,
            {
              left: paddingX,
              right: paddingX,
              height: trackHeight,
            },
          ]}
          pointerEvents="none"
        >
          <View
            style={[
              styles.customBackgroundTrack,
              { height: trackHeight, borderRadius: trackHeight / 2 },
            ]}
          />
          <View
            style={[
              styles.customProgressTrack,
              {
                opacity: locked ? 0.4 : 1,
              },
              {
                width: progressWidth,
                height: trackHeight,
                borderRadius: trackHeight / 2,
              },
            ]}
          />
        </View>

        {/* Transparent Interactive Drag Area wrapped in GestureDetector */}
        {locked ? (
          <View
            style={[styles.slider, { width: "100%", height: sliderHeight }]}
            pointerEvents="none"
          />
        ) : (
          <GestureDetector gesture={composedGesture}>
            <Animated.View
              style={[
                styles.slider,
                {
                  width: "100%",
                  height: sliderHeight,
                },
              ]}
            />
          </GestureDetector>
        )}

        {/* Custom Unified Pointer Thumb Overlay (Static Centering Guaranteed!) */}
        <View
          style={[
            styles.customThumb,

            {
              left: thumbLeft,
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              top: (sliderHeight - thumbSize) / 2,
            },
          ]}
          pointerEvents="none"
        >
          {/* Hollow Green Circle inside Center - Flexbox guarantees it is perfectly locked & static */}
          {locked ? (
            <EvilIcons name="lock" size={15} color={Colors.light.green} />
          ) : (
            <View
              style={{
                width: ringSize,
                height: ringSize,
                borderRadius: ringSize / 2,
                borderWidth: 1.1 * scale, // Super-thin, extremely elegant ring border thickness
                borderColor: Colors.light.green,
                backgroundColor: Colors.light.white,
                // Bolder, highly visible shadow under the inner green ring for dramatic depth
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.45,
                shadowRadius: 2.5,
                elevation: 4,
              }}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "112%",
    marginVertical: 12,
    alignSelf: "center",
  },

  containerCompact: {
    // Same bleed as default: paddingX (20) each side is offset by 12% extra width
    // so the green track lines up with labels / SAVE.
    width: "112%",
    alignSelf: "center",
    marginVertical: 0,
    // Reserve space for the floating value badge above the track (Figma).
    paddingTop: 18,
  },

  sliderWrapper: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },

  badgeContainer: {
    position: "absolute",
    width: 32,
    alignItems: "center",
    zIndex: 10,
  },

  badge: {
    width: 21,
    height: 20,
    borderRadius: 4,
    backgroundColor: Colors.light.darkgrey,
    justifyContent: "center",
    alignItems: "center",
  },

  badgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "600",
  },

  badgeArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderStyle: "solid",
    backgroundColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: Colors.light.darkgrey,
    marginTop: -1, // Slightly overlap the badge
  },

  trackOverlay: {
    position: "absolute",
    justifyContent: "center",
  },

  customBackgroundTrack: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#444",
  },

  customProgressTrack: {
    position: "absolute",
    left: 0,
    backgroundColor: Colors.light.green,
  },

  slider: {
    zIndex: 5,
  },

  customThumb: {
    position: "absolute",
    backgroundColor: Colors.light.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 10,
  },
});
