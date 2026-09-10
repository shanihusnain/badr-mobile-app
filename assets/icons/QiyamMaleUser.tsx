import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/constants/theme";

type QiyamMaleUserIconProps = {
  color?: string;
  size?: number;
  /** Outline style for the when-pray logging step dropdown. */
  outline?: boolean;
};

export const QiyamMaleUserIcon = ({
  color = Colors.light.white,
  size = 20,
  outline = false,
}: QiyamMaleUserIconProps) => {
  const width = (13 / 18) * size;
  const height = size;

  return (
    <Svg width={width} height={height} fill="none" viewBox="0 0 13 18">
      <Path
        fill={outline ? "none" : color}
        stroke={outline ? color : undefined}
        strokeWidth={outline ? 1.1 : undefined}
        strokeLinejoin={outline ? "round" : undefined}
        strokeLinecap={outline ? "round" : undefined}
        d="M5.412.915c.224-.204.373-.377.465-.491C5.51.094 5.144 0 4.845 0c-.373 0-.64.144-.659.155l-.011.008c-.455.224-.737.523-.836.886-.12.441.043.894.161 1.143.945-.472 1.559-.95 1.914-1.277h-.002ZM3.771 2.666l.222 1.017a.266.266 0 0 1 0 .11l-.167.706 1.028.326.254-.729a.25.25 0 0 1 .276-.163l.556.095a.566.566 0 0 0 .641-.415c.18-.851.014-1.638-.157-2.15A4.966 4.966 0 0 0 6.17.85c-.34.394-1.07 1.094-2.413 1.77.006.015.011.03.015.046h-.002ZM11.364 7.38c.241-.278.313-.66.208-1L9.72 7.913l.447.853 1.198-1.385ZM12.01 14.304l-4.626-1.856a.25.25 0 0 1-.155-.231v-.937l-.367.193a1.646 1.646 0 0 1-1.285.107 1.658 1.658 0 0 1-.975-.842l-1.07-2.152a.248.248 0 0 1 .442-.222l1.07 2.153c.143.284.386.493.687.59.3.1.62.073.901-.073l.729-.38L9.904 9.33l-.623-1.193-2.118.522-.896.222a.25.25 0 0 1-.12-.484l.635-.155-.505-1.45a2.385 2.385 0 0 0-1.52-1.48L3.624 4.95a8.467 8.467 0 0 0-1.272 2.367 7.444 7.444 0 0 0-.414 2.8c.023.48.188 2.263 1.346 5.02a.25.25 0 0 1 .02.082l.693.084 4.083-.58a.247.247 0 0 1 .28.212.248.248 0 0 1-.21.282l-3.99.565-.693 1.316h8.01c.728 0 1.346-.544 1.437-1.267a1.447 1.447 0 0 0-.898-1.527h-.005Z"
      />
      <Path
        fill={outline ? "none" : color}
        stroke={outline ? color : undefined}
        strokeWidth={outline ? 1.1 : undefined}
        strokeLinejoin={outline ? "round" : undefined}
        strokeLinecap={outline ? "round" : undefined}
        d="M2.712 15.65h-.007a1.639 1.639 0 0 0-1.121.236l-1.52.962a.134.134 0 0 0-.064.116c0 .076.06.136.136.136h2.765l.705-1.34-.894-.107v-.002Z"
      />
    </Svg>
  );
};
