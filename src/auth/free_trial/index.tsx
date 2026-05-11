import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GreenTextButton } from "../../../components/atoms/GreenTextButton";
import { Colors } from "../../../constants/theme";
import { RenderItem } from "./components/RenderItem";
import createStyles from "./styles";
import { useFreeTrialProps } from "./useFreeTrialProps";

export default function FreeTrialScreen() {
  const styles = createStyles();
  const router = useRouter();
  const { texts } = useFreeTrialProps();

  const renderItem = ({
    item,
  }: {
    item: {
      title: string;
    };
  }) => <RenderItem item={item} />;
  const renderHeader = () => {
    return (
      <>
        <Text style={styles.titleText}>GET YOUR 2-MONTH FREE TRIAL</Text>

        <View style={styles.secondaryTextWrapper}>
          <View style={styles.greenLine} />
          <Text style={styles.secondarytext}>WHAT’S INCLUDED?</Text>
        </View>
        <Text style={styles.subtitletext}>
          With your Badr membership, you unlock features designed to support
          your journey towards becoming a better Muslim.
        </Text>
      </>
    );
  };
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.light.blackBackground,
        paddingHorizontal: 20,
        paddingTop: 20,
      }}
      edges={["top", "bottom", "left", "right"]}
    >
      <FlatList
        data={texts}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
      />
      <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        <GreenTextButton
          title="START YOUR FREE TRIAL"
          onPress={() => router.push("/createaccount")}
        />
      </View>
    </SafeAreaView>
  );
}
