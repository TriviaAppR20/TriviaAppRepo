import React, { useState, useCallback, useContext, useEffect } from "react";
import { View, Text, Button, ScrollView, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import CustomPicker from "../components/CustomPicker";
import { DarkModeContext } from "./DarkModeContext";
import { TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import FAIcon from "react-native-vector-icons/FontAwesome5";
import { db } from "../../backend/firebase/firebase";
import { 
  getAuth, 
  onAuthStateChanged, 
  updateProfile, 
  signInWithCredential, 
  signOut, 
  signInAnonymously
} from "firebase/auth";
import { collection, query, where, getDoc, addDoc, setDoc, doc, onSnapshot } from 'firebase/firestore';
import performanceService from "../components/PerformanceService";

const Statistics = ({userId}) => {
  const [stats, setStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isClearStats, setIsClearStats] = useState(false);
  const [globalQuestions, setGlobalQuestions] = useState([]);

  const [multiplayerStats, setMultiplayerStats] = useState(null)
  const [user, setUser] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const { isDarkMode } = useContext(DarkModeContext);
  const textColor = isDarkMode ? "white" : "black";

  const docRef = doc(db, "singleData", "globalData");

  const auth = getAuth();

  const loadStats = async (user, isAnonymous) => {
    try {
      const statsString = await AsyncStorage.getItem("SP_STATS");
      const statsDoc = await getDoc(docRef);
      setGlobalQuestions([
        statsDoc.data().totalQuestions,
        statsDoc.data().correctAnswers,
        statsDoc.data().wrongAnswers,
      ]);
      if (statsString) {
        setStats(JSON.parse(statsString));
      } else {
        setStats(null);
      }
      if (!isAnonymous) {
        performanceService.setUserId(user);
        await performanceService.loadStats(user);
        setMultiplayerStats(performanceService.getStats());
      }

    } catch (error) {
      console.error("Error loading statistics:", error);
      setStats(null);
    }
  

  };


  //handles the auth state change
//aka checks if the user is logged in or not
const handleAuthStateChange = async = () => {
  const auth = getAuth();
  const unsubscribe = onAuthStateChanged(auth, async (currentUser)=> {
   if (currentUser && !currentUser.isAnonymous) {
       setUser(currentUser);
       setIsAnonymous(false);
       await loadStats(currentUser.uid, currentUser.isAnonymous);
   } else {
     setUser(currentUser);
     setIsAnonymous(true);
     setMultiplayerStats(null)
     await loadStats(currentUser.uid, currentUser.isAnonymous);
   }
  })
  return unsubscribe;
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

  //calls to handleAuthStateChane first, then calls loadStats
  // so that the user is loaded before the stats are loaded
  useFocusEffect(
    useCallback(() => {
      const unsubscribe = handleAuthStateChange();
      return () => unsubscribe();
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
        <Text
          style={[
            styles.clearConfText,
            { marginBottom: 16 },
            isDarkMode ? dark.buttonText : {},
          ]}
        >
          Are you sure you want to clear all your personal stats?
        </Text>
        <Text
          style={[
            styles.clearConfText,
            { fontSize: 16 },
            isDarkMode ? dark.buttonText : {},
          ]}
        >
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
            <Icon
              name="arrow-back"
              size={20}
              color={textColor}
              style={{ alignSelf: "center" }}
            ></Icon>
            <Text
              style={[styles.buttonText, isDarkMode ? dark.buttonText : {}]}
            >
              Back
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.clearConfBtn, isDarkMode ? dark.clearConfBtn : {}]}
            onPress={() => clearStats()}
          >
            <Icon
              name="trash"
              size={20}
              color={textColor}
              style={{ alignSelf: "center" }}
            ></Icon>
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
        iconColor={textColor}
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
            Your Statistics
          </Text>
          <Text
            style={[styles.summaryText, isDarkMode ? dark.summaryText : {}]}
          >
            Total: {totalGuesses} -{" "}
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
      <View style={styles.globalStatsView}>
        <Text
          style={[styles.categoryTitle, isDarkMode ? dark.categoryTitle : {}]}
        >
          Global Statistics
        </Text>
        <Text style={[styles.summaryText, isDarkMode ? dark.summaryText : {}]}>
          Total: {globalQuestions[0]} -{" "}
          <Text style={[styles.correct, isDarkMode ? dark.correct : {}]}>
            {globalQuestions[1]}
          </Text>{" "}
          -{" "}
          <Text style={[styles.incorrect, isDarkMode ? dark.incorrect : {}]}>
            {globalQuestions[2]}
          </Text>
        </Text>
        <Text style={[styles.summaryText, isDarkMode ? dark.summaryText : {}]}>
          Percentage:{" "}
          <Text style={[styles.correct, isDarkMode ? dark.correct : {}]}>
            {Math.round((globalQuestions[1] / globalQuestions[0]) * 100)}%
          </Text>{" "}
          -{" "}
          <Text style={[styles.incorrect, isDarkMode ? dark.incorrect : {}]}>
            {Math.round((globalQuestions[2] / globalQuestions[0]) * 100)}%
          </Text>
        </Text>
      </View>
      <View style={styles.globalStatsView}>
        <Text
        style={[styles.categoryTitle, isDarkMode ? dark.categoryTitle : {}]}
        >
          Multiplayer statistics
        </Text>
        {multiplayerStats ? (
          <>
           <Text style={[styles.summaryText, isDarkMode ? dark.summaryText : {}]}>
            Total answers: {multiplayerStats.totalAnswers}
           </Text>
           <Text style={[styles.summaryText, isDarkMode ? dark.summaryText : {}]}>
            Correct answers: {multiplayerStats.correctAnswers}
           </Text>
           <Text style={[styles.summaryText, isDarkMode ? dark.summaryText : {}]}>
            Correct percentage: {multiplayerStats.correctPercentage.toFixed(2)}%
           </Text>
           <Text style={[styles.summaryText, isDarkMode ? dark.summaryText : {}]}>
            Games won: {multiplayerStats.gamesWon}
           </Text>
          </>
        ): (
          <Text style={[styles.summaryText, isDarkMode ? dark.summaryText : {}]}>
            Please log in to view multiplayer stats...
          </Text>
        )}
      </View>
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
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  globalStatsView: {
    marginTop: 24,
    borderTopWidth: 1,
    borderColor: "#ffd6b3",
    paddingTop: 20,
  },
  globalStatsText: {
    color: "white",
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
