import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { DarkModeContext } from './DarkModeContext';

const HowToPlayScreen = () => {
    const { isDarkMode } = useContext(DarkModeContext);

    const styles = isDarkMode ? darkStyles : lightStyles;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>How to Play</Text>
            <Text style={styles.instructions}>
                {'\n\n'}Here's how you can play the quiz version of the game:
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
            <Text style={styles.instructions}>
                {'\n\n'}Here's how you can play the math version of the game:
            </Text>
            <View style={styles.stepContainer}>
                <Text style={styles.step}>1. Select the type of math operation you want to practice by pressing one of the buttons at the top of the screen: +, -, x, or /.</Text>
            </View>
            <View style={styles.stepContainer}>
                <Text style={styles.step}>2. Choose the difficulty level by pressing one of the colored buttons: green for easy, yellow for medium, and red for hard.</Text>
            </View>
            <View style={styles.stepContainer}>
                <Text style={styles.step}>3. Press the "Generate Question" button to generate a new math question based on your selected operation and difficulty level.</Text>
            </View>
            <View style={styles.stepContainer}>
                <Text style={styles.step}>4. The generated question will appear in the question box. Use the calculator buttons at the bottom of the screen to input your answer in the answer box.</Text>
            </View>
            <View style={styles.stepContainer}>
                <Text style={styles.step}>5. Once you have entered your answer, press the "Submit Answer" button to check if your answer is correct.</Text>
            </View>
            <View style={styles.stepContainer}>
                <Text style={styles.step}>6. If your answer is correct, you will see a "Correct!" message, and a new question will be generated automatically after a short delay. If your answer is incorrect, you will see an "Incorrect, try again." message, and you can try to answer the same question again.</Text>
            </View>
            <Text style={styles.conclusion}>
                Keep practicing to improve your math skills!
            </Text>
        </ScrollView>
    );
};

const commonStyles = {
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        color: '#333',
    },
    stepContainer: {
        ...commonStyles.stepContainer,
        backgroundColor: '#f0f0f0',
    },
    step: {
        ...commonStyles.step,
        color: '#333',
    },
    conclusion: {
        ...commonStyles.conclusion,
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
    instructions: {
        ...commonStyles.instructions,
        color: '#fff',
    },
    stepContainer: {
        ...commonStyles.stepContainer,
        backgroundColor: '#333',
    },
    step: {
        ...commonStyles.step,
        color: '#fff',
    },
    conclusion: {
        ...commonStyles.conclusion,
        color: '#fff',
    },
});

export default HowToPlayScreen;