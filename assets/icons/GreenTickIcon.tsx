import * as React from "react";
import Svg, { Path } from "react-native-svg";

export const GreenTickIcon = ({
  color,
  size,
}: {
  color: string;
  size: number;
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 5 4"
    fill="none"
  >
    <Path
      fill={color}
      d="M4.25.183c-.05.013-.074.033-.137.113L2.865 1.88 1.682 3.388l-.075-.06c-.041-.031-.32-.257-.62-.501C.475 2.41.44 2.382.402 2.372a.198.198 0 0 0-.179.038.12.12 0 0 0-.022.16 48.399 48.399 0 0 0 1.432 1.165.195.195 0 0 0 .187-.02C1.847 3.696 4.435.408 4.456.368c.022-.042.005-.11-.037-.146a.22.22 0 0 0-.168-.038Z"
    />
  </Svg>
);
