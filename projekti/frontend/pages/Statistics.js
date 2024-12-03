import React, { useState, useCallback, useContext, useEffect } from "react";
import { View, Text, Button, ScrollView, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import CustomPicker from "../components/CustomPicker";
import { DarkModeContext } from "./DarkModeContext";
import { TouchableOpacity } from "react-native";

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isClearStats, setIsClearStats] = useState(false);

  const { isDarkMode } = useContext(DarkModeContext);

  const loadStats = async () => {
    try {
      const statsString = await AsyncStorage.getItem("SP_STATS");
      if (statsString) {
        setStats(JSON.parse(statsString));
      } else {
        setStats(null);
      }
    } catch (error) {
      console.error("Error loading statistics:", error);
      setStats(null);
    }
  };

  const clearStats = async () => {
    try {
      await AsyncStorage.removeItem("SP_STATS");
      setStats(null);
      alert("All stats have been deleted.");
    } catch (error) {
      console.error("Error deleting stats:", error);
      alert("Failed to delete stats.");
    }
  };

  const calculateTotalStats = () => {
    if (!stats) return { totalCorrect: 0, totalIncorrect: 0, totalGuesses: 0 };

    let totalCorrect = 0;
    let totalIncorrect = 0;

    Object.values(stats).forEach((categoryStats) => {
      Object.values(categoryStats).forEach(({ correct, incorrect }) => {
        totalCorrect += correct;
        totalIncorrect += incorrect;
      });
    });

    return {
      totalCorrect,
      totalIncorrect,
      totalGuesses: totalCorrect + totalIncorrect,
    };
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  if (!stats) {
    return (
      <View style={[styles.container, isDarkMode ? dark.container : {}]}>
        <Text style={[styles.message, isDarkMode ? dark.message : {}]}>
          No statistics available.
        </Text>
      </View>
    );
  }

  if (isClearStats) {
    return (
      <View style={[styles.container, isDarkMode ? dark.container : {}]}>
        <Text style={[styles.clearConfText, {marginBottom: 16}, isDarkMode ? dark.buttonText : {}]}>
          Are you sure you want to clear all your personal stats?
        </Text>
        <Text style={[styles.clearConfText, {fontSize:16}, isDarkMode ? dark.buttonText : {}]}>
          This only applies to your stats locally.
        </Text>
        <View style={styles.clearConfBtnView}>
          <TouchableOpacity
            style={[
              styles.clearConfBtn,
              { borderColor: "#ffd6b3" },
              isDarkMode ? dark.clearConfBtn : {},
            ]}
            onPress={() => setIsClearStats(false)}
          >
            <Text
              style={[styles.buttonText, isDarkMode ? dark.buttonText : {}]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.clearConfBtn, isDarkMode ? dark.clearConfBtn : {}]}
            onPress={() => clearStats()}
          >
            <Text
              style={[styles.buttonText, isDarkMode ? dark.buttonText : {}]}
            >
              Clear
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const categoryItems = [
    { label: "All", value: "All" },
    ...Object.keys(stats).map((category) => ({
      label: category,
      value: category,
    })),
  ];

  const { totalCorrect, totalIncorrect, totalGuesses } = calculateTotalStats();
  const filteredStats =
    selectedCategory === "All"
      ? null // Indicating we should display total stats
      : { [selectedCategory]: stats[selectedCategory] };

  return (
    <ScrollView style={[styles.scrollView, isDarkMode ? dark.scrollView : {}]}>
      <CustomPicker
        items={categoryItems}
        selectedValue={selectedCategory}
        onSelect={setSelectedCategory}
        styles={[pickerStyles, isDarkMode ? darkPickerStyles : {}]}
        iconColor={isDarkMode ? "white" : "black"}
      />
      {selectedCategory === "All" ? (
        <View
          style={[
            styles.categoryContainer,
            isDarkMode ? dark.categoryContainer : {},
          ]}
        >
          <Text
            style={[styles.categoryTitle, isDarkMode ? dark.categoryTitle : {}]}
          >
            Total Statistics
          </Text>
          <Text
            style={[styles.summaryText, isDarkMode ? dark.summaryText : {}]}
          >
            Total Guesses: {totalGuesses} -{" "}
            <Text style={[styles.correct, isDarkMode ? dark.correct : {}]}>
              {totalCorrect}
            </Text>{" "}
            -{" "}
            <Text style={[styles.incorrect, isDarkMode ? dark.incorrect : {}]}>
              {totalIncorrect}
            </Text>
          </Text>
        </View>
      ) : (
        Object.keys(filteredStats).map((category) => {
          const categoryStats = filteredStats[category];

          const totalCategoryCorrect = Object.values(categoryStats).reduce(
            (sum, { correct }) => sum + correct,
            0
          );
          const totalCategoryIncorrect = Object.values(categoryStats).reduce(
            (sum, { incorrect }) => sum + incorrect,
            0
          );
          const totalCategoryGuesses =
            totalCategoryCorrect + totalCategoryIncorrect;

          return (
            <View
              key={category}
              style={[
                styles.categoryContainer,
                isDarkMode ? dark.categoryContainer : {},
              ]}
            >
              <Text
                style={[
                  styles.categoryTitle,
                  isDarkMode ? dark.categoryTitle : {},
                ]}
              >
                {category}
              </Text>
              <Text
                style={[styles.summaryText, isDarkMode ? dark.summaryText : {}]}
              >
                Total: {totalCategoryGuesses} -{" "}
                <Text style={[styles.correct, isDarkMode ? dark.correct : {}]}>
                  {totalCategoryCorrect}
                </Text>{" "}
                -{" "}
                <Text
                  style={[styles.incorrect, isDarkMode ? dark.incorrect : {}]}
                >
                  {totalCategoryIncorrect}
                </Text>
              </Text>
              {Object.keys(categoryStats).map((difficulty) => {
                const { correct, incorrect } = categoryStats[difficulty];
                const totalDifficultyGuesses = correct + incorrect;

                if (totalDifficultyGuesses === 0) return null;

                return (
                  <Text
                    key={difficulty}
                    style={[
                      styles.difficultyText,
                      isDarkMode ? dark.difficultyText : {},
                    ]}
                  >
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}:{" "}
                    <Text
                      style={[styles.correct, isDarkMode ? dark.correct : {}]}
                    >
                      {correct}
                    </Text>{" "}
                    -{" "}
                    <Text
                      style={[
                        styles.incorrect,
                        isDarkMode ? dark.incorrect : {},
                      ]}
                    >
                      {incorrect}
                    </Text>
                  </Text>
                );
              })}
            </View>
          );
        })
      )}
      <TouchableOpacity
        style={[styles.button, isDarkMode ? dark.button : {}]}
        onPress={() => setIsClearStats(true)}
      >
        <Text style={[styles.buttonText, isDarkMode ? dark.buttonText : {}]}>
          Reset personal stats
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#EDEDED",
  },
  message: {
    fontSize: 18,
    color: "#666",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#EDEDED",
    paddingHorizontal: 15,
    paddingVertical: 32,
  },
  categoryContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 10,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  difficultyText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 10,
    marginBottom: 5,
  },
  correct: {
    color: "green",
    fontWeight: "bold",
  },
  incorrect: {
    color: "red",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f87609",
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: "60%",
    textAlign: "center",
  },
  buttonText: {
    textAlign: "center",
    color: "#000",
  },
  clearConfText: {
    fontSize: 24,
    color: "#000",
    marginBottom: 36,
    textAlign: "center",
  },
  clearConfBtnView: {
    display: "flex",
    flexDirection: "row",
    gap: 16,
  },
  clearConfBtn: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 32,
    borderColor: "#f87609",
    backgroundColor: "#FFF",
    marginBottom: 24,
    width: "40%",
  },
});

