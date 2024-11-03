import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import Slider from "@react-native-community/slider";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from '@react-navigation/native';

export default function GenerateQuizScreen({navigation}) {
  const [categories, setCategories] = useState([]);
  const [amountOfQuestions, setAmountOfQuestions] = useState(10);
  const [category, setCategory] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [type, setType] = useState(null)

  const apiUrl = "https://opentdb.com/api.php"
  
  const queryParams = [`amount=${amountOfQuestions}`]
  if (category) {
    queryParams.push(`category=${category}`)
  }
  if (difficulty) {
    queryParams.push(`difficulty=${difficulty}`)
  }
  if (type) {
    queryParams.push(`type=${type}`)
  }

  const queryUrl = `${apiUrl}?${queryParams.join('&')}`

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
      const response = await fetch(queryUrl);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching questions", error);
    }
  };

  const generateQuiz = async () => {
    const data = await fetchQuestions()
    navigation.navigate("Game", { questions: data.results })
  }

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
        <Picker.Item label="All categories" value={null} />
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
        <Picker.Item label="Any difficulty" value={null} />
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
        <Picker.Item label="Any type" value={null} />
        <Picker.Item label="Multiple choice" value={"multiple"} />
        <Picker.Item label="True / False" value={"boolean"} />
      </Picker>

      <Text>{queryUrl}</Text>
      <View style={styles.buttonContainer} >
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
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
    padding: 20,
  }
});