import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import GoalDescriptionContent from "@/components/molecules/GoalDescriptionContent";
import { useNavigation } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { HeaderWithImageAndDescription } from "@/components/atoms/HeaderWithImageAndDescription";
import { Icon } from "@/assets/images";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import {
  GoalInfo,
  GoalReadMoreContainer,
  GoalReadMoreItem,
  GoalReadMoreTextStyle,
} from "@/src/translations/types";

type ReadMoreStyles = ReturnType<typeof createReadMoreStyles>;

const getReadMoreTextStyle = (
  style: GoalReadMoreTextStyle,
  readMoreStyles: ReadMoreStyles,
): TextStyle => {
  switch (style) {
    case "body":
      return readMoreStyles.body;
    case "bodyTight":
      return readMoreStyles.bodyTight;
    case "bodyMediumTight":
      return readMoreStyles.bodyMediumTight;
    case "bodyZero":
      return readMoreStyles.bodyZero;
    case "tableGuide":
      return readMoreStyles.tableGuide;
    case "sectionHeading":
      return readMoreStyles.sectionHeading;
    case "prayerHeading":
      return readMoreStyles.prayerHeading;
    case "quoteItalic":
      return readMoreStyles.quoteItalic;
    case "quoteSemibold":
      return readMoreStyles.quoteSemibold;
    case "quoteMediumItalic":
      return readMoreStyles.quoteMediumItalic;
    case "hadithQuoteLead":
      return readMoreStyles.hadithQuoteLead;
    case "hadithQuoteLight":
      return readMoreStyles.hadithQuoteLight;
    case "wuduBody":
      return readMoreStyles.wuduBody;
    case "wuduBodySpaced":
      return readMoreStyles.wuduBodySpaced;
    case "bilalQuote":
      return readMoreStyles.bilalQuote;
    case "bilalQuoteLight":
      return readMoreStyles.bilalQuoteLight;
    default:
      return readMoreStyles.body;
  }
};

const renderParsedContent = (content: string) => {
  if (!content) return "";
  const regex = /(\*\*.*?\*\*|\*.*?\*)/g;
  const parts = content.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const text = part.slice(2, -2);
      return (
        <Text
          key={index}
          style={{
            fontWeight: "600",
            fontFamily: fonts.primary.semiBold,
          }}
        >
          {text}
        </Text>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      const text = part.slice(1, -1);
      return (
        <Text
          key={index}
          style={{
            fontStyle: "italic",
            fontFamily: fonts.primary.regularItalic,
          }}
        >
          {text}
        </Text>
      );
    }
    return part;
  });
};

