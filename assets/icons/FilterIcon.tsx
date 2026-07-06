import Svg, { Path } from "react-native-svg";

type FilterIconProps = {
  size?: number;
  color?: string;
};

export const FilterIcon = ({ size, color }: FilterIconProps) => {
  return (
    <Svg width={size} height={size} fill="none">
      <Path
        fill={color}
        d="M14.584 19.417a5.375 5.375 0 1 1-5.28 6.375H4.375a1 1 0 0 1 0-2h4.928a5.376 5.376 0 0 1 5.281-4.375Zm0 2a3.375 3.375 0 1 0 0 6.75 3.375 3.375 0 0 0 0-6.75Zm16.041 2.375a1 1 0 1 1 0 2h-7.292a1 1 0 0 1 0-2h7.292ZM20.416 4.833a5.375 5.375 0 0 1 5.28 4.375h4.929a1 1 0 0 1 0 2h-4.928a5.376 5.376 0 1 1-5.281-6.375Zm0 2a3.375 3.375 0 1 0 0 6.75 3.375 3.375 0 0 0 0-6.75Zm-8.647 2.38a1.001 1.001 0 0 1 0 1.99l-.102.005H4.375a1 1 0 1 1 0-2h7.292l.102.005Z"
      />
    </Svg>
  );
};
