import * as React from "react";
import Svg, { Path, Circle } from "react-native-svg";

type AddLoggingFlowIconProps = {
  size?: number;
};

export const AddLoggingFlowIcon = ({ size = 28 }: AddLoggingFlowIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <Path
      fill="#fff"
      d="M13.76 7.035a.654.654 0 0 0-.257.171c-.235.235-.217-.01-.217 3.23v2.845h-2.844c-3.239 0-2.994-.015-3.229.217a.689.689 0 0 0 .003 1c.232.23.005.214 3.24.214h2.83v2.845c0 3.24-.016 2.995.217 3.23a.69.69 0 0 0 .996 0c.232-.235.217.01.217-3.23v-2.845h2.843c3.237 0 2.994.016 3.227-.214a.69.69 0 0 0 .163-.762.737.737 0 0 0-.403-.404c-.13-.048-.207-.05-2.982-.05h-2.848v-2.85c0-2.781 0-2.853-.051-2.983-.13-.353-.521-.529-.904-.414Z"
    />
    <Circle cx={14} cy={14} r={13.25} stroke="#fff" strokeWidth={1.5} />
  </Svg>
);