const renderReadMoreItem = (
  item: GoalReadMoreItem,
  index: number,
  textAlign: "left" | "right" | "center",
  readMoreStyles: ReadMoreStyles,
  isFirstInContainer: boolean,
) => {
  if (item.type === "prayerSection") {
    return (
      <View
        key={`prayer-${item.heading}-${index}`}
        style={[
          readMoreStyles.prayerSection,
          isFirstInContainer && index === 0 ? readMoreStyles.prayerSectionFirst : null,
          index > 0 ? readMoreStyles.blockSpacing : null,
        ]}
      >
        <Text style={[readMoreStyles.prayerHeading, { textAlign }]}>{item.heading}</Text>
        <Text style={[readMoreStyles.body, readMoreStyles.prayerDescription, { textAlign }]}>
          {item.description}
        </Text>
      </View>
    );
  }

  if (item.type === "benefit") {
    return (
      <View
        key={`benefit-${item.heading}-${index}`}
        style={[readMoreStyles.benefitSection, index > 0 ? readMoreStyles.blockSpacing : null]}
      >
        <Text style={[readMoreStyles.benefitHeading, { textAlign }]}>{item.heading}</Text>
        <Text style={[readMoreStyles.benefitDescription, { textAlign }]}>{item.description}</Text>
      </View>
    );
  }

  if (item.type === "replyWithQuote") {
    return (
      <Text
        key={`reply-${index}`}
        style={[readMoreStyles.bilalReply, index > 0 ? readMoreStyles.blockSpacing : null, { textAlign }]}
      >
        {item.prefix}{" "}
        <Text style={readMoreStyles.bilalReplyQuote}>{item.quote}</Text>
      </Text>
    );
  }

  if (item.type === "boldPrefixText") {
    const usesQuoteSpacing =
      item.style === "quoteItalic" ||
      item.style === "quoteSemibold" ||
      item.style === "quoteMediumItalic" ||
      item.style === "hadithQuoteLead" ||
      item.style === "hadithQuoteLight";
    const spacingStyle =
      index > 0
        ? usesQuoteSpacing
          ? readMoreStyles.quoteSpacing
          : readMoreStyles.blockSpacing
        : undefined;

    const itemTextAlign = item.align || textAlign;

    return (
      <Text
        key={`bold-prefix-${index}`}
        style={[getReadMoreTextStyle(item.style, readMoreStyles), spacingStyle, { textAlign: itemTextAlign }]}
      >
        <Text style={{ fontWeight: "600", fontFamily: fonts.primary.semiBold }}>{item.prefix} </Text>
        {renderParsedContent(item.content)}
      </Text>
    );
  }

  if (item.type === "boldSuffixText") {
    const usesQuoteSpacing =
      item.style === "quoteItalic" ||
      item.style === "quoteSemibold" ||
      item.style === "quoteMediumItalic" ||
      item.style === "hadithQuoteLead" ||
      item.style === "hadithQuoteLight";
    const spacingStyle =
      index > 0
        ? usesQuoteSpacing
          ? readMoreStyles.quoteSpacing
          : readMoreStyles.blockSpacing
        : undefined;

    const itemTextAlign = item.align || textAlign;

    return (
      <Text
        key={`bold-suffix-${index}`}
        style={[getReadMoreTextStyle(item.style, readMoreStyles), spacingStyle, { textAlign: itemTextAlign }]}
      >
        {renderParsedContent(item.content)}{" "}
        <Text style={{ fontWeight: "600", fontFamily: fonts.primary.semiBold }}>{item.suffix}</Text>
      </Text>
    );
  }

  const usesQuoteSpacing =
    item.style === "quoteItalic" ||
    item.style === "quoteSemibold" ||
    item.style === "quoteMediumItalic" ||
    item.style === "hadithQuoteLead" ||
    item.style === "hadithQuoteLight";
  const spacingStyle =
    index > 0
      ? usesQuoteSpacing
        ? readMoreStyles.quoteSpacing
        : readMoreStyles.blockSpacing
      : undefined;

  const itemTextAlign = item.align || textAlign;

  return (
    <Text
      key={`text-${index}`}
      style={[getReadMoreTextStyle(item.style, readMoreStyles), spacingStyle, { textAlign: itemTextAlign }]}
    >
      {renderParsedContent(item.content)}
    </Text>
  );
};

const renderReadMoreContainers = (
  containers: GoalReadMoreContainer[],
  textAlign: "left" | "right" | "center",
  readMoreStyles: ReadMoreStyles,
) =>
  containers.map((container, containerIndex) => (
    <GoalDescriptionContent key={`read-more-container-${containerIndex}`} textAlign={textAlign}>
      {container.items.map((item, itemIndex) =>
        renderReadMoreItem(item, itemIndex, textAlign, readMoreStyles, itemIndex === 0),
      )}
    </GoalDescriptionContent>
  ));

export const GoalDescriptionDetails = ({ goal }: { goal: string }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const navigation = useNavigation();
  const readMoreStyles = createReadMoreStyles();

  const goalInfo = (t(`goalsData.${goal}`, { returnObjects: true }) || {}) as GoalInfo;

  const steps = goalInfo.steps || [];
  const readMore = goalInfo.readMore || [];
  const heroTitle = goalInfo.heroTitle || "";
  const navTitle = goalInfo.navTitle || "";
  const description = goalInfo.description || "";
  const textAlign = isRtl ? "right" : "left";

  const hasReadMoreContent = readMore.length > 0;

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => (
        <HeaderWithImageAndDescription
          heroTitle={heroTitle}
          navTitle={navTitle}
          description={description}
          imageSource={Icon}
        />
      ),
    });
  }, [navigation, heroTitle, navTitle, description]);

  const renderReadMoreContent = () => (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {renderReadMoreContainers(readMore, textAlign, readMoreStyles)}
    </ScrollView>
  );

  if (hasReadMoreContent) {
    return <BlackScreenWrapper>{renderReadMoreContent()}</BlackScreenWrapper>;
  }

  return (
    <BlackScreenWrapper>
      <FlatList
        data={steps}
        keyExtractor={(item, index) => String(index)}
        contentContainerStyle={styles.scrollContent}
        renderItem={({ item }) => (
          <GoalDescriptionContent lines={item.split("\n")} textAlign={textAlign} />
        )}
      />
    </BlackScreenWrapper>
  );
};

