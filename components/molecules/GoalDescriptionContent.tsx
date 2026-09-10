import React, { ReactNode } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export type GoalDescriptionListItem = {
  heading?: string;
  description: string;
};

type GoalDescriptionContentProps = {
  /** Optional lead-in line above list items or body */
  intro?: string;
  /** Heading + description pairs (e.g. benefit bullets) */
  items?: GoalDescriptionListItem[];
  /** Single paragraph when there are no structured items */
  body?: string;
  /** Raw lines (e.g. step strings split by newline) */
  lines?: string[];
  /** Custom content inside the wrapper */
  children?: ReactNode;
  textAlign?: "left" | "right" | "center";
  style?: ViewStyle;
};

export default function GoalDescriptionContent({
  intro,
  items,
  body,
  lines,
  children,
  textAlign = "left",
  style,
}: GoalDescriptionContentProps) {
  const hasStructuredContent =
    Boolean(intro) ||
    Boolean(body) ||
    Boolean(lines?.length) ||
    Boolean(items?.length) ||
    Boolean(children);

  if (!hasStructuredContent) {
    return null;
  }

  return (
    <View style={[styles.wrapper, style]}>
      {intro ? (
        <Text style={[styles.intro, { textAlign }]}>{intro}</Text>
      ) : null}

      {items?.map((item, index) => (
        <View
          key={item.heading ?? `item-${index}`}
          style={[styles.listItem, index < items.length - 1 && styles.listItemSpacing]}
        >
          {item.heading ? (
            <Text style={[styles.itemHeading, { textAlign }]}>{item.heading}</Text>
          ) : null}
          <Text style={[styles.itemDescription, { textAlign }]}>{item.description}</Text>
        </View>
      ))}

      {body ? <Text style={[styles.body, { textAlign }]}>{body}</Text> : null}

      {lines?.map((line, index) => (
        <Text
          key={`line-${index}`}
          style={[
            styles.body,
            { textAlign },
            line.trim() === "" && styles.emptyLine,
          ]}
        >
          {line}
        </Text>
      ))}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 16,
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "flex-start",
    width: "100%",
  },
  intro: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    lineHeight: 22,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  listItem: {
    alignSelf: "flex-start",
    width: "100%",
  },
  listItemSpacing: {
    marginBottom: 12,
  },
  itemHeading: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    lineHeight: 22,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  itemDescription: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    lineHeight: 22,
    alignSelf: "flex-start",
  },
  body: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    lineHeight: 22,
    alignSelf: "flex-start",
  },
  emptyLine: {
    marginBottom: 0,
  },
});
