import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { db, auth } from '../../../backend/firebase';
import { collection, addDoc } from 'firebase/firestore';

const CreateQuiz = ({ navigation }) => {
  const [quizTitle, setQuizTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [answers, setAnswers] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [questions, setQuestions] = useState([]);

  // Update the answer text at the given index
  const handleAnswerChange = (text, index) => {
    const newAnswers = [...answers];
    newAnswers[index] = text;
    setAnswers(newAnswers);
  };

  // Save the current question to the list of questions
  const saveQuestion = () => {
    if (!questionText || answers.some(answer => !answer) || correctAnswer === null) {
      Alert.alert("Please fill in all fields and select a correct answer.");
      return;
    }

    const newQuestion = {
      questionText,
      answers,
      correctAnswer: answers[correctAnswer]
    };

    setQuestions([...questions, newQuestion]);
    setQuestionText('');
    setAnswers(['', '', '', '']);
    setCorrectAnswer(null);
  };

  // Save the quiz to the database
  const finishQuiz = async () => {
    if (questions.length === 0) {
      Alert.alert("Add at least one question to finish the quiz.");
      return;
    }

    try {
      await addDoc(collection(db, 'quizzes'), {
        quizTitle,
        questions,
        creatorId: auth.currentUser.uid
      });
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
