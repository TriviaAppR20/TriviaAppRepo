import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { decode } from "html-entities";

export default function GameScreen({ route, navigation }) {
  const { questions } = route.params;
  const timeToAnswer = 35;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(timeToAnswer);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerSelected, setAnswerSelected] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    const allAnswers = [
      ...currentQuestion.incorrect_answers,
      currentQuestion.correct_answer,
    ].sort(() => Math.random() - 0.5);
    setShuffledAnswers(allAnswers);
    setTimer(timeToAnswer);
    setSelectedAnswer(null);
    setAnswerSelected(false);

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
    if (!answerSelected) {
      setAnswerSelected(true);
      setSelectedAnswer(answer);
      
      if (answer === currentQuestion.correct_answer) {
        setScore((prevScore) => prevScore + 1);
      }
      setTimeout(handleNextQuestion, 2000);
    }
  };

  if (gameEnded) {
    return (
      <View style={{ padding: 20, alignItems: "center" }}>
        <Text style={{ fontSize: 24, marginBottom: 20 }}>Quiz Completed!</Text>
        <Text style={{ fontSize: 18 }}>Your Score: {score} / {questions.length}</Text>
        <Button title="Generate new quiz" onPress={() => navigation.navigate("Generate Quiz")} />
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>Time Remaining: {timer} seconds</Text>
      <Text>Category: {decode(currentQuestion.category)}</Text>
      <Text>Question: {decode(currentQuestion.question)}</Text>

      <FlatList
        data={shuffledAnswers}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
          style={[
            styles.answerButton,
            answerSelected && item === currentQuestion.correct_answer && styles.correctAnswer,
            answerSelected && selectedAnswer === item && item !== currentQuestion.correct_answer && styles.wrongAnswer,
          ]}
            onPress={() => handleAnswerSelection(item)}
            disabled={answerSelected}
          >
            <Text style={styles.answerText}>{decode(item)}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  answerButton: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#222",
    borderRadius: 5,
  },
  correctAnswer: {
    backgroundColor: "green",
  },
  wrongAnswer: {
    backgroundColor: "red",
  },
  answerText: {
    color: "#FFF",
    textAlign: "center",
  },
});