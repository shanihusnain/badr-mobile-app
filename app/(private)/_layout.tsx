import { Stack } from "expo-router";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import Header from "@/components/Header";
import { getGoalById } from "@/src/screens/private/home/components/goalsData";
import { HeaderWithInfoIcon } from "@/components/atoms/HeaderWithInfoIcon";
import { useTranslation } from "react-i18next";
import { ProtectedRoute } from "@/provider/ProtectedRoute";
import { CrossHeader } from "@/components/atoms/CrossHeader";

export default function PrivateLayout() {
  const { t } = useTranslation();
  return (
    <ProtectedRoute>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.light.blackBackground },
          headerTintColor: Colors.light.white,
          headerTitleStyle: {
            fontFamily: fonts.primary.semiBold,
            fontSize: 16,
            color: Colors.light.white,
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="setpersonalizedgoals/index"
          options={{ headerShown: true, title: "" }}
        />
        <Stack.Screen
          name="monthlygoalplanner"
          options={{ headerShown: true, title: "MONTHLY GOAL PLANNER" }}
        />
        <Stack.Screen
          name="goaldescriptiondetails/[goal]"
          options={{ headerShown: true, title: "" }}
        />
        <Stack.Screen
          name="streakcounter"
          options={{
            headerShown: true,
            header: () => (
              <HeaderWithInfoIcon title={t("streakCounter.title")} />
            ),
          }}
        />
        <Stack.Screen
          name="home"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="membershippaymentmethod"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="paymentsuccessscreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="giftnewmember"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="newmembercart"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="badarmembership"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="cancelmembershipconfirmation"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="changepassword"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="changepassword/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="changeemailid"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="editprofile"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="redeemgiftextension"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="myaccount"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="membershipextension"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="giftpersonaldetails"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="friendreferal"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="giftcurrentmember"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="menstruationlog"
          options={{
            headerShown: true,
            header: () => (
              <Header title={t("homeScreen.menstruationLog_logMenstruation")} />
            ),
          }}
        />
        <Stack.Screen
          name="goalprogressloggingscreen/[goalId]"
          options={{
            headerShown: true,
            title: "GOAL PROGRESS",
            headerBackTitle: "Back",
            header: ({ route }) => {
              const goalData = getGoalById((route?.params as any)?.goalId);

              const title = goalData?.title?.toUpperCase();
              return <Header title={title ?? ""} />;
            },
          }}
        />
        <Stack.Screen
          name="goalprogressoverview/[goal]"
          options={{
            headerShown: true,
            title: "",
            headerBackTitle: "Back",
            header: ({ route }) => {
              return (
                <Header
                  title={
                    (route?.params as any)?.goal?.toUpperCase() + " " + "GOALS"
                  }
                />
              );
            },
          }}
        />
        <Stack.Screen
          name="helpconsistency"
          options={{
            headerShown: true,
            header: () => <CrossHeader />,
          }}
        />
      </Stack>
    </ProtectedRoute>
  );
}
