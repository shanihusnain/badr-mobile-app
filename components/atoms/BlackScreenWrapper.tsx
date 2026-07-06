import { Colors } from "@/constants/theme";
import {
  SafeAreaView,
  type Edge,
} from "react-native-safe-area-context";

type BlackScreenWrapperProps = {
  children?: React.ReactNode;
  edges?: Edge[];
};

export const BlackScreenWrapper: React.FC<BlackScreenWrapperProps> = ({
  children,
  edges = ["bottom", "left", "right", "top"],
}) => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.light.blackBackground,
        paddingHorizontal: 16,
      }}
      edges={edges}
    >
      {children}
    </SafeAreaView>
  );
};
