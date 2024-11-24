import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { DarkModeContext } from './DarkModeContext';

const MathChallenge = () => {
    const { isDarkMode } = useContext(DarkModeContext);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState('');
    const [operation, setOperation] = useState('addition');

    const generateQuestion = () => {
        const num1 = Math.floor(Math.random() * 10);
        const num2 = Math.floor(Math.random() * 10);
        let newQuestion = '';
        let newAnswer = 0;

        switch (operation) {
            case 'addition':
                newQuestion = `${num1} + ${num2}`;
                newAnswer = num1 + num2;
                break;
            case 'subtraction':
                newQuestion = `${num1} - ${num2}`;
                newAnswer = num1 - num2;
                break;
            case 'multiplication':
                newQuestion = `${num1} * ${num2}`;
                newAnswer = num1 * num2;
                break;
            case 'division':
                newQuestion = `${num1} / ${num2}`;
                newAnswer = num1 / num2;
                break;
            default:
                break;
        }

        setQuestion(newQuestion);
        setAnswer(newAnswer);
        setUserAnswer('');
        setFeedback('');
    };

    const checkAnswer = () => {
        if (parseFloat(userAnswer) === answer) {
            setFeedback('Correct!');
            setTimeout(() => {
                generateQuestion();
                setFeedback('');
            }, 1000);
        } else {
            setFeedback('Incorrect, try again.');
        }
    };

    const styles = isDarkMode ? darkStyles : lightStyles;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Math Challenge</Text>
            <View style={styles.operationContainer}>
                <TouchableOpacity onPress={() => setOperation('addition')} style={styles.operationButton}>
                    <Text style={styles.operationText}>Addition</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setOperation('subtraction')} style={styles.operationButton}>
                    <Text style={styles.operationText}>Subtraction</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setOperation('multiplication')} style={styles.operationButton}>
                    <Text style={styles.operationText}>Multiplication</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setOperation('division')} style={styles.operationButton}>
                    <Text style={styles.operationText}>Division</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={generateQuestion} style={styles.button}>
                <Text style={styles.buttonText}>Generate Question</Text>
            </TouchableOpacity>
            {question && (
                <View style={styles.questionContainer}>
                    <View style={styles.questionBox}>
                        <Text style={styles.question}>{question}</Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        value={userAnswer}
                        onChangeText={setUserAnswer}
                        keyboardType="numeric"
                    />
                    <TouchableOpacity onPress={checkAnswer} style={styles.button}>
                        <Text style={styles.buttonText}>Submit Answer</Text>
                    </TouchableOpacity>
                    <Text style={styles.feedback}>{feedback}</Text>
                </View>
            )}
        </View>
    );
};

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
    operationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        width: '100%',
    },
    operationButton: {
        padding: 10,
        borderRadius: 5,
    },
    operationText: {
        fontSize: 16,
    },
    button: {
        backgroundColor: 'orange',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    buttonText: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
    },
    questionContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    questionBox: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 20,
        borderRadius: 5,
        marginBottom: 20,
        width: '80%',
        alignItems: 'center',
    },
    question: {
        fontSize: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        width: '80%',
        textAlign: 'center',
    },
    feedback: {
        fontSize: 18,
        marginTop: 10,
        textAlign: 'center',
    },
};

const lightStyles = StyleSheet.create({
    ...commonStyles,
    container: {
        ...commonStyles.container,
        backgroundColor: '#fff',
    },
    title: {
        ...commonStyles.title,
        color: '#333',
    },
    operationButton: {
        ...commonStyles.operationButton,
        backgroundColor: '#f0f0f0',
    },
    operationText: {
        ...commonStyles.operationText,
        color: '#333',
    },
    questionBox: {
        ...commonStyles.questionBox,
        backgroundColor: '#f9f9f9',
    },
    question: {
        ...commonStyles.question,
        color: '#333',
    },
    input: {
        ...commonStyles.input,
        backgroundColor: '#fff',
        color: '#000',
    },
    feedback: {
        ...commonStyles.feedback,
        color: '#333',
    },
});

const darkStyles = StyleSheet.create({
    ...commonStyles,
    container: {
        ...commonStyles.container,
        backgroundColor: '#121212',
    },
    title: {
        ...commonStyles.title,
        color: '#fff',
    },
    operationButton: {
        ...commonStyles.operationButton,
        backgroundColor: '#333',
    },
    operationText: {
        ...commonStyles.operationText,
        color: '#fff',
    },
    questionBox: {
        ...commonStyles.questionBox,
        backgroundColor: '#333',
    },
    question: {
        ...commonStyles.question,
        color: '#fff',
    },
    input: {
        ...commonStyles.input,
        backgroundColor: '#333',
        color: '#fff',
    },
    feedback: {
        ...commonStyles.feedback,
        color: '#fff',
    },
});

export default MathChallenge;