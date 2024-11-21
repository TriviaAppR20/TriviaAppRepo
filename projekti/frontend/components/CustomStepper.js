import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Keyboard,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Entypo";


/**
 * 
 * @param {number} initialValue - The initial value on mount / reload of the stepper. Optional
 * @param {number} minValue - Minimum value that the stepper is allowed to go to. Optional
 * @param {number} maxValue - Maximum value that the stepper is allowed to go to. Optional
 * @param {function} onChange - Callback function to get updated value of the stepper in the parent component
 * @param {Object} [styles] - Array of style objects. Rightmost takes precedence. Optional. Can contain all or some of the following:
 *      - `container`: the view which wraps the input and buttons.
 *      - `button`: the Touchable Opacity of both the increment and decrement buttons.
 *      - `input`: the central TextInput element.
 * @param {string} iconColor - A string value for the color of both the increment and decrement icons (e.g. "#FFF", "black")
 * */

const CustomStepper = ({
  initialValue = 20,
  minValue = 5,
  maxValue = 50,
  onChange,
  styles = [],
  iconColor = "black",
}) => {
  const [value, setValue] = useState(initialValue.toString());

  // Helper function to clamp the value between min and max
  const clampValue = (val) => {
    const numericValue = parseInt(val, 10);
    if (isNaN(numericValue)) {
      return minValue.toString();
    }
    if (numericValue < minValue) return minValue.toString();
    if (numericValue > maxValue) return maxValue.toString();
    return numericValue.toString();
  };

  // Handler for the decrement button
  const handleDecrement = () => {
    let newValue = parseInt(value, 10) - 1;
    newValue = newValue < minValue ? minValue : newValue;
    setValue(newValue.toString());
    onChange && onChange(newValue);
  };

  // Handler for the increment button
  const handleIncrement = () => {
    let newValue = parseInt(value, 10) + 1;
    newValue = newValue > maxValue ? maxValue : newValue;
    setValue(newValue.toString());
    onChange && onChange(newValue);
  };

  // Handler for text input changes
  const handleChange = (text) => {
    // Allow only numbers
    const numericText = text.replace(/[^0-9]/g, "");
    setValue(numericText);
  };

  // Handler for when text input editing ends
  const handleEndEditing = () => {
    const clamped = clampValue(value);
    setValue(clamped);
    onChange && onChange(parseInt(clamped, 10));
  };

  return (
    <View
      style={[
        defaultStyles.container,
        styles.map((item) => (item?.container ? item.container : {})),
      ]}
    >

      <TouchableOpacity
        style={[
          defaultStyles.button,
          styles.map((item) => (item?.button ? item.button : {})),
        ]}
        onPress={handleDecrement}
      >
        <Icon name="minus" color={iconColor} size={24} />
      </TouchableOpacity>

      <TextInput
        style={[
          defaultStyles.input,
          styles.map((item) => (item?.input ? item.input : {})),
        ]}
        value={value}
        onChangeText={handleChange}
        onEndEditing={handleEndEditing}
        keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
        returnKeyType="done"
        onBlur={Keyboard.dismiss}
        textAlign="center"
      />

      <TouchableOpacity
        style={[
          defaultStyles.button,
          styles.map((item) => (item?.button ? item.button : {})),
        ]}
        onPress={handleIncrement}
      >
        <Icon name="plus" color={iconColor} size={24} />
      </TouchableOpacity>

    </View>
  );
};

export default CustomStepper;

const defaultStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    width: 60,
    marginHorizontal: 10,
    borderRadius: 16,
    paddingHorizontal: 10,
    fontSize: 18,
  },
});
