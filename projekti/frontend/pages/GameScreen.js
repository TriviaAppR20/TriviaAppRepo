import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList } from "react-native";

export default function GameScreen({ route }) {
  const { questions } = route.params;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(20); // Timer starts at 20 seconds
  const [answerSelected, setAnswerSelected] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const allAnswers = [
    ...currentQuestion.incorrect_answers,
    currentQuestion.correct_answer,
  ].sort(() => Math.random() - 0.5); // Shuffle answers

  // Reset timer and answerSelected when currentQuestionIndex changes
  useEffect(() => {
    setTimer(20); // Reset timer for each question
    setAnswerSelected(false); // Reset answer selection

    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 1) {
          // Move to the next question when time runs out
          handleNextQuestion();
          return prevTimer;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(countdown); // Cleanup timer on component unmount or question change
  }, [currentQuestionIndex]);

  const handleNextQuestion = () => {
    // If there are more questions, go to the next one
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setGameEnded(true); // End game if all questions are answered
    }
  };

  const handleAnswerSelection = (answer) => {
    if (!answerSelected) {
      setAnswerSelected(true); // Mark question as answered
      // Here you could check if the answer is correct, handle scoring, etc.
      setTimeout(handleNextQuestion, 1000); // Brief delay before moving to the next question
    }
  };

  if (gameEnded) {
    return (
      <View>
        <Text>Quiz Completed!</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>Time Remaining: {timer} seconds</Text>
      <Text>Category: {currentQuestion.category}</Text>
      <Text>Question: {currentQuestion.question}</Text>

      <FlatList
        data={allAnswers}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Button
            title={item}
            onPress={() => handleAnswerSelection(item)}
            disabled={answerSelected} // Disable buttons if an answer is selected
          />
        )}
      />
    </View>
  );
}
