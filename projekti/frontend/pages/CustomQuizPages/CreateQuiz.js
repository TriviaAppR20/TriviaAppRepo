import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { db, auth } from '../../../backend/firebase/firebase';
import { collection, addDoc } from 'firebase/firestore';

const CreateQuiz = ({ navigation }) => {
  const [quizTitle, setQuizTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [answers, setAnswers] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [questions, setQuestions] = useState([]);

// CreateQuiz Component
//
// Purpose:
// Provides a user interface for creating custom quizzes with multiple questions
//
// Key Functionalities:
// - Allows users to input quiz title and multiple-choice questions
// - Validates question and answer completeness
// - Supports adding multiple questions to a single quiz
// - Saves quiz data to Firebase Firestore database
// - Provides error handling and user feedback


  // Updates an individual answer's text in the answers array
  //
  // Allows modification of specific answer options without affecting others
  // 
  // @param {string} text - New text for the answer
  // @param {number} index - Index of the answer being modified
  const handleAnswerChange = (text, index) => {
    const newAnswers = [...answers];
    newAnswers[index] = text;
    setAnswers(newAnswers);
  };



  // Saves the current question to the quiz's question list
  //
  // Validation steps:
  // - Ensures question text is not empty
  // - Checks that all answer fields are filled
  // - Verifies a correct answer is selected
  //
  // After successful validation:
  // - Adds question to questions array
  // - Resets input fields for next question
  const saveQuestion = () => {
    if (!questionText || answers.some(answer => !answer) || correctAnswer === null) {
      Alert.alert("Please fill in all fields and select a correct answer.");
      return;
    }
  // Create question object with all necessary details
    const newQuestion = {
      questionText,
      answers,
      correctAnswer: answers[correctAnswer]
    };
  // Update questions list and reset input fields
    setQuestions([...questions, newQuestion]);
    setQuestionText('');
    setAnswers(['', '', '', '']);
    setCorrectAnswer(null);
  };




  // Finalizes and saves the entire quiz to the database
  //
  // Workflow:
  // - Validates that at least one question exists
  // - Saves quiz data to Firestore
  // - Provides user feedback
  // - Handles navigation after successful save
  //
  // Error handling:
  // - Prevents saving empty quizzes
  // - Catches and logs database saving errors
  const finishQuiz = async () => {
    if (questions.length === 0) { // Prevent saving empty quiz
      Alert.alert("Add at least one question to finish the quiz.");
      return;
    }

    try { // Save quiz to Firestore with all collected data
      await addDoc(collection(db, 'quizzes'), {
        quizTitle,
        questions,
        creatorId: auth.currentUser.uid
      });
      // Success feedback and navigation
      Alert.alert("Quiz created successfully!");
      navigation.goBack(); // Go back to previous screen or quizzes list
    } catch (error) {
      console.error("Error saving quiz:", error);
      Alert.alert("There was an error saving your quiz. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create a New Quiz</Text>
      <TextInput
        style={styles.input}
        placeholder="Quiz Title"
        value={quizTitle}
        onChangeText={setQuizTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Question"
        value={questionText}
        onChangeText={setQuestionText}
      />
      {answers.map((answer, index) => (
        <TextInput
          key={index}
          style={styles.input}
          placeholder={`Answer ${index + 1}`}
          value={answer}
          onChangeText={text => handleAnswerChange(text, index)}
        />
      ))}
      <Text>Select the correct answer:</Text>
      {answers.map((answer, index) => (
        <Button
          key={index}
          title={answer || `Answer ${index + 1}`}
          color={correctAnswer === index ? 'green' : 'blue'}
          onPress={() => setCorrectAnswer(index)}
        />
      ))}
      <Button title="Save Question" onPress={saveQuestion} />
      <Button title="Finish Quiz" onPress={finishQuiz} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, padding: 10, marginBottom: 10 }
});

export default CreateQuiz;