const createReadMoreStyles = () =>
  StyleSheet.create({
    body: {
      color: Colors.light.white,
      fontFamily: fonts.primary.regular,
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
      alignSelf: "flex-start",
      width: "100%",
    },
    bodyTight: {
      color: Colors.light.white,
      fontFamily: fonts.primary.regular,
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: -0.3,
      alignSelf: "flex-start",
      width: "100%",
    },
    bodyMediumTight: {
      color: Colors.light.white,
      fontFamily: fonts.primary.regular,
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: -0.2,
      alignSelf: "flex-start",
      width: "100%",
    },
    bodyZero: {
      color: Colors.light.white,
      fontFamily: fonts.primary.regular,
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0,
      alignSelf: "flex-start",
      width: "100%",
    },
    tableGuide: {
      color: Colors.light.white,
      fontFamily: fonts.primary.regular,
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: -0.1,
      alignSelf: "flex-start",
      width: "100%",
    },
    sectionHeading: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontWeight: "600",
      fontSize: 16,
      lineHeight: 20,
      letterSpacing: 0,
      alignSelf: "flex-start",
      width: "100%",
      marginBottom: 4,
    },
    prayerHeading: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontWeight: "600",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0,
      alignSelf: "flex-start",
      width: "100%",
      marginBottom: 6,
    },
    quoteItalic: {
      color: Colors.light.white,
      fontFamily: fonts.primary.regularItalic,
      fontWeight: "400",
      fontStyle: "italic",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: -0.1,
      alignSelf: "flex-start",
      width: "100%",
    },
    quoteSemibold: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontWeight: "600",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
      alignSelf: "flex-start",
      width: "100%",
    },
    quoteMediumItalic: {
      color: Colors.light.white,
      fontFamily: fonts.primary.mediumItalic,
      fontWeight: "500",
      fontStyle: "italic",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: -0.1,
      alignSelf: "flex-start",
      width: "100%",
    },
    hadithQuoteLead: {
      color: Colors.light.white,
      fontSize: 14,
      fontWeight: "500",
      fontStyle: "italic",
      lineHeight: 22,
      alignSelf: "flex-start",
      width: "100%",
    },
    hadithQuoteLight: {
      color: Colors.light.white,
      fontFamily: fonts.primary.lightItalic,
      fontSize: 14,
      fontWeight: "400",
      fontStyle: "italic",
      lineHeight: 22,
      alignSelf: "flex-start",
      width: "100%",
      marginBottom: 12,
    },
    wuduBody: {
      color: Colors.light.white,
      fontFamily: fonts.primary.regular,
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 22,
      alignSelf: "flex-start",
      width: "100%",
    },
    wuduBodySpaced: {
      color: Colors.light.white,
      fontFamily: fonts.primary.regular,
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 22,
      alignSelf: "flex-start",
      width: "100%",
      marginTop: 16,
    },
    bilalQuote: {
      color: Colors.light.white,
      fontFamily: fonts.primary.medium,
      fontWeight: "500",
      fontStyle: "italic",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: -0.1,
      alignSelf: "flex-start",
      width: "100%",
      marginTop: 12,
    },
    bilalQuoteLight: {
      color: Colors.light.white,
      fontFamily: fonts.primary.regular,
      fontWeight: "400",
      fontStyle: "italic",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: -0.1,
      alignSelf: "flex-start",
      width: "100%",
    },
    bilalReply: {
      color: Colors.light.white,
      fontFamily: fonts.primary.regular,
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
      alignSelf: "flex-start",
      width: "100%",
      marginTop: 12,
    },
    bilalReplyQuote: {
      fontFamily: fonts.primary.regular,
      fontWeight: "400",
      fontStyle: "italic",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
      color: Colors.light.white,
    },
    benefitSection: {
      width: "100%",
      alignSelf: "flex-start",
    },
    benefitHeading: {
      color: Colors.light.white,
      fontSize: 14,
      fontFamily: fonts.primary.regular,
      fontWeight: "400",
      lineHeight: 22,
      alignSelf: "flex-start",
      marginBottom: 4,
    },
    benefitDescription: {
      color: Colors.light.white,
      fontSize: 14,
      fontFamily: fonts.primary.regular,
      fontWeight: "400",
      lineHeight: 22,
      alignSelf: "flex-start",
      width: "100%",
    },
    blockSpacing: {
      marginTop: 12,
    },
    quoteSpacing: {
      marginTop: 8,
    },
    prayerSection: {
      width: "100%",
      marginTop: 16,
      alignSelf: "flex-start",
    },
    prayerSectionFirst: {
      marginTop: 0,
    },
    prayerDescription: {
      marginTop: 0,
    },
  });

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
  },
});
