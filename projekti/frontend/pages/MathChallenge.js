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
    const [difficulty, setDifficulty] = useState('easy');

    const generateQuestion = () => {
        let num1, num2;
        switch (difficulty) {
            case 'easy':
                num1 = Math.floor(Math.random() * 10) + 1;
                num2 = Math.floor(Math.random() * 10) + 1;
                break;
            case 'medium':
                num1 = Math.floor(Math.random() * 90) + 10;
                num2 = Math.floor(Math.random() * 90) + 10;
                break;
            case 'hard':
                num1 = Math.floor(Math.random() * 900) + 100;
                num2 = Math.floor(Math.random() * 900) + 100;
                break;
            default:
                num1 = Math.floor(Math.random() * 10) + 1;
                num2 = Math.floor(Math.random() * 10) + 1;
                break;
        }

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
                newAnswer = num1;
                num1 = num1 * num2;
                newQuestion = `${num1} / ${num2}`;
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

    const handleCalculatorPress = (value) => {
        setUserAnswer((prev) => prev + value);
    };

    const styles = isDarkMode ? darkStyles : lightStyles;

    return (
        <View style={styles.container}>
            <View style={styles.topContainer}>
                <View style={styles.operationContainer}>
                    <TouchableOpacity onPress={() => setOperation('addition')} style={[styles.operationButton, operation === 'addition' && styles.selectedButton]}>
                        <Text style={styles.operationText}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setOperation('subtraction')} style={[styles.operationButton, operation === 'subtraction' && styles.selectedButton]}>
                        <Text style={styles.operationText}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setOperation('multiplication')} style={[styles.operationButton, operation === 'multiplication' && styles.selectedButton]}>
                        <Text style={styles.operationText}>x</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setOperation('division')} style={[styles.operationButton, operation === 'division' && styles.selectedButton]}>
                        <Text style={styles.operationText}>/</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.difficultyContainer}>
                    <TouchableOpacity onPress={() => setDifficulty('easy')} style={[styles.difficultyButton, difficulty === 'easy' && { backgroundColor: 'green' }]}>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setDifficulty('medium')} style={[styles.difficultyButton, difficulty === 'medium' && { backgroundColor: 'yellow' }]}>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setDifficulty('hard')} style={[styles.difficultyButton, difficulty === 'hard' && { backgroundColor: 'red' }]}>
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity onPress={generateQuestion} style={styles.button}>
                <Text style={styles.buttonText}>Generate Question</Text>
            </TouchableOpacity>
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
            <View style={styles.calculatorContainer}>
                <View style={styles.calculatorRow}>
                    {['1', '2', '3'].map((num) => (
                        <TouchableOpacity key={num} onPress={() => handleCalculatorPress(num)} style={styles.calculatorButton}>
                            <Text style={styles.calculatorButtonText}>{num}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.calculatorRow}>
                    {['4', '5', '6'].map((num) => (
                        <TouchableOpacity key={num} onPress={() => handleCalculatorPress(num)} style={styles.calculatorButton}>
                            <Text style={styles.calculatorButtonText}>{num}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.calculatorRow}>
                    {['7', '8', '9'].map((num) => (
                        <TouchableOpacity key={num} onPress={() => handleCalculatorPress(num)} style={styles.calculatorButton}>
                            <Text style={styles.calculatorButtonText}>{num}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.calculatorRow}>
                    <View style={styles.calculatorButtonPlaceholder} />
                    <TouchableOpacity onPress={() => handleCalculatorPress('0')} style={styles.calculatorButton}>
                        <Text style={styles.calculatorButtonText}>0</Text>
                    </TouchableOpacity>
                    <View style={styles.calculatorButtonPlaceholder} />
                </View>
            </View>
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
    topContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
        position: 'absolute',
        top: 20,
    },
    operationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 10,
    },
    operationButton: {
        padding: 20,
        borderRadius: 10,
        marginBottom: 10,
        width: '20%',
        alignItems: 'center',
    },
    operationText: {
        fontSize: 24,
    },
    difficultyContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    difficultyButton: {
        padding: 20,
        borderRadius: 50,
        marginBottom: 10,
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
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
        padding: 40,
        borderRadius: 5,
        marginBottom: 20,
        width: '90%',
        alignItems: 'center',
    },
    question: {
        fontSize: 32,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 30,
        borderRadius: 5,
        marginBottom: 10,
        width: '90%',
        textAlign: 'center',
        fontSize: 28,
    },
    feedback: {
        fontSize: 18,
        marginTop: 10,
        textAlign: 'center',
    },
    calculatorContainer: {
        position: 'absolute',
        bottom: 20,
    },
    calculatorRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
    },
    calculatorButton: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
        backgroundColor: '#f0f0f0',
        borderRadius: 30,
    },
    calculatorButtonText: {
        fontSize: 24,
        color: '#333',
    },
    calculatorButtonPlaceholder: {
        width: 60,
        height: 60,
        margin: 5,
    },
    selectedButton: {
        borderColor: 'orange',
        borderWidth: 2,
    },
};

const lightStyles = StyleSheet.create({
    ...commonStyles,
    container: {
        ...commonStyles.container,
        backgroundColor: '#fff',
    },
    operationButton: {
        ...commonStyles.operationButton,
        backgroundColor: '#f0f0f0',
    },
    operationText: {
        ...commonStyles.operationText,
        color: '#333',
    },
    difficultyButton: {
        ...commonStyles.difficultyButton,
        backgroundColor: '#f0f0f0',
    },
    difficultyText: {
        ...commonStyles.difficultyText,
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
    calculatorButton: {
        ...commonStyles.calculatorButton,
        backgroundColor: '#f0f0f0',
    },
    calculatorButtonText: {
        ...commonStyles.calculatorButtonText,
        color: '#333',
    },
});

const darkStyles = StyleSheet.create({
    ...commonStyles,
    container: {
        ...commonStyles.container,
        backgroundColor: '#121212',
    },
    operationButton: {
        ...commonStyles.operationButton,
        backgroundColor: '#333',
    },
    operationText: {
        ...commonStyles.operationText,
        color: '#fff',
    },
    difficultyButton: {
        ...commonStyles.difficultyButton,
        backgroundColor: '#333',
    },
    difficultyText: {
        ...commonStyles.difficultyText,
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
    calculatorButton: {
        ...commonStyles.calculatorButton,
        backgroundColor: '#333',
    },
    calculatorButtonText: {
        ...commonStyles.calculatorButtonText,
        color: '#fff',
    },
    calculatorButtonPlaceholder: {
        width: 60,
        height: 60,
        margin: 5,
    },
    selectedButton: {
        borderColor: 'orange',
        borderWidth: 2,
    },
});

export default MathChallenge;