import { Rect, size } from "@shopify/react-native-skia";
import Svg, { Path } from "react-native-svg";

export const ExclamationIconWithCircel = ({
  color,
  size,
}: {
  color: string;
  size: number;
}) => {
  return (
    <Svg width={size} height={size} fill="none">
      <Path
        fill={color}
        fillRule="evenodd"
        d="M4.181 5.612H3.178v-.167h.334V2.932h-.334v-.168H4.18v2.68h.335v.168H4.18Zm-.334-3.319a.46.46 0 1 1 0-.92.46.46 0 0 1 0 .92Zm0 5.413A3.855 3.855 0 0 1 0 3.853 3.855 3.855 0 0 1 3.847 0a3.855 3.855 0 0 1 3.848 3.853 3.855 3.855 0 0 1-3.848 3.853Zm0-7.371A3.52 3.52 0 0 0 .335 3.853a3.52 3.52 0 0 0 3.512 3.518A3.52 3.52 0 0 0 7.36 3.853 3.52 3.52 0 0 0 3.847.335Z"
        clipRule="evenodd"
      />
    </Svg>
  );
};
