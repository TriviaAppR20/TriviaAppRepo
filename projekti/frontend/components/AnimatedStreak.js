import React, { useEffect, useRef, useContext } from 'react';
import { Text, Animated, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { DarkModeContext } from '../pages/DarkModeContext';

const AnimatedStreak = ({ streak, styles = [], iconColor = "orange" }) => {
  const scaleValue = useRef(new Animated.Value(1)).current; // For enlargement
  const shakeValue = useRef(new Animated.Value(0)).current; // For shaking

  const { isDarkMode } = useContext(DarkModeContext);

  useEffect(() => {
    if (streak >= 0) {
      // Trigger both scale and shake animations when streak changes
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: Math.min(1.4 + streak / 10, 2),
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: Math.min(1 + streak / 20, 1.5),
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(shakeValue, {
            toValue: 3,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeValue, {
            toValue: -3,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeValue, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [streak]);

  return (
    <Animated.View
      style={[
        defaultStyles.iconContainer,
        {
          transform: [
            { scale: scaleValue },
            { translateX: shakeValue },
            { translateY: shakeValue }
          ],
        },
      ]}
    >
      <Text style={[defaultStyles.streakText, {color: isDarkMode ? "white" : "black"}]}>🔥 {streak}</Text>
    </Animated.View>
  );
};

const defaultStyles = StyleSheet.create({
  iconContainer: {
    display:"flex",
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 36
  },
  streakText: {
    fontSize: 16,
    marginTop: 5,
  },
});

export default AnimatedStreak;