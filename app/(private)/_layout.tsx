import { Stack } from "expo-router";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import Header from "@/components/Header";
import { getGoalById } from "@/src/screens/private/home/components/goalsData";
import { HeaderWithInfoIcon } from "@/components/atoms/HeaderWithInfoIcon";
import { useTranslation } from "react-i18next";
import { Pressable, View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

const CustomHeader = ({
  title,
  navigation,
  letterSpacing = 0,
  iconName = "x",
}: {
  title: string;
  navigation: any;
  letterSpacing?: number;
  iconName?: keyof typeof Feather.glyphMap;
}) => (
  <View
    style={{
      height: 100,
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 40,
      paddingHorizontal: 24,
      backgroundColor: Colors.light.blackBackground,
    }}
  >
    {/* Centered title */}
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 40,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
      }}
      pointerEvents="none"
    >
      <Text
        style={{
          color: Colors.light.white,
          fontFamily: fonts.primary.semiBold,
          fontSize: 14,
          letterSpacing: letterSpacing,
        }}
      >
        {title}
      </Text>
    </View>

    {/* Close button — sits on top of title via zIndex */}
    <Pressable
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.light.greybuttonBackground,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
      }}
      onPress={() => navigation.goBack()}
    >
      <Feather name={iconName} size={20} color={Colors.light.white} />
    </Pressable>
  </View>
);

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
            <CustomHeader title="PAYMENT SUCCESSFUL" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen name="giftnewmember" options={{ headerShown: false }} />
      <Stack.Screen
        name="newmembercart"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <CustomHeader title="CART" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen
        name="myaccount"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <CustomHeader title="MY ACCOUNT" navigation={navigation} />
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
            <CustomHeader title="MEMBERSHIP" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen
        name="changepassword"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <CustomHeader title="CHANGE PASSWORD" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen
        name="changeemailid"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <CustomHeader title="CHANGE EMAIL ID" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen
        name="editprofile"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <CustomHeader title="EDIT PROFILE" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen
        name="friendreferal"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <CustomHeader title="REFER A FRIEND" navigation={navigation} letterSpacing={0} iconName="chevron-left" />
          ),
        }}
      />
      <Stack.Screen
        name="appsetting"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <CustomHeader title="APP SETTINGS" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen
        name="artificialintelligencesetting"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <CustomHeader title="AI SETTINGS" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen
        name="calendersettings"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <CustomHeader title="CALENDAR SETTINGS" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen
        name="exportdata"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <CustomHeader title="EXPORT BADR DATA" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen
        name="exportdataconfirmation"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <CustomHeader title="EXPORT BADR DATA" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen
        name="redeemgiftextension"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <View
              style={{
                height: 100,
                flexDirection: "row",
                alignItems: "flex-end",
                paddingHorizontal: 24,
                paddingBottom: 16,
                backgroundColor: Colors.light.blackBackground,
              }}
            >
              <Pressable
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: Colors.light.greybuttonBackground,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => navigation.goBack()}
              >
                <Feather name="x" size={20} color={Colors.light.white} />
              </Pressable>
            </View>
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
            <CustomHeader title="STATUS INSIGHTS" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen
        name="hidemetrics"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <CustomHeader title="HIDE METRICS" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen
        name="privacysetting"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <CustomHeader title="PRIVACY" navigation={navigation} />
          ),
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <CustomHeader title="NOTIFICATIONS" navigation={navigation} />
          ),
        }}
      />      <Stack.Screen
        name="journalappsetting"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <CustomHeader title="JOURNAL" navigation={navigation} />
          ),
        }}
      />      <Stack.Screen name="about" options={{ headerShown: false }} />
      <Stack.Screen
        name="helpcentre"
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <CustomHeader title="HELP CENTRE" navigation={navigation} iconName="chevron-left" />
          ),
        }}
      />
    </Stack>
  );
}
