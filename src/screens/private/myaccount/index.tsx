import React from "react";
import { View, Text, SafeAreaView, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { myAccountStyles as styles } from "./style";
import { useRouter } from "expo-router";

type ListItem = {
  title: string;
  subtitle?: string;
  icon: string;
  route?: string;
};

const MEMBERSHIP_ITEMS: ListItem[] = [
  {
    title: "BADR MEMBERSHIP",
    subtitle: "Manage your membership",
    icon: "moon",
    route: "/(private)/badarmembership",
  },
  {
    title: "MEMBERSHIP EXTENSIONS",
    subtitle: "Add months to your membership and save",
    icon: "calendar",
    route: "/(private)/membershipextension",
  },
  {
    title: "PAYMENT METHOD",
    subtitle: "Visa ending in 0022",
    icon: "credit-card",
    route: "/(private)/membershippaymentmethod",
  },
  {
    title: "REFER A FRIEND",
    subtitle: "Get one month free for each friend you refer",
    icon: "users",
    route: "/(private)/friendreferal",
  },
  {
    title: "REDEEM GIFT EXTENSION",
    subtitle: "Apply your gift to your membership",
    icon: "gift",
    route: "/(private)/redeemgiftextension",
  },
];

const PERSONAL_ITEMS: ListItem[] = [
  {
    title: "PROFILE INFORMATION",
    icon: "user",
    route: "/(private)/editprofile",
  },
  {
    title: "EMAIL",
    subtitle: "layla.najia@gmail.com",
    icon: "mail",
    route: "/(private)/changeemailid",
  },
  {
    title: "CHANGE PASSWORD",
    icon: "lock",
    route: "/(private)/changepassword",
  },
];

export default function MyAccountScreen() {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  const handleItemPress = (item: ListItem) => {
    if (item.route) {
      router.push(item.route as any);
    }
  };

  const renderItem = (item: ListItem, index: number) => (
    <Pressable key={index} style={styles.listCard} onPress={() => handleItemPress(item)}>
      <View style={styles.iconBox}>
        <Feather name={item.icon as any} size={18} color={Colors.light.dullWhite} />
      </View>
      <View style={styles.listItemInfo}>
        <Text style={styles.listItemTitle}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.listItemSubtitle}>{item.subtitle}</Text>
        )}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable style={styles.closeButton} onPress={handleClose}>
              <Feather name="x" size={18} color={Colors.light.white} />
            </Pressable>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>MY ACCOUNT</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>MEMBERSHIP</Text>
          {MEMBERSHIP_ITEMS.map((item, index) => renderItem(item, index))}

          <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>
          {PERSONAL_ITEMS.map((item, index) => renderItem(item, index + 100))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
