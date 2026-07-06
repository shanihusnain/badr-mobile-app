import { Stack } from "expo-router";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import Header from "@/components/Header";
import { getGoalById } from "@/src/screens/private/home/components/goalsData";
import { HeaderWithInfoIcon } from "@/components/atoms/HeaderWithInfoIcon";
import { useTranslation } from "react-i18next";
import { HeaderWithCrossTitleDynamicIcon } from "@/components/atoms/HeaderWithCrossTitleDynamicIcon";


export default function PrivateLayout() {
  const { t } = useTranslation();
  return (
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
          header: () => <HeaderWithInfoIcon title={t("streakCounter.title")} />,
        }}
      />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="membershippaymentmethod" options={{ headerShown: false }} />
      <Stack.Screen
        name="paymentsuccessscreen"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <HeaderWithCrossTitleDynamicIcon title="PAYMENT SUCCESSFUL" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen name="giftnewmember" options={{ headerShown: false }} />
      <Stack.Screen
        name="newmembercart"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <HeaderWithCrossTitleDynamicIcon title="CART" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen
        name="myaccount"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <HeaderWithCrossTitleDynamicIcon title="MY ACCOUNT" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen name="membershipextension" options={{ headerShown: false }} />
      <Stack.Screen name="giftpersonaldetails" options={{ headerShown: false }} />
      <Stack.Screen name="giftcurrentmember" options={{ headerShown: false }} />
      <Stack.Screen name="cancelmembershipconfirmation" options={{ headerShown: false }} />
      <Stack.Screen name="changepassword/index" options={{ headerShown: false }} />
      <Stack.Screen
        name="badarmembership"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <HeaderWithCrossTitleDynamicIcon title="MEMBERSHIP" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen
        name="changepassword"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <HeaderWithCrossTitleDynamicIcon title="CHANGE PASSWORD" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen
        name="changeemailid"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <HeaderWithCrossTitleDynamicIcon title="CHANGE EMAIL ID" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen
        name="editprofile"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <HeaderWithCrossTitleDynamicIcon title="EDIT PROFILE" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen
        name="friendreferal"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <HeaderWithCrossTitleDynamicIcon title="REFER A FRIEND" navigation={navigation} letterSpacing={0} iconName="chevron-left" />
          ),
        }}
      />
      <Stack.Screen
        name="appsetting"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <HeaderWithCrossTitleDynamicIcon title="APP SETTINGS" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen
        name="artificialintelligencesetting"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <HeaderWithCrossTitleDynamicIcon title="AI SETTINGS" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen
        name="calendersettings"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <HeaderWithCrossTitleDynamicIcon title="CALENDAR SETTINGS" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen
        name="exportdata"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <HeaderWithCrossTitleDynamicIcon title="EXPORT BADR DATA" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen
        name="exportdataconfirmation"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <HeaderWithCrossTitleDynamicIcon title="EXPORT BADR DATA" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen
        name="redeemgiftextension"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <HeaderWithCrossTitleDynamicIcon title="" navigation={navigation} />
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
          header: ({ route }) => (
            <Header
              title={
                ((route?.params as any)?.goal as string)?.toUpperCase() ?? ""
              }
            />
          ),
        }}
      />
      <Stack.Screen
        name="statusinsights"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <HeaderWithCrossTitleDynamicIcon title="STATUS INSIGHTS" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen
        name="hidemetrics"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <HeaderWithCrossTitleDynamicIcon title="HIDE METRICS" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen
        name="privacysetting"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <HeaderWithCrossTitleDynamicIcon title="PRIVACY" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <HeaderWithCrossTitleDynamicIcon title="NOTIFICATIONS" navigation={navigation} />
          ),
        }}
      />      <Stack.Screen
        name="journalappsetting"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <HeaderWithCrossTitleDynamicIcon title="JOURNAL" navigation={navigation} />
          ),
        }}
      />      <Stack.Screen name="about" options={{ headerShown: false }} />
      <Stack.Screen
        name="helpcentre"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <HeaderWithCrossTitleDynamicIcon title="HELP CENTRE" navigation={navigation} iconName="chevron-left" />
          ),
        }}
      />
    </Stack>
  );
}
