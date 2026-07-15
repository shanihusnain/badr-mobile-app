import { Stack } from "expo-router";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import Header from "@/components/Header";
import { getGoalById } from "@/src/screens/private/home/components/goalsData";
import { HeaderWithInfoIcon } from "@/components/atoms/HeaderWithInfoIcon";
import { useTranslation } from "react-i18next";
import { HeaderWithCrossTitleDynamicIcon } from "@/components/atoms/HeaderWithCrossTitleDynamicIcon";
import { ProtectedRoute } from "@/provider/ProtectedRoute";
import { CrossHeader } from "@/components/atoms/CrossHeader";
import { JournalFillingHeader } from "@/components/atoms/JournalFillingHeader";

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
            headerShown: true,
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title="PAYMENT METHOD"
                navigation={navigation}
                iconName="chevron-left"
              />
            ),
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
            headerShown: true,
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title=""
                navigation={navigation}
                iconName="chevron-left"
              />
            ),
          }}
        />
        <Stack.Screen
          name="newmembercart"
          options={{
            headerShown: true,
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title="CART"
                navigation={navigation}
                iconName="chevron-left"
              />
            ),
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
            headerShown: true,
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title="CHANGE PASSWORD"
                navigation={navigation}
                iconName="chevron-left"
              />
            ),
          }}
        />
        <Stack.Screen
          name="changepassword/index"
          options={{
            headerShown: true,
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title="CHANGE PASSWORD"
                navigation={navigation}
                iconName="chevron-left"
              />
            ),
          }}
        />
        <Stack.Screen
          name="changeemailid"
          options={{
            headerShown: true,
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title="CHANGE EMAIL ID"
                navigation={navigation}
                iconName="chevron-left"
              />
            ),
          }}
        />
        <Stack.Screen
          name="editprofile"
          options={{
            headerShown: true,
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title="EDIT PROFILE"
                navigation={navigation}
                iconName="chevron-left"
              />
            ),
          }}
        />
        <Stack.Screen
          name="redeemgiftextension"
          options={{
            headerShown: true,
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title=""
                navigation={navigation}
                iconName="x"
              />
            ),
          }}
        />
        <Stack.Screen
          name="myaccount"
          options={{
            headerShown: true,
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title="MY ACCOUNT"
                navigation={navigation}
                iconName="chevron-left"
              />
            ),
          }}
        />
        <Stack.Screen
          name="privacysetting"
          options={{
            headerShown: true,
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title="PRIVACY SETTINGS"
                navigation={navigation}
                iconName="chevron-left"
              />
            ),
          }}
        />
        <Stack.Screen
          name="helpcentre"
          options={{
            headerShown: true,
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title="HELP CENTRE"
                navigation={navigation}
                iconName="chevron-left"
              />
            ),
          }}
        />
        <Stack.Screen
          name="about"
          options={{
            headerShown: true,
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title="ABOUT"
                navigation={navigation}
                iconName="chevron-left"
              />
            ),
          }}
        />
        <Stack.Screen
          name="badarmembership"
          options={{
            headerShown: true,
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title="BADR MEMBERSHIP"
                navigation={navigation}
                iconName="chevron-left"
              />
            ),
          }}
        />
        <Stack.Screen
          name="changemembership"
          options={{
            headerShown: true,
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title="CHANGE MEMBERSHIP"
                navigation={navigation}
                iconName="chevron-left"
              />
            ),
          }}
        />
        <Stack.Screen
          name="membershipextension"
          options={{
            headerShown: true,
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title="MEMBERSHIP EXTENSION"
                navigation={navigation}
                iconName="chevron-left"
              />
            ),
          }}
        />
        <Stack.Screen
          name="giftpersonaldetails"
          options={{
            headerShown: true,
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title=""
                navigation={navigation}
                iconName="chevron-left"
              />
            ),
          }}
        />
        <Stack.Screen
          name="friendreferal"
          options={{
            headerTransparent: true,
            headerStyle: { backgroundColor: "transparent" },
            headerShown: true,
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title="REFER A FRIEND"
                navigation={navigation}
                iconName="chevron-left"
              />
            ),
          }}
        />
        <Stack.Screen
          name="enterinvitecode"
          options={{
            headerShown: true,
            headerTransparent: true,
            headerStyle: { backgroundColor: "transparent" },
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title="ENTER INVITE CODE"
                navigation={navigation}
                bgcolor="transparent"
                iconName="chevron-left"
              />
            ),
          }}
        />
        <Stack.Screen
          name="jointeam"
          options={{
            headerShown: true,
            headerTransparent: true,
            headerStyle: { backgroundColor: "transparent" },
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title=""
                navigation={navigation}
                bgcolor="transparent"
                iconName="chevron-left"
              />
            ),
          }}
        />
        <Stack.Screen
          name="learnmore"
          options={{
            headerShown: true,
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title="DISCOVER"
                navigation={navigation}
                iconName="chevron-left"
                rightIconName="search"
                onRightPress={() => console.log("Discover search")}
              />
            ),
          }}
        />
        <Stack.Screen
          name="giftcurrentmember"
          options={{
            headerShown: true,
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title=""
                navigation={navigation}
                iconName="chevron-left"
              />
            ),
          }}
        />
        <Stack.Screen
          name="calendersettings"
          options={{
            headerShown: true,
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title="CALENDAR SETTINGS"
                navigation={navigation}
                iconName="chevron-left"
              />
            ),
          }}
        />
        <Stack.Screen
          name="appsetting"
          options={{
            headerShown: true,
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title="APP SETTINGS"
                navigation={navigation}
                iconName="chevron-left"
              />
            ),
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            headerShown: true,
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title="NOTIFICATIONS"
                navigation={navigation}
                iconName="chevron-left"
              />
            ),
          }}
        />
        <Stack.Screen
          name="chatnotificationsettings"
          options={{
            headerShown: true,
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title="NOTIFICATION SETTINGS"
                navigation={navigation}
                iconName="chevron-left"
              />
            ),
          }}
        />
        <Stack.Screen
          name="journalappsetting"
          options={{
            headerShown: true,
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title="JOURNAL"
                navigation={navigation}
                iconName="chevron-left"
              />
            ),
          }}
        />
        <Stack.Screen
          name="hidemetrics"
          options={{
            headerShown: true,
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title="HIDE METRICS"
                navigation={navigation}
                iconName="chevron-left"
              />
            ),
          }}
        />
        <Stack.Screen
          name="statusinsights"
          options={{
            headerShown: true,
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title="STATUS INSIGHTS"
                navigation={navigation}
                iconName="chevron-left"
              />
            ),
          }}
        />
        <Stack.Screen
          name="artificialintelligencesetting"
          options={{
            headerShown: true,
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title="AI SETTINGS"
                navigation={navigation}
                iconName="chevron-left"
              />
            ),
          }}
        />
        <Stack.Screen
          name="exportdata"
          options={{
            headerShown: true,
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title="EXPORT BADR DATA"
                navigation={navigation}
                iconName="chevron-left"
              />
            ),
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
            headerTransparent: true,
            headerStyle: { backgroundColor: "transparent" },
            title: "GOAL PROGRESS",
            headerBackTitle: "Back",
            header: ({ route, navigation }) => {
              const goalData = getGoalById((route?.params as any)?.goalId);

              const title = goalData?.title?.toUpperCase() ?? "";
              return (
                <HeaderWithCrossTitleDynamicIcon
                  title={title}
                  navigation={navigation}
                  iconName="chevron-left"
                  bgcolor="transparent"
                  leftButtonBackground="rgba(255,255,255,0.08)"
                />
              );
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
        <Stack.Screen
          name="journalfilling"
          options={{
            headerShown: true,
            headerTransparent: true,
            header: () => <JournalFillingHeader />,
          }}
        />
        <Stack.Screen
          name="behaviordescriptiondetails/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="createteam"
          options={{
            headerShown: true,
            headerTransparent: true,
            headerStyle: { backgroundColor: "transparent" },
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                titleHighlight="01"
                title="Create Team"
                navigation={navigation}
                bgcolor="transparent"
                secondTitle="CHOOSE TEAM NAME"
                iconName="chevron-left"
              />
            ),
          }}
        />
        <Stack.Screen
          name="teamprofile"
          options={{
            headerShown: true,
            headerTransparent: true,
            headerStyle: { backgroundColor: "transparent" },
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title=""
                navigation={navigation}
                bgcolor="transparent"
                iconName="chevron-left"
              />
            ),
          }}
        />
        <Stack.Screen
          name="manageteam"
          options={{
            headerShown: true,
            headerTransparent: true,
            headerStyle: { backgroundColor: "transparent" },
            header: ({ navigation }) => (
              <HeaderWithCrossTitleDynamicIcon
                title="MANAGE TEAM"
                navigation={navigation}
                bgcolor="transparent"
                iconName="chevron-left"
              />
            ),
          }}
        />
      </Stack>
    </ProtectedRoute>
  );
}
