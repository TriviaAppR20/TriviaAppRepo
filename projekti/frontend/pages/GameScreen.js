import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { decode } from "html-entities";
import { DarkModeContext } from "./DarkModeContext";
import CustomProgressBar from "../components/CustomProgressBar";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function GameScreen({ route, navigation }) {
  const { questions } = route.params;
  const timeToAnswer = 35;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(timeToAnswer);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerSelected, setIsAnswerSelected] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [answerStatus, setAnswerStatus] = useState([]);
  const [progressBarTrigger, setProgressBarTrigger] = useState(false);
  const [savingDone, setSavingDone] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const categories = questions.map((question) => question.category);
  const difficulties = questions.map((question) => question.difficulty);



  const { isDarkMode } = useContext(DarkModeContext);


  useEffect(() => {
    const allAnswers = [
      ...currentQuestion.incorrect_answers,
      currentQuestion.correct_answer,
    ].sort(() => Math.random() - 0.5);
    setShuffledAnswers(allAnswers);
    setTimer(timeToAnswer);
    setSelectedAnswer(null);
    setIsAnswerSelected(false);
    setProgressBarTrigger(!progressBarTrigger);

    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 1) {
          handleNextQuestion();
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [currentQuestionIndex]);

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      saveStats();
      setGameEnded(true);
    }
  };

  const handleAnswerSelection = (answer) => {
    if (!isAnswerSelected) {
      setIsAnswerSelected(true);
      setSelectedAnswer(answer);

      if (answer === currentQuestion.correct_answer) {
        setScore((prevScore) => prevScore + 1);
        setAnswerStatus([...answerStatus, true]);
      } else setAnswerStatus([...answerStatus, false]);
      setTimeout(handleNextQuestion, 2000);
    }
  };

  const saveStats = async () => {
    try {
      const statsString = await AsyncStorage.getItem("SP_STATS");
      const stats = statsString ? JSON.parse(statsString) : {};

      for (let i = 0; i < categories.length; i++) {
        const category = decode(categories[i]);
        const difficulty = decode(difficulties[i]);
        const isCorrect = answerStatus[i];

        if (!stats[category]) {
          stats[category] = {
            easy: { correct: 0, incorrect: 0 },
            medium: { correct: 0, incorrect: 0 },
            hard: { correct: 0, incorrect: 0 },
          };
        }

        const currentStats = stats[category][difficulty];
        if (isCorrect) {
          currentStats.correct += 1;
        } else {
          currentStats.incorrect += 1;
        }
      }

      await AsyncStorage.setItem("SP_STATS", JSON.stringify(stats));
      setSavingDone(true);
    } catch (err) {
      console.error("Failed to save stats: ", err);
    }
  };

  if (gameEnded && savingDone) {
    return (

      <View style={[styles.endContainer, isDarkMode && dark.endContainer]}>
        <Text style={[styles.endScore, isDarkMode && dark.endScore]}>
          Score: {score} / {questions.length}
        </Text>
        <TouchableOpacity
          style={[styles.endButton, isDarkMode && dark.endButton]}
          onPress={() => navigation.navigate("Generate Quiz")}
        >
          <Text
            style={[styles.endButtonText, isDarkMode && dark.endButtonText]}
          >
            Generate new quiz
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (

    <View style={[styles.page, isDarkMode && dark.page]}>
      <SafeAreaView style={{ width: "100%" }}>
        <CustomProgressBar
          totalTime={timeToAnswer * 1000}
          trigger={progressBarTrigger}
        />
      </SafeAreaView>
      <Text style={[styles.questionNum, isDarkMode && dark.questionNum]}>
        Question {currentQuestionIndex + 1} / {questions.length}
      </Text>
      <Text
        style={[styles.questionCategory, isDarkMode && dark.questionCategory]}
      >
        Category: {decode(currentQuestion.category)}
      </Text>
      <Text style={[styles.question, isDarkMode && dark.question]}>
        {decode(currentQuestion.question)}
      </Text>


      <FlatList
        data={shuffledAnswers}
        keyExtractor={(item) => item}
        numColumns={1}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.answerButton,
              isDarkMode && dark.answerButton,
              isAnswerSelected &&
                currentQuestion.type === "multiple" &&
                item === currentQuestion.correct_answer &&
                styles.correctAnswer,
              isAnswerSelected &&
                selectedAnswer === item &&
                item !== currentQuestion.correct_answer &&
                styles.wrongAnswer,
              isAnswerSelected &&
                currentQuestion.type === "boolean" &&
                selectedAnswer === item &&
                item === currentQuestion.correct_answer &&
                styles.correctAnswer,
            ]}
            onPress={() => handleAnswerSelection(item)}
            disabled={isAnswerSelected}
          >
            <Text style={[styles.answerText, isDarkMode && dark.answerText]}>
              {decode(item)}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  endContainer: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDEDED",
  },
  endScore: {
    fontSize: 28,
    marginBottom: 20,
    color: "#000",
  },
  endButton: {
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#f87609",
    paddingHorizontal: 32,
  },
  endButtonText: {
    color: "#000",
    fontSize: 16,
  },
  page: {
    flex: 1,
    padding: 24,
    backgroundColor: "#EDEDED",
  },
  questionNum: {
    fontSize: 18,
    color: "#000",
  },
  questionCategory: {

    fontSize: 18,
    marginBottom: 16,
    color: "#000",
  },
  question: {
    fontSize: 24,
    marginBottom: 8,
    color: "#000",
  },
  answerButton: {
    padding: 10,
    backgroundColor: "#FFF",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#f87609",
    marginVertical: 8,
  },
  correctAnswer: {
    borderColor: "#79E619ff",
    backgroundColor: "#79E619ff",
  },
  wrongAnswer: {
    borderColor: "#E62019ff",
    backgroundColor: "#E62019ff",
  },
  answerText: {
    color: "#000",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#222",
    paddingVertical: 16,
    paddingHorizontal: 38,
    borderWidth: 1,
    borderRadius: 24,
    borderColor: "#222",
    marginVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

const dark = StyleSheet.create({
  endContainer: {
    backgroundColor: "#121212",
  },
  endScore: {
    color: "#FFF",
  },
  endButton: {
    backgroundColor: "#000",
  },
  endButtonText: {
    color: "#FFF",
  },
  page: {
    backgroundColor: "#121212",
  },
  questionNum: {
    color: "#FFF",
  },
  questionCategory: {
    color: "#FFF",
  },
  question: {
    color: "#FFF",
  },
  answerButton: {
    backgroundColor: "#000",
  },
  answerText: {
    color: "#FFF",
  },
});

