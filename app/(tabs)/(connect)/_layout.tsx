import { HeaderWithCrossTitleDynamicIcon } from "@/components/atoms/HeaderWithCrossTitleDynamicIcon";
import { HeaderWithImageTitleAndBell } from "@/components/atoms/HeaderWithImageTitleAndBell";
import { Colors } from "@/constants/theme";
import { Stack } from "expo-router";

export default function ConnectLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.light.blackBackground },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          header: () => <HeaderWithImageTitleAndBell title="Connect" />,
        }}
      />
      <Stack.Screen
        name="learnmorescreen"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <HeaderWithCrossTitleDynamicIcon
              title="DISCOVER"
              navigation={navigation}
              iconName="chevron-left"
              rightIconName="search"
            />
          ),
        }}
      />
    </Stack>
  );
}
