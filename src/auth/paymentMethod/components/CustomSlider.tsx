import React, { useRef } from "react";
import { ScrollView, Text, View, useWindowDimensions } from "react-native";
import PrimaryButton from "../../../../components/atoms/Primary-button";
import { styles } from "../styles";

interface Slide {
  id: number;
  title: string;
  price: string;
  subtitle: string;
  secondarySubtitle?: string;
  buttonText?: string;
}

interface CustomSliderProps {
  slides: Slide[];
  activeSlide: number;
  onSlideChange: (event: any) => void;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  slides,
  activeSlide,
  onSlideChange,
}) => {
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const slideWidth = Math.min(width - 60, 296);

  return (
    <View style={styles.sliderWrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onSlideChange}
        contentContainerStyle={styles.sliderContent}
      >
        {slides.map((slide) => (
          <View
            key={slide.id}
            style={[styles.slideCard, { width: slideWidth }]}
          >
            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
            {slide.secondarySubtitle ? (
              <Text style={styles.secondarySubtitle}>
                {slide.secondarySubtitle}
              </Text>
            ) : null}
            <Text style={styles.slidePrice}>{slide.price}</Text>
            <PrimaryButton
              text={slide.buttonText ?? "GET BADR 3-MONTH PLAN"}
              onPress={() => {
                // Add action here if needed later
              }}
              style={styles.slideButton}
            />
          </View>
        ))}
      </ScrollView>
      <View style={styles.paginationContainer}>
        {slides.map((slide) => (
          <View
            key={slide.id}
            style={
              activeSlide === slide.id
                ? [styles.paginationDot, styles.activeDot]
                : styles.paginationDot
            }
          />
        ))}
      </View>
    </View>
  );
};

export default CustomSlider;
