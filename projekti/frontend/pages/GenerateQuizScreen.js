import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, Alert } from "react-native";
import Slider from "@react-native-community/slider";
import { Picker } from "@react-native-picker/picker";

export default function GenerateQuizScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [amountOfQuestions, setAmountOfQuestions] = useState(10);
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [type, setType] = useState("");

  const apiUrl = "https://opentdb.com/api.php";

  const generateQueryUrl = () => {
    const queryParams = [`amount=${amountOfQuestions}`];

    if (category) queryParams.push(`category=${category}`);
    if (difficulty) queryParams.push(`difficulty=${difficulty}`);
    if (type) queryParams.push(`type=${type}`);

    const queryUrl = `${apiUrl}?${queryParams.join("&")}`;
    return queryUrl;
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("https://opentdb.com/api_category.php");
      const data = await response.json();
      setCategories(data.trivia_categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
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
    const data = await fetchQuestions();
    if (data.response_code === 0) {
      navigation.navigate("Game", { questions: data.results });
    } else {
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
        case 4:
          errorMessage =
            "Token Empty: Session Token has returned all possible questions for the specified query. You may need to reset the Token.";
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
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <View style={styles.page}>
      <Text style={styles.header}>Select quiz options</Text>

      <Text style={styles.genericLabel}>Number of questions</Text>
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>{amountOfQuestions}</Text>
        <Slider
          style={styles.slider}
          minimumValue={5}
          maximumValue={50}
          step={1}
          value={amountOfQuestions}
          onValueChange={(value) => setAmountOfQuestions(value)}
          minimumTrackTintColor="#000"
          maximumTrackTintColor="#444"
          thumbTintColor="#000"
        />
      </View>

      <Text style={styles.genericLabel}>Category</Text>
      <Picker
        selectedValue={category}
        onValueChange={(itemValue) => {
          setCategory(itemValue);
        }}
        style={styles.picker}
      >
        <Picker.Item label="All categories" value={""} />
        {categories.map((category) => (
          <Picker.Item
            key={category.id}
            label={category.name}
            value={category.id}
          />
        ))}
      </Picker>

      <Text style={styles.genericLabel}>Difficulty</Text>
      <Picker
        selectedValue={difficulty}
        onValueChange={(itemValue) => {
          setDifficulty(itemValue);
        }}
        style={styles.picker}
      >
        <Picker.Item label="Any difficulty" value={""} />
        <Picker.Item label="Easy" value={"easy"} />
        <Picker.Item label="Medium" value={"medium"} />
        <Picker.Item label="Hard" value={"hard"} />
      </Picker>

      <Text style={styles.genericLabel}>Question type</Text>
      <Picker
        selectedValue={type}
        onValueChange={(itemValue) => {
          setType(itemValue);
        }}
        style={styles.picker}
      >
        <Picker.Item label="Any type" value={""} />
        <Picker.Item label="Multiple choice" value={"multiple"} />
        <Picker.Item label="True / False" value={"boolean"} />
      </Picker>

      <Text>{generateQueryUrl()}</Text>
      <View style={styles.buttonContainer}>
        <Button title="START QUIZ" onPress={() => generateQuiz()}></Button>
      </View>
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
  },
  genericLabel: {
    marginBottom: 8,
  },
  header: {
    fontSize: 24,
    marginBottom: 24,
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
  buttonContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
