import React, { useState } from 'react';
import { View, Text, TextInput, Button,TouchableOpacity, StyleSheet, Alert } from 'react-native';
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
      <Text style={styles.genericLabel}>Select the correct answer:</Text>
      {answers.map((answer, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.button, correctAnswer === index && styles.correctButton]}
          onPress={() => setCorrectAnswer(index)}
        >
          <Text style={styles.buttonText}>{answer || `Answer ${index + 1}`}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.button} onPress={saveQuestion}>
        <Text style={styles.buttonText}>Save Question</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={finishQuiz}>
        <Text style={styles.buttonText}>Finish Quiz</Text>
      </TouchableOpacity>
    </View>
  );
}

const commonStyles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: 'orange',
    width: '50%', 
    height: 50, 
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Copperplate',
  },
  genericLabel: {
    marginBottom: 8,
  },
};

const styles = StyleSheet.create({
  ...commonStyles,
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    width: '80%',
  },
  correctButton: {
    backgroundColor: 'green',
  },
});

export default CreateQuiz;
