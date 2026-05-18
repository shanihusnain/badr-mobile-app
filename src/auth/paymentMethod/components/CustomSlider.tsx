import React, { useRef } from "react";
import { ScrollView, Text, View } from "react-native";
import PrimaryButton from "../../../../components/atoms/Primary-button";
import { styles } from "../styles";

interface Slide {
  id: number;
  title: string;
  price: string;
  subtitle: string;
  description?: string;
  description1?: string;
  secondarySubtitle?: string;
  buttonText?: string;
  fulldescription?: string;
}

interface CustomSliderProps {
  slides: Slide[];
  activeSlide: number;
  slideWidth: number;
  onSlideChange: (index: number) => void;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  slides,
  activeSlide,
  slideWidth,
  onSlideChange,
}) => {
  const scrollRef = useRef<ScrollView>(null);

  return (
    <View style={styles.sliderWrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={slideWidth}
        decelerationRate="fast"
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / slideWidth,
          );
          onSlideChange(index);
        }}
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
            {slide.description ? (
              <Text style={styles.slideDescription}>
                <Text style={styles.descriptionBullet}>• </Text>
                {slide.description}
              </Text>
            ) : null}
            {slide.description1 ? (
              <Text style={styles.slideDescription1}>
                <Text style={styles.descriptionBullet}>• </Text>
                {slide.description1}
              </Text>
            ) : null}
            <PrimaryButton
              text={slide.buttonText ?? "GET BADR 3-MONTH PLAN"}
              onPress={() => {
                // Add action here if needed later
              }}
              style={styles.slideButton}
            />
            {slide.fulldescription ? (
              <Text style={styles.slideFullDescription}>
                {slide.fulldescription}
              </Text>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default CustomSlider;
