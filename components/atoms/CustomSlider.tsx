import Slider from "@react-native-community/slider";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/theme";
import { useLocaleNumber } from "../../hooks/useLocaleNumber";

type CustomSliderProps = {
  maxDays?: number;
  initialDays?: number;
  scale?: number; // Uniform scale factor for track thickness & pointer size
  onChange?: (days: number) => void;
};

export default function CustomSlider({
  maxDays = 28,
  initialDays = 14,
  scale = 1.2, // Default premium 1.2x scale (smaller, highly elegant)
  onChange,
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
    setDays(initialDays);
    setContinuousVal(initialDays);
  }, [initialDays]);

  const onLayout = (event: any) => {
    const layoutWidth = event.nativeEvent.layout.width;
    if (layoutWidth > 0 && isMounted.current) {
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

  // The native slider track padding scales with the slider itself.
  const paddingX = 16 * scale;
  const trackOverlayWidth = width - paddingX * 2;

  // Use the continuous float value to calculate percentage for 60fps smooth tracking
  const percent = (continuousVal - 1) / (maxDays - 1);

  // Progress width and badge offset track the thumb's dynamic position perfectly and smoothly
  const progressWidth = percent * trackOverlayWidth;

  // Center the badge exactly over the custom pointer thumb center
  const badgeLeft = paddingX + progressWidth - 16;

  // Left offset of the custom unified pointer thumb
  const thumbLeft = paddingX + progressWidth - thumbSize / 2;

  const handleChange = (val: number) => {
    if (isMounted.current) {
      setContinuousVal(val);
      const roundedDays = Math.round(val);
      if (roundedDays !== days) {
        setDays(roundedDays);
        onChange?.(roundedDays);
      }
    }
  };

  // To prevent the scaled slider from overflowing the container, we set its style width
  // to (100 / scale)% and then scale it up by `scale` factor.
  const sliderWidthPercent = `${100 / scale}%` as any;

  return (
    <View style={styles.container} onLayout={onLayout}>
      <View style={styles.sliderWrapper}>
        {/* Floating badge with connection speech-bubble arrow pointing to thumb */}
        <View style={[styles.badgeContainer, { left: badgeLeft }]}>
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
                width: progressWidth,
                height: trackHeight,
                borderRadius: trackHeight / 2,
              },
            ]}
          />
        </View>

        {/* Scaled Native Slider (Thumb is set to transparent, acts as gesture interceptor) */}
        <Slider
          style={[
            styles.slider,
            {
              width: sliderWidthPercent,
              transform: [{ scale }],
            },
          ]}
          minimumValue={1}
          maximumValue={maxDays}
          value={continuousVal} // Bind to continuous value for fluid continuous thumb dragging
          onValueChange={handleChange}
          minimumTrackTintColor="#00000000" // Transparent to show our custom track
          maximumTrackTintColor="#00000000" // Transparent to show our track
          thumbTintColor="#00000000" // 👈 Transparent thumb so we can overlay our own custom fixed thumb!
        />

        {/* Custom Unified Pointer Thumb Overlay (Static Centering Guaranteed!) */}
        <View
          style={[
            styles.customThumb,
            {
              left: thumbLeft,
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              top: (50 - thumbSize) / 2,
            },
          ]}
          pointerEvents="none"
        >
          {/* Hollow Green Circle inside Center - Flexbox guarantees it is perfectly locked & static */}
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
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "115%",
    marginVertical: 12,
    alignSelf: "center",
  },

  sliderWrapper: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
  },

  badgeContainer: {
    position: "absolute",
    top: -11, // Sits beautifully above the track and points to thumb
    width: 32,
    alignItems: "center",
    zIndex: 10,
  },

  badge: {
    width: 25,
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
    height: 50,
    zIndex: 5,
  },

  customThumb: {
    position: "absolute",
    backgroundColor: Colors.light.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 100 },
    shadowOpacity: 0.91,
    shadowRadius: 50,
    elevation: 30,
    zIndex: 10,
  },
});
