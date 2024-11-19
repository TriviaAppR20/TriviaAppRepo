import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
} from "react-native";
import Slider from "@react-native-community/slider";
import CustomPicker from "../components/CustomPicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DarkModeContext } from "./DarkModeContext";
import { StatusBar } from "react-native";

export default function GenerateQuizScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [amountOfQuestions, setAmountOfQuestions] = useState(10);
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [type, setType] = useState("");
  const [apiSessionToken, setApiSessionToken] = useState("");
  const [isTokenEmpty, setIsTokenEmpty] = useState(false);

  const { isDarkMode } = useContext(DarkModeContext);

  const fetchCategories = async () => {
    try {
      const response = await fetch("https://opentdb.com/api_category.php");
      const data = await response.json();
      setCategories(data.trivia_categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetches a new API session token and returns it
  const fetchApiSessionToken = async () => {
    try {
      const response = await fetch(
        "https://opentdb.com/api_token.php?command=request"
      );
      const data = await response.json();
      if (data.response_code === 0) {
        return data.token;
      } else {
        console.error(
          `Error fetching token: ${data.response_message}. Error code: ${data.response_code}`
        );
        Alert.alert(
          `Error fetching token: ${data.response_message}. Error code: ${data.response_code}`
        );
      }
    } catch (err) {
      console.error(`Unexpected error: ${err}`);
      Alert.alert(`Unexpected error: ${err}`);
    }
  };

  // Requests the api to reset the current API session token
  const resetApiSessionToken = async () => {
    try {
      const response = await fetch(
        `https://opentdb.com/api_token.php?command=reset&token=${apiSessionToken}`
      );
      const data = await response.json();
      if (data.response_code === 0) {
        Alert.alert("Reset successful!");
        hideTokenEmpty();
      } else {
        Alert.alert("Error. Something went wrong while resetting the token");
      }
    } catch (err) {
      console.error(`Error resetting token: ${err}`);
    }
  };

  const getApiSessionToken = async () => {
    try {
      // Get existing token from async storage and make a test query to the api with it
      const existingToken = await AsyncStorage.getItem("API-Token");
      const response = await fetch(
        `https://opentdb.com/api.php?amount=5&token=${existingToken}`
      );
      const data = await response.json();
      // If there was an existing token in async storage and the API doesn't return code 3 (token does not exist)
      if (existingToken !== null && data.response_code !== 3) {
        // Then we set the state variable to the existing token
        setApiSessionToken(existingToken);
      } else {
        // Else we request a new token from the API and save that in state as well as async storage
        const token = await fetchApiSessionToken();
        await AsyncStorage.setItem("API-Token", token);
        setApiSessionToken(token);
      }
    } catch (err) {
      console.error(`Unexpected error: ${err}`);
      Alert.alert(`Unexpected error: ${err}`);
    }
  };

  const generateQueryUrl = () => {
    const apiUrl = "https://opentdb.com/api.php";
    const queryParams = [`amount=${amountOfQuestions}`];

    if (category) queryParams.push(`category=${category}`);
    if (difficulty) queryParams.push(`difficulty=${difficulty}`);
    if (type) queryParams.push(`type=${type}`);
    if (apiSessionToken) queryParams.push(`token=${apiSessionToken}`);

    const queryUrl = `${apiUrl}?${queryParams.join("&")}`;
    return queryUrl;
  };

  const fetchQuestions = async () => {
    try {
      const url = generateQueryUrl();
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching questions", error);
    }
  };

  const generateQuiz = async () => {
    try {
      const data = await fetchQuestions();
      if (data.response_code === 0) {
        navigation.navigate("Game", { questions: data.results });
      } 
      else if (data.response_code === 4) {
        showTokenEmpty();
      }
      else {
        let errorMessage = "";

        switch (data.response_code) {
          case 1:
            errorMessage =
              "No Results: Could not return results. The API doesn't have enough questions for your query (e.g., asking for 50 questions in a category that only has 20).";
            break;
          case 2:
            errorMessage =
              "Invalid Parameter: Contains an invalid parameter. Arguments passed aren't valid (e.g., Amount = 'Five' instead of a number).";
            break;
          case 3:
            errorMessage = "Token Not Found: Session Token does not exist.";
            break;
          case 5:
            errorMessage =
              "Rate Limit Exceeded: Too many requests. Each IP can only access the API once every 5 seconds.";
            break;
          default:
            errorMessage = "An unknown error occurred.";
        }
        Alert.alert("Error", errorMessage, [{ text: "OK" }]);
      }
    } catch (err) {
      console.error(`An error occured: ${err}`);
    }
  };

  useEffect(() => {
    fetchCategories();
    getApiSessionToken();
  }, []);

  const showTokenEmpty = () => {
    setIsTokenEmpty(true);
    StatusBar.setBackgroundColor(isDarkMode ? "#000" : "rgba(0,0,0,0.7)");
  };
  const hideTokenEmpty = () => {
    setIsTokenEmpty(false);
    StatusBar.setBackgroundColor(isDarkMode ? "#000" : "#FFF");
  };

  return (
    <View style={[styles.page, isDarkMode && dark.page]}>
      <Modal
        visible={isTokenEmpty}
        transparent={true}
        onRequestClose={hideTokenEmpty}
      >
        <View style={styles.modalFull}>
          <View style={[styles.modalContainer, { height: "40%" }]}>
            <Text style={{ fontSize: 16, marginBottom: 8 }}>
              The app has ran out of new questions to ask you with these
              specific options. Would you like to reset your token?
            </Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetApiSessionToken}
            >
              <Text style={{ color: "#FFF" }}>RESET</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeInfoButton}
              onPress={hideTokenEmpty}
            >
              <Text style={{ color: "#FFF" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={[styles.genericLabel, isDarkMode && dark.genericLabel]}>
        Number of questions
      </Text>
      <View style={styles.sliderContainer}>
        <Text style={[styles.sliderLabel, isDarkMode && dark.sliderLabel]}>
          {amountOfQuestions}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={5}
          maximumValue={50}
          step={1}
          value={amountOfQuestions}
          onSlidingComplete={(value) => setAmountOfQuestions(value)}
          minimumTrackTintColor={"#f87609"}
          maximumTrackTintColor={"#f87609"}
          thumbTintColor={"#f87609"}
        />
      </View>

      <Text style={[styles.genericLabel, isDarkMode && dark.genericLabel]}>
        Category
      </Text>
      <CustomPicker
        items={[
          { label: "Any category", value: "" },
          ...categories.map((cat) => ({
            label: cat.name,
            value: cat.id,
          })),
        ]}
        selectedValue={category}
        onSelect={(value) => setCategory(value)}
        styles={[pickerStyles, isDarkMode ? darkPickerStyles : {}]}
        iconColor={isDarkMode ? "white" : "black"}
      />

      <Text style={[styles.genericLabel, isDarkMode && dark.genericLabel]}>
        Difficulty
      </Text>
      <CustomPicker
        items={[
          { label: "Any difficulty", value: "" },
          { label: "Easy", value: "easy" },
          { label: "Medium", value: "medium" },
          { label: "Hard", value: "hard" },
        ]}
        selectedValue={difficulty}
        onSelect={(value) => setDifficulty(value)}
        styles={[pickerStyles, isDarkMode ? darkPickerStyles : {}]}
        iconColor={isDarkMode ? "white" : "black"}
      />

      <Text style={[styles.genericLabel, isDarkMode && dark.genericLabel]}>
        Question type
      </Text>
      <CustomPicker
        items={[
          { label: "Any type", value: "" },
          { label: "Multiple choice", value: "multiple" },
          { label: "True / False", value: "boolean" },
        ]}
        selectedValue={type}
        onSelect={(value) => setType(value)}
        styles={[pickerStyles, isDarkMode ? darkPickerStyles : {}]}
        iconColor={isDarkMode ? "white" : "black"}
      />

      <Text style={{ color: "white" }}>{generateQueryUrl()}</Text>
      <TouchableOpacity
        style={[styles.startButton, isDarkMode && dark.startButton]}
        onPress={() => generateQuiz()}
      >
        <Text style={[styles.buttonText, isDarkMode && dark.buttonText]}>
          Start Quiz
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    display: "flex",
    justifyContent: "start",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#EDEDED",
  },
  modalFull: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  modalContainer: {
    width: "100%",
    height: "70%",
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 32,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resetButton: {
    backgroundColor: "#666",
    paddingVertical: 8,
    paddingHorizontal: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  closeInfoButton: {
    backgroundColor: "#000",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  genericLabel: {
    marginBottom: 8,
    color: "#000",
  },
  sliderContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: "auto",
    width: "100%",
    marginBottom: 24,
  },
  slider: {
    width: "80%",
    paddingLeft: 8,
  },
  sliderLabel: {
    fontSize: 16,
  },
  picker: {
    marginBottom: 24,
    height: 50,
    width: "100%",
    backgroundColor: "#fff",
  },
  selection: {
    marginTop: 20,
    fontSize: 18,
  },
  startButton: {
    paddingVertical: 18,
    paddingHorizontal: 38,
    borderWidth: 1,
    borderRadius: 24,
    borderColor: "#f87609",
    backgroundColor: "#FFF",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 400,
    color: "#f87609",
  },
});

const pickerStyles = StyleSheet.create({
  button: {
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#f87609",
  },
  item: {
    backgroundColor: "#FFF",
  },
  itemText: {
    color: "#000",
  },
});
const darkPickerStyles = StyleSheet.create({
  button: {
    backgroundColor: "#000",
    borderColor: "#f87609",
  },
  buttonText: {
    color: "#FFF",
  },
  item: {
    backgroundColor: "#000",
  },
  itemText: {
    color: "#FFF",
  },
});

const dark = StyleSheet.create({
  page: {
    backgroundColor: "#121212",
  },
  genericLabel: {
    color: "#FFF",
  },
  startButton: {
    borderColor: "#f87609",
    backgroundColor: "#000",
    borderWidth: 1,
  },
  buttonText: {
    color: "#f87609",
  },
  sliderLabel: {
    color: "#FFF",
  },
});
