import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from "react-native";
import { DarkModeContext } from "./DarkModeContext";
import { Dimensions } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import AnimatedStreak from "../components/AnimatedStreak";
import AnimatedFeedback from "../components/AnimatedFeedback";

const orange = "#f87609";

const MathChallenge = () => {
  const { isDarkMode } = useContext(DarkModeContext);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(true);
  const [difficulty, setDifficulty] = useState("easy");
  const [streak, setStreak] = useState(0);
  const [operationIndex, setOperationIndex] = useState(0);
  const operations = ["addition", "subtraction", "multiplication", "division"];

  const windowWidth = Dimensions.get("window").width;
  const operationButtonSize = windowWidth * 0.1;

  const color = isDarkMode ? "white" : "black";

  const generateQuestion = () => {
    let num1, num2;
    switch (difficulty) {
      case "easy":
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        break;
      case "medium":
        num1 = Math.floor(Math.random() * 90) + 10;
        num2 = Math.floor(Math.random() * 90) + 10;
        break;
      case "hard":
        num1 = Math.floor(Math.random() * 900) + 100;
        num2 = Math.floor(Math.random() * 900) + 100;
        break;
      default:
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        break;
    }

    let newQuestion = "";
    let newAnswer = 0;

    switch (operations[operationIndex]) {
      case "addition":
        newQuestion = `${num1} + ${num2}`;
        newAnswer = num1 + num2;
        break;
      case "subtraction":
        newQuestion = `${num1} - ${num2}`;
        newAnswer = num1 - num2;
        break;
      case "multiplication":
        newQuestion = `${num1} * ${num2}`;
        newAnswer = num1 * num2;
        break;
      case "division":
        newAnswer = num1;
        num1 = num1 * num2;
        newQuestion = `${num1} / ${num2}`;
        break;
      default:
        break;
    }

    setQuestion(newQuestion);
    setAnswer(newAnswer);
    setUserAnswer("");
    setShowFeedback(false);
  };

  const checkAnswer = () => {
    setShowFeedback(true);
    if (parseFloat(userAnswer) === answer) {
      setIsCorrect(true);
      setStreak((prev) => (prev + 1));
      setTimeout(() => {
        generateQuestion();
        setShowFeedback(false);
      }, 750);
    } else {
      setIsCorrect(false);
      setStreak(0);
      setTimeout(() => {
        setShowFeedback(false);
      }, 750);
    }
  };

  const cycleOperation = (isForward) => {
    if (isForward) {
      setOperationIndex(operationIndex + 1 > 3 ? 0 : operationIndex + 1);
    } else {
      setOperationIndex(operationIndex - 1 < 0 ? 3 : operationIndex - 1);
    }
  };

  useEffect(() => {
    generateQuestion();
  }, [difficulty, operationIndex]);

  return (
    <View style={[styles.container, isDarkMode ? dark.container : {}]}>
      <View style={styles.topContainer}>
        <View style={styles.operationContainer}>
          <TouchableOpacity
            style={styles.changeOperationButton}
            onPress={() => cycleOperation(false)}
          >
            <Icon name="caret-back" color={color} size={16}></Icon>
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 16,
              color: color,
              width: "40%",
              textAlign: "center",
            }}
          >
            {operations[operationIndex].charAt(0).toUpperCase() +
              operations[operationIndex].slice(1)}{" "}
          </Text>
          <TouchableOpacity
            style={styles.changeOperationButton}
            onPress={() => cycleOperation(true)}
          >
            <Icon name="caret-forward" color={color} size={16}></Icon>
          </TouchableOpacity>
        </View>
        <View style={styles.difficultyContainer}>
          <TouchableOpacity
            onPress={() => setDifficulty("easy")}
            style={[
              styles.difficultyButton,
              difficulty === "easy" && {
                borderWidth: 1,
                borderColor: orange,
                backgroundColor: isDarkMode ? "black" : "white",
              },
            ]}
          >
            <Text style={{ fontSize: 20 }}>😄</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setDifficulty("medium")}
            style={[
              styles.difficultyButton,
              difficulty === "medium" && {
                borderWidth: 1,
                borderColor: orange,
                backgroundColor: isDarkMode ? "black" : "white",
              },
            ]}
          >
            <Text style={{ fontSize: 20 }}>😳</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setDifficulty("hard")}
            style={[
              styles.difficultyButton,
              difficulty === "hard" && {
                borderWidth: 1,
                borderColor: orange,
                backgroundColor: isDarkMode ? "black" : "white",
              },
            ]}
          >
            <Text style={{ fontSize: 20 }}>💀</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.questionContainer}>
        <TouchableOpacity onPress={generateQuestion} style={styles.button}>
          <Icon name="refresh" color={color} size={20}></Icon>
        </TouchableOpacity>
        <Text style={[styles.question, { color: color, alignSelf: "center" }]}>
          {question}
        </Text>
      </View>

      <View style={[styles.questionContainer, { marginTop: 24, width: "80%" }]}>
        <TouchableOpacity onPress={checkAnswer} style={styles.button}>
          <Icon name="enter" color={color} size={20}></Icon>
        </TouchableOpacity>
        <TextInput
          style={[styles.input, isDarkMode ? dark.input : {}]}
          value={userAnswer}
          onChangeText={setUserAnswer}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={"#CCC"}
          selectionColor={orange}
          returnKeyType="done"
          onBlur={Keyboard.dismiss}
        />
        {showFeedback && (
          <AnimatedFeedback showFeedback={showFeedback} isCorrect={isCorrect} />
        )}
      </View>
      <AnimatedStreak streak={streak} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "start",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#EDEDED",
  },
  topContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  operationContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    width: "100%",
  },
  changeOperationButton: {
    borderRadius: 50,
    padding: 16,
  },
  operationText: {
    fontSize: 16,
  },
  difficultyContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  difficultyButton: {
    borderRadius: 50,
    marginBottom: 10,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    position: "absolute",
    left: 0,
    padding: 24,
  },
  questionContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "90%",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: orange,
    backgroundColor: "white",
    position: "relative",
    height: 65,
  },
  question: {
    fontSize: 24,
    textAlign: "center",
  },
  input: {
    fontSize: 24,
    width: "60%",
    textAlign: "center",
    color: "#000",
  },
  isCorrectIcon: {
    position: "absolute",
    right: 0,
    padding: 24,
  },
  feedback: {
    fontSize: 18,
    marginTop: 10,
    textAlign: "center",
  },
  streak: {
    fontSize: 18,
    marginTop: 38,
    textAlign: "center",
  },
  flame: {
    marginRight: 60,
  },
});

const dark = StyleSheet.create({
  container: {
    backgroundColor: "#121212",
  },
  input: {
    color: "#FFF",
  },
  questionContainer: {
    backgroundColor: "black",
  }
});

export default MathChallenge;
