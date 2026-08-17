import { useId } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Svg, { Defs, FeGaussianBlur, Filter, Path } from "react-native-svg";

const TICK_PATH =
  "M10.5164 4.00668C9.15579 4.10538 7.87518 4.58153 6.78799 5.39379C6.27708 5.77391 5.77018 6.28073 5.39 6.79156C4.69233 7.72519 4.23344 8.82153 4.0667 9.95256C4.00667 10.3567 4 10.4661 4 10.9996C4 11.5224 4.00667 11.6371 4.06136 12.0132C4.34283 13.9605 5.44869 15.7184 7.08814 16.8187C7.44431 17.0588 7.97122 17.3389 8.36208 17.4963C8.9637 17.7377 9.55865 17.8871 10.251 17.9697C10.4951 17.9991 11.2274 18.0098 11.5022 17.9898C14.6651 17.747 17.253 15.4596 17.8719 12.36C17.948 11.9825 18 11.501 18 11.1823V10.9996H17.4958H16.9902L16.9822 11.2556C16.9302 12.9495 16.0791 14.6167 14.7184 15.6944C13.786 16.4319 12.6575 16.8761 11.4729 16.9734C11.2528 16.9921 10.7405 16.9921 10.5204 16.9734C8.7676 16.8294 7.16818 15.9304 6.14102 14.51C5.49805 13.6204 5.11787 12.5947 5.02049 11.4797C4.99781 11.233 5.00181 10.7115 5.02716 10.446C5.16322 9.01893 5.79686 7.69585 6.81467 6.70753C7.81648 5.7339 9.07442 5.15771 10.4898 5.023C10.7059 5.003 11.2901 5.003 11.5036 5.023C12.9216 5.15905 14.1808 5.73656 15.184 6.71154C15.3414 6.86492 15.5989 7.14634 15.5989 7.16635C15.5989 7.17301 14.3383 8.43875 12.7975 9.97923L9.99619 12.7801L8.67823 11.4624C7.95388 10.7381 7.35493 10.146 7.34826 10.146C7.34026 10.146 7.17618 10.3047 6.98142 10.4994L6.62792 10.8528L8.15531 12.38C9.90548 14.1312 9.7494 13.9938 9.99619 13.9938C10.2483 13.9938 9.87346 14.3446 13.5125 10.7035C17.1329 7.08099 16.7794 7.45844 16.7794 7.21169C16.7794 7.09832 16.7741 7.06098 16.7514 7.01163C16.7167 6.93694 16.4859 6.62884 16.3112 6.42478C16.1418 6.22738 15.7683 5.85393 15.5722 5.68588C14.7758 5.00567 13.8474 4.51351 12.8402 4.23742C12.4494 4.12939 11.9785 4.04803 11.5369 4.01068C11.3929 3.99868 10.6658 3.99601 10.5164 4.00668Z";

/** Figma drop-shadow: rgb(255, 170, 0) */
const GLOW_COLOR = "#FFAA00";
const GLOW_BRIGHT = "#FFD56B";
const ARTBOARD = 22;
const GLOW_PAD_VB = 8;

export const GoldenTickIcon = ({ size = 22 }: { size?: number }) => {
  const uid = useId().replace(/:/g, "");
  const softId = `golden_tick_soft_${uid}`;
  const midId = `golden_tick_mid_${uid}`;
  const tightId = `golden_tick_tight_${uid}`;

  const padPx = (size / ARTBOARD) * GLOW_PAD_VB;
  const svgSize = size + padPx * 2;
  const viewBox = `${-GLOW_PAD_VB} ${-GLOW_PAD_VB} ${ARTBOARD + GLOW_PAD_VB * 2} ${ARTBOARD + GLOW_PAD_VB * 2}`;

  return (
    <View
      style={[
        styles.wrap,
        { width: size, height: size },
        Platform.OS === "ios"
          ? {
              shadowColor: GLOW_COLOR,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 1,
              shadowRadius: size * 0.42,
            }
          : null,
      ]}
    >
      <Svg
        width={svgSize}
        height={svgSize}
        viewBox={viewBox}
        fill="none"
        style={{ position: "absolute", top: -padPx, left: -padPx }}
      >
        <Defs>
          <Filter
            id={softId}
            x="-120%"
            y="-120%"
            width="340%"
            height="340%"
            filterUnits="objectBoundingBox"
          >
            <FeGaussianBlur in="SourceGraphic" stdDeviation="3.2" />
          </Filter>
          <Filter
            id={midId}
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
            filterUnits="objectBoundingBox"
          >
            <FeGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </Filter>
          <Filter
            id={tightId}
            x="-80%"
            y="-80%"
            width="260%"
            height="260%"
            filterUnits="objectBoundingBox"
          >
            <FeGaussianBlur in="SourceGraphic" stdDeviation="1.1" />
          </Filter>
        </Defs>
        <Path d={TICK_PATH} fill={GLOW_COLOR} opacity={0.45} filter={`url(#${softId})`} />
        <Path d={TICK_PATH} fill={GLOW_COLOR} opacity={0.7} filter={`url(#${midId})`} />
        <Path d={TICK_PATH} fill={GLOW_BRIGHT} opacity={0.95} filter={`url(#${tightId})`} />
        <Path d={TICK_PATH} fill="#FFFFFF" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    overflow: "visible",
  },
});
