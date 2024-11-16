import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { DarkModeContext } from './DarkModeContext';

const AboutScreen = () => {
    const { isDarkMode } = useContext(DarkModeContext);

    const styles = isDarkMode ? darkStyles : lightStyles;

    return (
        <View style={styles.container}>
            <Image 
                source={require('../../assets/kilppari.gif')} 
                style={styles.gif} 
            />
            <Text style={styles.title}>About</Text>
            <Text style={styles.description}>
                Welcome to the Trivia App! This app is designed to provide you with fun and challenging trivia questions. 
                Enjoy playing and learning new facts!
                {'\n\n'} This project was created in fall 2024 by Group 20 for the course
                "Mobiilikehitysprojekti" in Oulu University of Applied Sciences. (OAMK)
            </Text>
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
    gif: {
        width: 200,
        height: 200,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
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
    description: {
        ...commonStyles.description,
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
    description: {
        ...commonStyles.description,
        color: '#ccc',
    },
});

export default AboutScreen;