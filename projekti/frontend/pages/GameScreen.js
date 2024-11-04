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
    if (!gameEnded) navigation.setOptions({headerTitle: `Time: ${timer}`,});
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
      <View
        style={{
          flex: 1,
          padding: 20,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 28, marginBottom: 20 }}>
          Score: {score} / {questions.length}
        </Text>
        <TouchableOpacity
          style={{ padding: 16, backgroundColor: "#222", borderRadius: 16 }}
          onPress={() => navigation.navigate("Generate Quiz")}
        >
          <Text style={{ color: "#FFF", fontSize: 16 }}>Generate new quiz</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 18 }}>
        Question {currentQuestionIndex+1} / {questions.length}
      </Text>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>
        Category: {decode(currentQuestion.category)}
      </Text>
      <Text style={{ fontSize: 24, marginBottom: 8 }}>
        {decode(currentQuestion.question)}
      </Text>

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
  answerButton: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#001011ff",
    borderRadius: 5,
  },
  correctAnswer: {
    backgroundColor: "#79E619ff",
  },
  wrongAnswer: {
    backgroundColor: "#E62019ff",
  },
  answerText: {
    color: "#FFF",
    textAlign: "center",
    fontSize: 18,
  },
});
