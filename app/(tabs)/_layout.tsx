import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { HeaderWithImageTitleAndBell } from "@/components/atoms/HeaderWithImageTitleAndBell";
import {
  ConnectTabIcon,
  HomeTabIcon,
  MoreTabIcon,
  PlanTabIcon,
} from "@/assets/icons";
import { ProtectedRoute } from "@/provider/ProtectedRoute";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <ProtectedRoute>
      <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.green,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: Colors.light.greybuttonBackground,
          borderTopWidth: 0,
        },
        headerStyle: {
          backgroundColor: Colors.light.blackBackground,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => <HomeTabIcon size={21} color={color} />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: "Plan",
          headerShown: true,
          header: () => <HeaderWithImageTitleAndBell />,
          tabBarIcon: ({ color }) => <PlanTabIcon size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="connect"
        options={{
          title: "Connect",
          tabBarIcon: ({ color }) => <ConnectTabIcon size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(more)"
        options={{
          title: "More",

          tabBarIcon: ({ color }) => <MoreTabIcon size={20} color={color} />,
        }}
      />
    </Tabs>
    </ProtectedRoute>
  );
}
