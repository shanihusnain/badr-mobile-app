import { Colors } from "@/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";

export const BlackScreenWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.light.blackBackground,
        paddingHorizontal: 16,
      }}
      edges={["bottom", "left", "right"]}
    >
      {children}
    </SafeAreaView>
  );
};
