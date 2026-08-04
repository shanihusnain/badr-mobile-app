import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import GoalDescriptionContent from "@/components/molecules/GoalDescriptionContent";
import { useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
import {
  Icon,
  qiyamallayldetailimage,
  fivedailyprayerbottomsheetimage,
  duhaprayerdetailimage,
  istikharaprayerdetailimage,
  tawbahprayerdetailimage,
  tahiyyatwudhudetailimage,
  tahiyyatmasjiddetailimage,
  sunnahrawatibdetailimage,
  missedprayerdetailimage,
  shukarprayerdetailimage,
  missedramadanfastsbottomsheetimage,
  thefastsofprophetdawoodbottomsheetimage,
  mondayandthursdayfastsbottomsheetimage,
  whitedaysfastsbottomsheetimage,
  quranlisteningbottomsheetimage,
  quranrecitationbottomsheetimage,
  quranmemorizationbottomsheetimage,
  qurantajweedbottomsheetimage,
} from "@/assets/images";
import {
  TahiyyatWudhuEyeIcon,
  TahiyyatWudhuDropIcon,
  TahiyyatWudhuShootIcon,
  TahiyyatWudhuHeartIcon,
  HadeethBookIcon,
  StarSparkleIcon,
  FajarSunIcon,
  DuhrSunIcon,
  MaghribSunIcon,
  IshaMoonIcon,
  DuhaPrayerStar,
  ManPrayerIcon,
  QuranImageIcon,
  IstikharaClockIcon,
  ManDuaIcon,
  QuranListeningMoon,
  QuranMemorizationIcon,
  QuranTajweedIcon,
  MissedRamadanFastsHandsIcon,
  MissedRamadanFastsPlatesIcon,
  ProphetDawoodFastsConnectionWithAllah,
  ProphetDawoodFastsMoonAndHandIcon,
  ProphetDawoodFastsHeartIcon,
  ProphetDawoodMindfullnessIcon,
  ProphetDawoodGratitudeIcon,
  ProphetDawoodMentalHealthIcon,
  ProphetDawoodHeartBreakIcon,
  ProphetDawoodPersonalDevelopmentIcon,
  ProphetDawoodBalanceIcon,
  MondayAndThursdayFastsHabitualIcon,
  MondayAndThursdayAllahRememberenceIcon,
  DashBoardHandHeartIcon,
} from "@/assets/icons";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import {
  GoalInfo,
  GoalReadMoreContainer,
  GoalReadMoreItem,
  GoalReadMoreTextStyle,
} from "@/src/translations/types";
import { useGetPrayerDetailByType } from "@/src/api/queries/useGetPrayerDetailBytype";
import { useGetQuranDetailByType } from "@/src/api/queries/useGetQuranDetailByType";
import { useGetFastingDetailByType } from "@/src/api/queries/useGetFastingDetailByType";
import { isPrayerGoalKey, resolvePrayerUiId } from "@/src/utils/prayerGoalMap";
import { isQuranGoalKey, resolveQuranUiId } from "@/src/utils/quranGoalMap";
import {
  isFastingGoalKey,
  resolveFastingUiId,
} from "@/src/utils/fastingGoalMap";
import { getAccessToken } from "@/src/storage/tokenStorage";
import { createReadMoreStyles, styles } from "./styles";
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
const token = getAccessToken();
console.log("token", token);
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
    let PrayerIcon: React.ComponentType<{
      color?: string;
      size?: number;
    }> | null = null;
    if (item.heading === "Fajr Prayer") PrayerIcon = FajarSunIcon;
    else if (item.heading === "Dhuhr Prayer") PrayerIcon = DuhrSunIcon;
    else if (item.heading === "Maghrib Prayer") PrayerIcon = MaghribSunIcon;
    else if (item.heading === "Isha Prayer") PrayerIcon = IshaMoonIcon;

    return (
      <View
        key={`prayer-${item.heading}-${index}`}
        style={[
          readMoreStyles.prayerSection,
          isFirstInContainer && index === 0
            ? readMoreStyles.prayerSectionFirst
            : null,
          index > 0 ? readMoreStyles.blockSpacing : null,
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          <View style={{ marginRight: 8, marginTop: -4 }}>
            {PrayerIcon ? (
              <PrayerIcon color={Colors.light.dullWhite} size={28} />
            ) : (
              <StarSparkleIcon color={Colors.light.white} size={24} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[readMoreStyles.prayerHeading, { textAlign }]}>
              {item.heading}
            </Text>
            <Text
              style={[
                readMoreStyles.body,
                readMoreStyles.prayerDescription,
                { textAlign },
              ]}
            >
              {item.description}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (item.type === "benefit") {
    let BenefitIcon = null;
    if (item.heading === "Spiritual Readiness")
      BenefitIcon = TahiyyatWudhuEyeIcon;
    if (item.heading === "Purification") BenefitIcon = TahiyyatWudhuDropIcon;
    if (item.heading === "Intention Setting")
      BenefitIcon = TahiyyatWudhuShootIcon;
    if (item.heading === "Connection with Allah")
      BenefitIcon = TahiyyatWudhuHeartIcon;

    return (
      <View
        key={`benefit-${item.heading}-${index}`}
        style={[
          readMoreStyles.benefitSection,
          index > 0 ? readMoreStyles.blockSpacing : null,
        ]}
      >
        {BenefitIcon && (
          <View style={{ marginTop: 2, marginRight: 12 }}>
            <BenefitIcon />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[readMoreStyles.benefitHeading, { textAlign }]}>
            {item.heading}:{" "}
            <Text style={[readMoreStyles.benefitDescription, { textAlign }]}>
              {item.description}
            </Text>
          </Text>
        </View>
      </View>
    );
  }

  if (item.type === "replyWithQuote") {
    return (
      <Text
        key={`reply-${index}`}
        style={[
          readMoreStyles.bilalReply,
          index > 0 ? readMoreStyles.blockSpacing : null,
          { textAlign },
        ]}
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

    let IconComp = null;
    if (item.icon === "MissedRamadanFastsPlatesIcon")
      IconComp = MissedRamadanFastsPlatesIcon;
    else if (item.icon === "QuranImageIcon") IconComp = QuranImageIcon;
    else if (item.icon === "ProphetDawoodFastsConnectionWithAllah")
      IconComp = ProphetDawoodFastsConnectionWithAllah;
    else if (item.icon === "ProphetDawoodFastsMoonAndHandIcon")
      IconComp = ProphetDawoodFastsMoonAndHandIcon;
    else if (item.icon === "ProphetDawoodFastsHeartIcon")
      IconComp = ProphetDawoodFastsHeartIcon;
    else if (item.icon === "ProphetDawoodMindfullnessIcon")
      IconComp = ProphetDawoodMindfullnessIcon;
    else if (item.icon === "ProphetDawoodGratitudeIcon")
      IconComp = ProphetDawoodGratitudeIcon;
    else if (item.icon === "ProphetDawoodMentalHealthIcon")
      IconComp = ProphetDawoodMentalHealthIcon;
    else if (item.icon === "ProphetDawoodHeartBreakIcon")
      IconComp = ProphetDawoodHeartBreakIcon;
    else if (item.icon === "ProphetDawoodPersonalDevelopmentIcon")
      IconComp = ProphetDawoodPersonalDevelopmentIcon;
    else if (item.icon === "ProphetDawoodBalanceIcon")
      IconComp = ProphetDawoodBalanceIcon;
    else if (item.icon === "MondayAndThursdayFastsHabitualIcon")
      IconComp = MondayAndThursdayFastsHabitualIcon;
    else if (item.icon === "MondayAndThursdayAllahRememberenceIcon")
      IconComp = MondayAndThursdayAllahRememberenceIcon;
    else if (item.icon === "DashBoardHandHeartIcon")
      IconComp = DashBoardHandHeartIcon;

    if (IconComp) {
      let iconColor =
        item.icon === "QuranImageIcon"
          ? Colors.light.green
          : Colors.light.dullWhite;
      let iconSize = 30;
      return (
        <View
          key={`bold-prefix-${index}`}
          style={[
            { flexDirection: "row", alignItems: "flex-start", width: "100%" },
            spacingStyle,
          ]}
        >
          <View style={{ marginRight: 12, marginTop: 4 }}>
            <IconComp color={iconColor} size={iconSize} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                getReadMoreTextStyle(item.style, readMoreStyles),
                { textAlign: itemTextAlign, width: undefined },
              ]}
            >
              <Text
                style={{
                  fontWeight: "600",
                  fontFamily: fonts.primary.semiBold,
                }}
              >
                {item.prefix}{" "}
              </Text>
              {renderParsedContent(item.content)}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <Text
        key={`bold-prefix-${index}`}
        style={[
          getReadMoreTextStyle(item.style, readMoreStyles),
          spacingStyle,
          { textAlign: itemTextAlign },
        ]}
      >
        <Text style={{ fontWeight: "600", fontFamily: fonts.primary.semiBold }}>
          {item.prefix}{" "}
        </Text>
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

    let IconComp = null;
    if (item.icon === "MissedRamadanFastsPlatesIcon")
      IconComp = MissedRamadanFastsPlatesIcon;
    else if (item.icon === "QuranImageIcon") IconComp = QuranImageIcon;

    if (IconComp) {
      let iconColor =
        item.icon === "QuranImageIcon"
          ? Colors.light.green
          : Colors.light.dullWhite;
      let iconSize = 30;
      return (
        <View
          key={`bold-suffix-${index}`}
          style={[
            { flexDirection: "row", alignItems: "flex-start", width: "100%" },
            spacingStyle,
          ]}
        >
          <View style={{ marginRight: 12, marginTop: 4 }}>
            <IconComp color={iconColor} size={iconSize} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                getReadMoreTextStyle(item.style, readMoreStyles),
                { textAlign: itemTextAlign, width: undefined },
              ]}
            >
              {renderParsedContent(item.content)}{" "}
              <Text
                style={{
                  fontWeight: "600",
                  fontFamily: fonts.primary.semiBold,
                }}
              >
                {item.suffix}
              </Text>
            </Text>
          </View>
        </View>
      );
    }

    return (
      <Text
        key={`bold-suffix-${index}`}
        style={[
          getReadMoreTextStyle(item.style, readMoreStyles),
          spacingStyle,
          { textAlign: itemTextAlign },
        ]}
      >
        {renderParsedContent(item.content)}{" "}
        <Text style={{ fontWeight: "600", fontFamily: fonts.primary.semiBold }}>
          {item.suffix}
        </Text>
      </Text>
    );
  }

  if (item.type === "table") {
    const headers = item.headers || [];
    const rows = item.rows || [];
    return (
      <View
        key={`table-${index}`}
        style={[
          readMoreStyles.tableContainer,
          index > 0 ? readMoreStyles.blockSpacing : null,
        ]}
      >
        {/* Header Row */}
        <View style={readMoreStyles.tableHeaderRow}>
          {headers.map((header: string, hIdx: number) => {
            const parts = header.split("\n");
            return (
              <View
                key={`th-${hIdx}`}
                style={[
                  readMoreStyles.tableHeaderCell,
                  hIdx < headers.length - 1
                    ? readMoreStyles.borderRightWhite
                    : null,
                ]}
              >
                <Text style={readMoreStyles.tableHeaderText}>{parts[0]}</Text>
                {parts.length > 1 && (
                  <Text style={readMoreStyles.tableHeaderSubText}>
                    {parts[1]}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Data Rows */}
        {rows.map((row: string[], rIdx: number) => (
          <View
            key={`tr-${rIdx}`}
            style={[
              readMoreStyles.tableRow,
              rIdx < rows.length - 1 ? readMoreStyles.borderBottomWhite : null,
            ]}
          >
            {row.map((cell: string, cIdx: number) => (
              <View
                key={`td-${cIdx}`}
                style={[
                  readMoreStyles.tableCell,
                  cIdx < row.length - 1
                    ? readMoreStyles.borderRightWhite
                    : null,
                ]}
              >
                <Text
                  style={
                    cIdx === 0
                      ? readMoreStyles.tableCellTextWord
                      : readMoreStyles.tableCellTextCount
                  }
                >
                  {cell}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  }

  const usesQuoteSpacing =
    item.style === "quoteItalic" ||
    item.style === "quoteSemibold" ||
    item.style === "quoteMediumItalic" ||
    item.style === "hadithQuoteLead" ||
    item.style === "hadithQuoteLight" ||
    item.style === "bilalQuoteLight";

  let spacingStyle: any =
    index > 0
      ? usesQuoteSpacing
        ? readMoreStyles.quoteSpacing
        : readMoreStyles.blockSpacing
      : undefined;

  if (item.style === "bilalQuoteLight") {
    spacingStyle = { marginTop: -2 };
  }

  const itemTextAlign = item.align || textAlign;

  let IconComponent = null;
  if (item.type === "text" && item.icon === "FajarSunIcon")
    IconComponent = FajarSunIcon;
  else if (item.type === "text" && item.icon === "HadeethBookIcon")
    IconComponent = HadeethBookIcon;
  else if (item.type === "text" && item.icon === "DuhaPrayerStar")
    IconComponent = DuhaPrayerStar;
  else if (item.type === "text" && item.icon === "ManPrayerIcon")
    IconComponent = ManPrayerIcon;
  else if (item.type === "text" && item.icon === "QuranImageIcon")
    IconComponent = QuranImageIcon;
  else if (item.type === "text" && item.icon === "IstikharaClockIcon")
    IconComponent = IstikharaClockIcon;
  else if (item.type === "text" && item.icon === "ManDuaIcon")
    IconComponent = ManDuaIcon;
  else if (item.type === "text" && item.icon === "QuranListeningMoon")
    IconComponent = QuranListeningMoon;
  else if (item.type === "text" && item.icon === "QuranMemorizationIcon")
    IconComponent = QuranMemorizationIcon;
  else if (item.type === "text" && item.icon === "QuranTajweedIcon")
    IconComponent = QuranTajweedIcon;
  else if (item.type === "text" && item.icon === "MissedRamadanFastsHandsIcon")
    IconComponent = MissedRamadanFastsHandsIcon;
  else if (item.type === "text" && item.icon === "MissedRamadanFastsPlatesIcon")
    IconComponent = MissedRamadanFastsPlatesIcon;
  else if (
    item.type === "text" &&
    item.icon === "ProphetDawoodFastsConnectionWithAllah"
  )
    IconComponent = ProphetDawoodFastsConnectionWithAllah;
  else if (
    item.type === "text" &&
    item.icon === "ProphetDawoodFastsMoonAndHandIcon"
  )
    IconComponent = ProphetDawoodFastsMoonAndHandIcon;
  else if (item.type === "text" && item.icon === "ProphetDawoodFastsHeartIcon")
    IconComponent = ProphetDawoodFastsHeartIcon;
  else if (
    item.type === "text" &&
    item.icon === "ProphetDawoodMindfullnessIcon"
  )
    IconComponent = ProphetDawoodMindfullnessIcon;
  else if (item.type === "text" && item.icon === "ProphetDawoodGratitudeIcon")
    IconComponent = ProphetDawoodGratitudeIcon;
  else if (
    item.type === "text" &&
    item.icon === "ProphetDawoodMentalHealthIcon"
  )
    IconComponent = ProphetDawoodMentalHealthIcon;
  else if (item.type === "text" && item.icon === "ProphetDawoodHeartBreakIcon")
    IconComponent = ProphetDawoodHeartBreakIcon;
  else if (
    item.type === "text" &&
    item.icon === "ProphetDawoodPersonalDevelopmentIcon"
  )
    IconComponent = ProphetDawoodPersonalDevelopmentIcon;
  else if (item.type === "text" && item.icon === "ProphetDawoodBalanceIcon")
    IconComponent = ProphetDawoodBalanceIcon;
  else if (
    item.type === "text" &&
    item.icon === "MondayAndThursdayFastsHabitualIcon"
  )
    IconComponent = MondayAndThursdayFastsHabitualIcon;
  else if (
    item.type === "text" &&
    item.icon === "MondayAndThursdayAllahRememberenceIcon"
  )
    IconComponent = MondayAndThursdayAllahRememberenceIcon;
  else if (item.type === "text" && item.icon === "DashBoardHandHeartIcon")
    IconComponent = DashBoardHandHeartIcon;
  else if (
    item.style === "hadithQuoteLead" ||
    item.style === "bilalQuote" ||
    item.style === "quoteMediumItalic" ||
    item.style === "quoteItalic" ||
    item.style === "quoteSemibold"
  ) {
    IconComponent = HadeethBookIcon;
  }

  if (IconComponent) {
    let iconColor: string = Colors.light.dullWhite;
    let iconSize = 30;

    if (item.type === "text") {
      if (item.icon === "FajarSunIcon") {
        iconColor = Colors.light.dullWhite;
        iconSize = 28;
      } else if (item.icon === "DuhaPrayerStar") {
        iconColor = Colors.light.dullWhite;
        iconSize = 28;
      } else if (item.icon === "ManPrayerIcon") {
        iconColor = Colors.light.dullWhite;
        iconSize = 30;
      } else if (item.icon === "ManDuaIcon") {
        iconColor = Colors.light.dullWhite;
        iconSize = 30;
      } else if (item.icon === "QuranImageIcon") {
        iconColor = Colors.light.green;
        iconSize = 30;
      } else if (item.icon === "IstikharaClockIcon") {
        iconColor = Colors.light.dullWhite;
        iconSize = 30;
      } else if (item.icon === "QuranListeningMoon") {
        iconColor = Colors.light.dullWhite;
        iconSize = 30;
      } else if (item.icon === "QuranMemorizationIcon") {
        iconColor = Colors.light.dullWhite;
        iconSize = 30;
      } else if (item.icon === "QuranTajweedIcon") {
        iconColor = Colors.light.dullWhite;
        iconSize = 30;
      } else if (item.icon === "MissedRamadanFastsHandsIcon") {
        iconColor = Colors.light.dullWhite;
        iconSize = 30;
      } else if (item.icon === "MissedRamadanFastsPlatesIcon") {
        iconColor = Colors.light.dullWhite;
        iconSize = 30;
      } else if (item.icon === "ProphetDawoodFastsConnectionWithAllah") {
        iconColor = Colors.light.dullWhite;
        iconSize = 30;
      } else if (item.icon === "ProphetDawoodFastsMoonAndHandIcon") {
        iconColor = Colors.light.dullWhite;
        iconSize = 30;
      } else if (item.icon === "ProphetDawoodFastsHeartIcon") {
        iconColor = Colors.light.dullWhite;
        iconSize = 30;
      } else if (item.icon === "ProphetDawoodMindfullnessIcon") {
        iconColor = Colors.light.dullWhite;
        iconSize = 30;
      } else if (item.icon === "ProphetDawoodGratitudeIcon") {
        iconColor = Colors.light.dullWhite;
        iconSize = 30;
      } else if (item.icon === "ProphetDawoodMentalHealthIcon") {
        iconColor = Colors.light.dullWhite;
        iconSize = 30;
      } else if (item.icon === "ProphetDawoodHeartBreakIcon") {
        iconColor = Colors.light.dullWhite;
        iconSize = 30;
      } else if (item.icon === "ProphetDawoodPersonalDevelopmentIcon") {
        iconColor = Colors.light.dullWhite;
        iconSize = 30;
      } else if (item.icon === "ProphetDawoodBalanceIcon") {
        iconColor = Colors.light.dullWhite;
        iconSize = 30;
      } else if (item.icon === "MondayAndThursdayFastsHabitualIcon") {
        iconColor = Colors.light.dullWhite;
        iconSize = 30;
      } else if (item.icon === "MondayAndThursdayAllahRememberenceIcon") {
        iconColor = Colors.light.dullWhite;
        iconSize = 30;
      } else if (item.icon === "DashBoardHandHeartIcon") {
        iconColor = Colors.light.dullWhite;
        iconSize = 30;
      }
    }

    return (
      <View
        key={`text-${index}`}
        style={[
          { flexDirection: "row", alignItems: "flex-start", width: "100%" },
          spacingStyle,
        ]}
      >
        <View
          style={{
            marginRight: 12,
            marginTop: item.style === "bilalQuote" ? 14 : 4,
          }}
        >
          <IconComponent color={iconColor} size={iconSize} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              getReadMoreTextStyle(item.style, readMoreStyles),
              { textAlign: itemTextAlign, width: undefined },
            ]}
          >
            {renderParsedContent(item.content)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Text
      key={`text-${index}`}
      style={[
        getReadMoreTextStyle(item.style, readMoreStyles),
        spacingStyle,
        { textAlign: itemTextAlign },
      ]}
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
    <GoalDescriptionContent
      key={`read-more-container-${containerIndex}`}
      textAlign={textAlign}
    >
      {container.items.map((item, itemIndex) =>
        renderReadMoreItem(
          item,
          itemIndex,
          textAlign,
          readMoreStyles,
          itemIndex === 0,
        ),
      )}
    </GoalDescriptionContent>
  ));

export const GoalDescriptionDetails = ({ goal }: { goal: string }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const navigation = useNavigation();
  const readMoreStyles = createReadMoreStyles();
  const isPrayerGoal = isPrayerGoalKey(goal);
  const isQuranGoal = isQuranGoalKey(goal);
  const isFastingGoal = isFastingGoalKey(goal);
  const goalUiId = isFastingGoal
    ? resolveFastingUiId(goal)
    : isQuranGoal
      ? resolveQuranUiId(goal)
      : resolvePrayerUiId(goal);

  const { data: prayerDetail, isLoading: isLoadingPrayerDetail } =
    useGetPrayerDetailByType(goal, { enabled: isPrayerGoal });
  const { data: quranDetail, isLoading: isLoadingQuranDetail } =
    useGetQuranDetailByType(goal, { enabled: isQuranGoal });
  const { data: fastingDetail, isLoading: isLoadingFastingDetail } =
    useGetFastingDetailByType(goal, { enabled: isFastingGoal });

  const apiDetail = isFastingGoal
    ? fastingDetail
    : isQuranGoal
      ? quranDetail
      : prayerDetail;
  const isLoadingDetail = isFastingGoal
    ? isLoadingFastingDetail
    : isQuranGoal
      ? isLoadingQuranDetail
      : isLoadingPrayerDetail;

  const localGoalInfo = (t(`goalsData.${goalUiId}`, {
    returnObjects: true,
  }) || {}) as GoalInfo;

  const goalInfo: GoalInfo = {
    ...localGoalInfo,
    ...(apiDetail ?? {}),
    title: apiDetail?.title || localGoalInfo.title,
    navTitle: apiDetail?.navTitle || localGoalInfo.navTitle,
    heroTitle: apiDetail?.heroTitle || localGoalInfo.heroTitle,
    description: apiDetail?.description || localGoalInfo.description,
    hadithIntro: apiDetail?.hadithIntro || localGoalInfo.hadithIntro,
    benefitsIntro: apiDetail?.benefitsIntro || localGoalInfo.benefitsIntro,
    benefits:
      apiDetail?.benefits && apiDetail.benefits.length > 0
        ? apiDetail.benefits
        : localGoalInfo.benefits,
    steps:
      apiDetail?.steps && apiDetail.steps.length > 0
        ? apiDetail.steps
        : localGoalInfo.steps,
    readMore:
      apiDetail?.readMore && apiDetail.readMore.length > 0
        ? apiDetail.readMore
        : localGoalInfo.readMore,
  };

  const steps = goalInfo.steps || [];
  const readMore = goalInfo.readMore || [];
  const heroTitle = goalInfo.heroTitle || "";
  const navTitle = goalInfo.navTitle || "";
  const description = goalInfo.description || "";
  const textAlign = isRtl ? "right" : "left";

  const hasReadMoreContent = readMore.length > 0;

  const insets = useSafeAreaInsets();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const getImageSource = () => {
    if (goalUiId === "qiyamalLail") return qiyamallayldetailimage;
    if (goalUiId === "fiveDailyPrayers") return fivedailyprayerbottomsheetimage;
    if (goalUiId === "duhaPrayer") return duhaprayerdetailimage;
    if (goalUiId === "istikharah") return istikharaprayerdetailimage;
    if (goalUiId === "tawbaPrayer") return tawbahprayerdetailimage;
    if (goalUiId === "tahayyat-ul-wudhu") return tahiyyatwudhudetailimage;
    if (goalUiId === "thayyat-ul-masjid") return tahiyyatmasjiddetailimage;
    if (goalUiId === "sunnahRawatib") return sunnahrawatibdetailimage;
    if (goalUiId === "missedPastPrayers") return missedprayerdetailimage;
    if (goalUiId === "shukrPrayer") return shukarprayerdetailimage;
    if (goalUiId === "quran-listening") return quranlisteningbottomsheetimage;
    if (goalUiId === "quran-recitation") return quranrecitationbottomsheetimage;
    if (goalUiId === "quran-memorization")
      return quranmemorizationbottomsheetimage;
    if (goalUiId === "quran-tajweed") return qurantajweedbottomsheetimage;
    if (goalUiId === "missed-fasts") return missedramadanfastsbottomsheetimage;
    if (goalUiId === "dawood-fasts")
      return thefastsofprophetdawoodbottomsheetimage;
    if (goalUiId === "monday-and-thursday-fasts")
      return mondayandthursdayfastsbottomsheetimage;
    if (goalUiId === "white-days-fasts") return whitedaysfastsbottomsheetimage;
    return Icon;
  };

  const getImageHeight = () => {
    if (
      goalUiId === "qiyamalLail" ||
      goalUiId === "fiveDailyPrayers" ||
      goalUiId === "duhaPrayer" ||
      goalUiId === "istikharah" ||
      goalUiId === "tawbaPrayer" ||
      goalUiId === "tahayyat-ul-wudhu" ||
      goalUiId === "thayyat-ul-masjid" ||
      goalUiId === "sunnahRawatib" ||
      goalUiId === "missedPastPrayers" ||
      goalUiId === "shukrPrayer" ||
      goalUiId === "quran-listening" ||
      goalUiId === "quran-recitation" ||
      goalUiId === "quran-memorization" ||
      goalUiId === "quran-tajweed" ||
      goalUiId === "missed-fasts" ||
      goalUiId === "dawood-fasts" ||
      goalUiId === "monday-and-thursday-fasts" ||
      goalUiId === "white-days-fasts"
    ) {
      return 380;
    }
    return undefined;
  };

  const renderHeader = () => (
    <HeaderWithImageAndDescription
      heroTitle={isLoadingDetail ? "---" : heroTitle}
      navTitle={isLoadingDetail ? "---" : navTitle}
      description={
        isLoadingDetail
          ? "----------------------------------------------"
          : description
      }
      imageSource={getImageSource()}
      imageHeight={getImageHeight()}
      onBackPress={() => navigation.goBack()}
    />
  );

  const renderReadMoreContent = () => (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + 50 },
      ]}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      {renderHeader()}
      <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
        {renderReadMoreContainers(readMore, textAlign, readMoreStyles)}
      </View>
    </ScrollView>
  );

  if (hasReadMoreContent) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.light.blackBackground }}>
        {renderReadMoreContent()}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.blackBackground }}>
      <FlatList
        data={steps}
        keyExtractor={(item, index) => String(index)}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        ListHeaderComponent={renderHeader()}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16 }}>
            <GoalDescriptionContent
              lines={item.split("\n")}
              textAlign={textAlign}
            />
          </View>
        )}
      />
    </View>
  );
};
