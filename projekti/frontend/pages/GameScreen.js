import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { decode } from "html-entities";

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

  const currentQuestion = questions[currentQuestionIndex];

  useLayoutEffect(() => {
    if (!gameEnded) navigation.setOptions({ headerTitle: `Time: ${timer}` });
    else navigation.setOptions({ headerTitle: "Quiz complete!" });
  }, [timer, gameEnded]);

  useEffect(() => {
    const allAnswers = [
      ...currentQuestion.incorrect_answers,
      currentQuestion.correct_answer,
    ].sort(() => Math.random() - 0.5);
    setShuffledAnswers(allAnswers);
    setTimer(timeToAnswer);
    setSelectedAnswer(null);
    setIsAnswerSelected(false);

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

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setGameEnded(true);
    }
  };

  const handleAnswerSelection = (answer) => {
    if (!isAnswerSelected) {
      setIsAnswerSelected(true);
      setSelectedAnswer(answer);

      if (answer === currentQuestion.correct_answer) {
        setScore((prevScore) => prevScore + 1);
      }
      setTimeout(handleNextQuestion, 2000);
    }
  };

  if (gameEnded) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Score: {score} / {questions.length}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Generate Quiz")}
        >
          <Text style={styles.buttonText}>Generate new quiz</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.questionCountText}>
        Question {currentQuestionIndex + 1} / {questions.length}
      </Text>
      <Text style={styles.categoryText}>
        Category: {decode(currentQuestion.category)}
      </Text>
      <Text style={styles.questionText}>{decode(currentQuestion.question)}</Text>

      <FlatList
        data={shuffledAnswers}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.answerButton,
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
            <Text style={styles.answerText}>{decode(item)}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EDEDED",
    padding: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  questionCountText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
  },
  categoryText: {
    fontSize: 18,
    marginBottom: 16,
    color: "#000",
  },
  questionText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#000",
  },
  answerButton: {
    backgroundColor: "#f87609",
    paddingVertical: 18,
    paddingHorizontal: 38,
    borderWidth: 1,
    borderRadius: 24,
    borderColor: "#f87609",
    marginVertical: 10,
    alignItems: "center",
  },
  correctAnswer: {
    backgroundColor: "#79E619",
    borderColor: "#79E619",
  },
  wrongAnswer: {
    backgroundColor: "#E62019",
    borderColor: "#E62019",
  },
  answerText: {
    color: "#FFF",
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