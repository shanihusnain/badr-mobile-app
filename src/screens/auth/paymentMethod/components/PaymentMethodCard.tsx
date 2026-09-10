import React from "react";
import {
    StyleProp,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import { styles } from "../styles";

interface PaymentMethodCardProps {
  title: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  title,
  onPress,
  style,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.cardContainer, style]}
      {...(onPress ? { onPress, activeOpacity: 0.8 } : {})}
    >
      <Text style={styles.cardText}>{title}</Text>
    </Container>
  );
};

export default PaymentMethodCard;
