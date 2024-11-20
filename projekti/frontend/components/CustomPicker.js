import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Entypo";

const { width } = Dimensions.get("window");

/**
 * CustomPicker component renders a custom picker modal where users can select an item from a list.
 *
 * @component
 * @example
 * const items = [
 *   { label: 'Item 1', value: '1' },
 *   { label: 'Item 2', value: '2' },
 * ];
 *
 * const { isDarkMode } = useContext(DarkModeContext);
 * 
 * const [selectedValue, setSelectedValue] = useState("")
 *
 * <CustomPicker
 *   items={items}
 *   selectedValue={selectedValue}
 *   onSelect={(value) => setSelectedValue(value)}
 *   styles={[pickerStyles, isDarkMode ? darkPickerStyles : {}]}
 *   iconColor={isDarkMode ? "white" : "black"}
 * />
 *
 * const pickerStyles = StyleSheet.create({
 *   itemText: {
 *     color: "black", // make item text color black by default
 *   },
 * })
 * const darkPickerStyles = StyleSheet.create({
 *   itemText: {
 *     color: "white" // if dark mode make item text color white
 *   }
 * })
 *
 *
 * @param {Object[]} items - Array of items to display in the picker. Each item should have `label` and `value` properties.
 * @param {string} selectedValue - The value of the currently selected item. It should match the `value` of one of the items in the `items` array.
 * @param {function} onSelect - Callback function that is called when an item is selected. Receives the selected value as its argument.
 * @param {Object} [styles] - Optional styles for customizing the picker. It should be an array of `StyleSheet` objects. A single object can be passed, but must still be in an array. The following classes are available:
 *   - `item`: Style for each picker item (Touchable Opacity)
 *   - `itemText`: Style for the text inside each picker item
 *   - `button`: Style for the button that opens the picker (Touchable Opacity)
 *   - `buttonText`: Style for the text inside the picker opening button
 *   - `modalOverlay`: Style for the overlay behind the modal
 *   - `modalContent`: Style for the modal content
 *   - `flatList`: Style for the FlatList container
 * @param {string} iconColor - Color of the chevron-down icon in the picker button. Optional. Defaults to black if omitted. Should be a string (e.g. "#000" or "black")
 *
 * @returns {JSX.Element} - A picker component with a button to open the modal and select an item.
 */

const CustomPicker = ({
  items,
  selectedValue,
  onSelect,
  styles = [],
  iconColor = "black",
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState(
    selectedValue || (items && items[0]?.value)
  );

  useEffect(() => {
    if (!selectedValue && items.length > 0) {
      setSelected(items[0].value);
    }
  }, [selectedValue, items]);

  const selectedLabel = items.find((item) => item.value === selected)?.label;

  const handleSelect = (value) => {
    setSelected(value);
    onSelect(value);
    setModalVisible(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        defaultStyles.item,
        styles.map((item) => (item?.item ? item.item : {})),
      ]}
      onPress={() => handleSelect(item.value)}
    >
      <Text
        style={[
          defaultStyles.itemText,
          styles.map((item) => (item?.itemText ? item.itemText : {})),
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View>
      <TouchableOpacity
        style={[
          defaultStyles.button,
          styles.map((item) => (item?.button ? item.button : {})),
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            defaultStyles.buttonText,
            styles.map((item) => (item?.buttonText ? item.buttonText : {})),
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {selectedLabel || items[0]?.label}
        </Text>
        <Icon name="chevron-thin-down" size={20} color={iconColor} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={[
            defaultStyles.modalOverlay,
            styles.map((item) => (item?.modalOverlay ? item.modalOverlay : {})),
          ]}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[
              defaultStyles.modalContent,
              styles.map((item) =>
                item?.modalContent ? item.modalContent : {}
              ),
            ]}
          >
            <FlatList
              data={items}
              keyExtractor={(item) => item.value.toString()}
              renderItem={renderItem}
              style={[
                defaultStyles.flatList,
                styles.map((item) => (item?.flatList ? item.flatList : {})),
              ]}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const defaultStyles = StyleSheet.create({
  button: {
    width: width - 40,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: "#FFF",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "start",
    borderRadius: 32,
  },
  buttonText: {
    fontSize: 16,
    color: "black",
    maxWidth: "80%",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    maxHeight: "80%",
    width: width - 40,
    backgroundColor: "white",
    borderRadius: 24,
    overflow: "hidden",
  },
  item: {
    padding: 16,
  },
  itemText: {
    fontSize: 16,
    color: "black",
  },
});

export default CustomPicker;