const dark = StyleSheet.create({
  container: {
    backgroundColor: "#121212",
  },
  message: {
    fontSize: 18,
    color: "#FFF",
  },
  scrollView: {
    backgroundColor: "#121212",
  },
  categoryContainer: {
    borderBottomColor: "#555",
  },
  categoryTitle: {
    color: "#FFF",
  },
  summaryText: {
    color: "#FFF",
  },
  difficultyText: {
    color: "#BBB",
  },
  correct: {
    color: "#90EE90",
  },
  incorrect: {
    color: "#FF7F7F",
  },
  button: {
    backgroundColor: "#000",
  },
  buttonText: {
    color: "#FFF",
  },
  clearConfText: {
    color: "#FFF",
  },
  clearConfBtn: {
    backgroundColor: "#000",
    marginBottom: 24,
    width: "40%",
  },
});

/*
item: Style for each picker item (Touchable Opacity)
itemText: Style for the text inside each picker item
button: Style for the button that opens the picker (Touchable Opacity)
buttonText: Style for the text inside the picker opening button
modalOverlay: Style for the overlay behind the modal
modalContent: Style for the modal content
flatList
*/

const pickerStyles = {
  itemText: {
    color: "black",
  },
  buttonText: {
    fontSize: 16,
    color: "black",
  },
  button: {
    marginBottom: 16,
  },
};

const darkPickerStyles = {
  modalContent: {
    backgroundColor: "#000",
  },
  itemText: {
    color: "white",
  },
  button: {
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "#f87609",
  },
  buttonText: {
    color: "white",
  },
};

export default Statistics;
