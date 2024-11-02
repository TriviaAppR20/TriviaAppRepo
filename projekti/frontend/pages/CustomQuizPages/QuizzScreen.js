import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { db } from '../../../backend/firebase';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';

const QuizScreen = ({ route, navigation }) => {
  const { gameCode, quizId } = route.params;
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionData, setQuestionData] = useState(null);
  const [countdown, setCountdown] = useState(10); // Time per question
  const [allAnswersReceived, setAllAnswersReceived] = useState(false);

  // starts loading questions from the quiz.
 // currently just shows the question text and a button to answer which does nothing
 // No options are displayed or ensured that are available from the db
 // techincally they should since the title and question title is fetched

    // we should ensure that small brakes are between questions
    // because there is a small delay in communication between clients and database



  useEffect(() => {
    const loadQuestion = async () => {
      const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
      const questions = quizDoc.data().questions;
      setQuestionData(questions[questionIndex]);
    };
    loadQuestion();
  }, [questionIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (countdown > 0 && !allAnswersReceived) {
        setCountdown(countdown - 1);
      } else {
        clearInterval(interval);
        moveToNextQuestion();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown, allAnswersReceived]);

  const moveToNextQuestion = () => {
    setCountdown(10);
    setAllAnswersReceived(false);
    setQuestionIndex((prevIndex) => prevIndex + 1);
  };

  return (
    <View>
      <Text>{questionData ? questionData.questionText : 'Loading question...'}</Text>
      <Text>Time Left: {countdown}</Text>
      <Button title="Answer" onPress={() => setAllAnswersReceived(true)} />
    </View>
  );
};

export default QuizScreen;
