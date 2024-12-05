import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const AnimatedFeedback = ({ showFeedback, isCorrect }) => {
  const scaleValue = useRef(new Animated.Value(1)).current; // For scaling the checkmark
  const rotationValue = useRef(new Animated.Value(0)).current; // For shaking the "x"

  useEffect(() => {
    if (showFeedback) {
      if (isCorrect) {
        // Scale animation for the checkmark
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.4, // Scale up
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1, // Scale down
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        // Shake animation for the "x"
        Animated.sequence([
          Animated.timing(rotationValue, {
            toValue: 1, // Rotate slightly clockwise
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(rotationValue, {
            toValue: -1, // Rotate slightly counter-clockwise
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(rotationValue, {
            toValue: 0, // Return to original position
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [showFeedback, isCorrect]);

  const animatedStyle = isCorrect
    ? { transform: [{ scale: scaleValue }] } // Apply scale animation for checkmark
    : { transform: [{ rotate: rotationValue.interpolate({ // Apply rotational shake for "x"
        inputRange: [-1, 1],
        outputRange: ['-10deg', '10deg'],
      }) }] };

  return (
    <View style={styles.container}>
      {showFeedback && (
        <Animated.View style={animatedStyle}>
          <Icon
            name={isCorrect ? 'checkmark' : 'close'}
            color={isCorrect ? 'green' : 'red'}
            size={28}
            style={styles.icon}
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 0,
    padding: 24,
  },
})

export default AnimatedFeedback;