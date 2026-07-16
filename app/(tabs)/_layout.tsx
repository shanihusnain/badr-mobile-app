import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import {
  ConnectTabIcon,
  HomeTabIcon,
  MoreTabIcon,
  PlanTabIcon,
} from "@/assets/icons";
import { ProtectedRoute } from "@/provider/ProtectedRoute";

export default function TabLayout() {
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
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarItemStyle: {
            paddingTop: 4,
          },
          headerStyle: {
            backgroundColor: Colors.light.background,
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
          name="(plan)"
          options={{
            title: "Plan",
            headerShown: false,
            tabBarIcon: ({ color }) => <PlanTabIcon size={20} color={color} />,
          }}
        />
        <Tabs.Screen
          name="(connect)"
          options={{
            title: "Connect",
            // Leaving Connect (or opening it via deep link into learnmore) was
            // leaving learnmorescreen on the nested stack. Reset to index on blur.
            popToTopOnBlur: true,
            tabBarIcon: ({ color }) => (
              <ConnectTabIcon size={20} color={color} />
            ),
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
