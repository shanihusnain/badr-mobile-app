import React, { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { Colors } from "@/constants/theme";
import { myAccountStyles as styles } from "./style";
import { useRouter } from "expo-router";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import MyAccountListItem from "./components/MyAccountListItem";
import {
  CalendarIcon,
  PaymentIcon,
  InBoxArrow,
  ReferFriendTabIcon,
  RedeemGiftIcon,
  ProfileInformationIcon,
  EmailIcon,
  ChangePasswordIcon,
} from "@/assets/icons";
import { useAuth } from "@/provider/useAuth";

type ListItem = {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  route?: string;
};

const MEMBERSHIP_ITEMS: ListItem[] = [
  {
    title: "BADR MEMBERSHIP",
    subtitle: "Manage your membership",
    icon: <InBoxArrow color={Colors.light.subtext} size={24} />,
    route: "/(private)/badarmembership",
  },
  {
    title: "MEMBERSHIP EXTENSIONS",
    subtitle: "Add months to your membership and save",
    icon: <CalendarIcon color={Colors.light.subtext} size={24} />,
    route: "/(private)/membershipextension",
  },
  {
    title: "PAYMENT METHOD",
    subtitle: "Visa ending in 0022",
    icon: <PaymentIcon color={Colors.light.subtext} size={24} />,
    route: "/(private)/membershippaymentmethod",
  },
  {
    title: "REFER A FRIEND",
    subtitle: "Get one month free for each friend you refer",
    icon: <ReferFriendTabIcon color={Colors.light.subtext} size={24} />,
    route: "/(private)/friendreferal",
  },
  {
    title: "REDEEM GIFT EXTENSION",
    subtitle: "Apply your gift to your membership",
    icon: <RedeemGiftIcon color={Colors.light.subtext} size={24} />,
    route: "/(private)/redeemgiftextension",
  },
];

export default function MyAccountScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const personalItems = useMemo<ListItem[]>(
    () => [
      {
        title: "PROFILE INFORMATION",
        icon: <ProfileInformationIcon Color={Colors.light.subtext} size={24} />,
        route: "/(private)/editprofile",
      },
      {
        title: "EMAIL",
        subtitle: user?.email?.trim() || undefined,
        icon: <EmailIcon color={Colors.light.subtext} size={24} />,
        route: "/(private)/changeemailid",
      },
      {
        title: "CHANGE PASSWORD",
        icon: <ChangePasswordIcon color={Colors.light.subtext} size={24} />,
        route: "/(private)/changepassword",
      },
    ],
    [user?.email],
  );

  const handleItemPress = (item: ListItem) => {
    if (item.route) {
      router.push(item.route as any);
    }
  };

  const renderItem = (item: ListItem, index: number) => (
    <MyAccountListItem
      key={index}
      title={item.title}
      subtitle={item.subtitle}
      icon={item.icon}
      onPress={() => handleItemPress(item)}
    />
  );

  return (
    <BlackScreenWrapper>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Text style={styles.sectionTitle}>MEMBERSHIP</Text>
          {MEMBERSHIP_ITEMS.map((item, index) => renderItem(item, index))}

          <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>
          {personalItems.map((item, index) => renderItem(item, index + 100))}
        </View>
      </ScrollView>
    </BlackScreenWrapper>
  );
}
