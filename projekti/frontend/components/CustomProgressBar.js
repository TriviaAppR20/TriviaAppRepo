import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const CustomProgressBar = ({ totalTime, trigger }) => {
  const animationValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger === true || trigger === false) {
      animationValue.setValue(0); // Reset animation value
      Animated.timing(animationValue, {
        toValue: 1, // End value
        duration: totalTime, // Animation duration
        useNativeDriver: false, // Set false because width animation doesn't support native driver
      }).start();
    }
  }, [trigger]); // Re-run animation whenever `trigger` changes

  const widthInterpolation = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'], // Map progress to width percentage
  });

  return (
    <View style={styles.progressBarContainer}>
      <Animated.View
        style={[styles.progressBar, { width: widthInterpolation }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  progressBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#000',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#f87609',
  },
});

export default CustomProgressBar;
