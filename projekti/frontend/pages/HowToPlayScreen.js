import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HowToPlayScreen = () => {
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
                    3. If you choose to generate your own quiz, you can select write your own questions and answers. Once your quiz is completed, you will receive a code
                    which you can share with anyone so they can join and play your quiz.
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    instructions: {
        fontSize: 18,
        color: '#666',
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
        color: '#333',
    },
    conclusion: {
        fontSize: 18,
        color: '#666',
        marginTop: 20,
        textAlign: 'center',
    },
});

export default HowToPlayScreen;