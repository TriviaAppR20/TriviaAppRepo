import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { db, auth } from '../../../backend/firebase/firebase';
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
      <Text style={styles.descriptionText}>Select the correct answer:</Text>
      {answers.map((answer, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.button, correctAnswer === index && styles.selectedButton]}
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDEDED',
    padding: 24,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    width: '100%',
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#f87609',
    paddingVertical: 18,
    paddingHorizontal: 38,
    borderWidth: 1,
    borderRadius: 24,
    borderColor: '#f87609',
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedButton: {
    backgroundColor: 'green',
  },
  descriptionText: {
    color: '#000',
    fontSize: 16,
    marginBottom: 8,
  },
});

export default CreateQuiz;
