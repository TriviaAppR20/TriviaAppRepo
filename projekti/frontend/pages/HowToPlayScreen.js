import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DarkModeContext } from './DarkModeContext';

const HowToPlayScreen = () => {
    const { isDarkMode } = useContext(DarkModeContext);

    const styles = isDarkMode ? darkStyles : lightStyles;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>How to Play</Text>
            <Text style={styles.instructions}>
                Welcome to the Trivia App! Here's how you can play:
            </Text>
            <View style={styles.stepContainer}>
                <Text style={styles.step}>
                    1. Choose whether you want to play a ready-made quiz or generate your own quiz.
                </Text>
            </View>
            <View style={styles.stepContainer}>
                <Text style={styles.step}>
                    2. If you choose a ready-made quiz, simply select a category and start answering the questions.
                </Text>
            </View>
            <View style={styles.stepContainer}>
                <Text style={styles.step}>
                    3. If you choose to generate your own quiz, you can select the number of questions, categories, and difficulty level.
                </Text>
            </View>
            <View style={styles.stepContainer}>
                <Text style={styles.step}>
                    4. Once you have made your selections, start the quiz and answer the questions to the best of your ability.
                </Text>
            </View>
            <View style={styles.stepContainer}>
                <Text style={styles.step}>
                    5. After completing the quiz, you will see your score and can review the correct answers.
                </Text>
            </View>
            <Text style={styles.conclusion}>
                Have fun and enjoy testing your knowledge!
            </Text>
        </View>
    );
};

const commonStyles = {
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    instructions: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
    },
    stepContainer: {
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    step: {
        fontSize: 16,
    },
    conclusion: {
        fontSize: 18,
        marginTop: 20,
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
    instructions: {
        ...commonStyles.instructions,
        color: '#666',
    },
    step: {
        ...commonStyles.step,
        color: '#333',
    },
    conclusion: {
        ...commonStyles.conclusion,
        color: '#666',
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
    instructions: {
        ...commonStyles.instructions,
        color: '#ccc',
    },
    stepContainer: {
        ...commonStyles.stepContainer,
        backgroundColor: '#333',
        borderColor: '#555',
    },
    step: {
        ...commonStyles.step,
        color: '#fff',
    },
    conclusion: {
        ...commonStyles.conclusion,
        color: '#ccc',
    },
});

export default HowToPlayScreen;