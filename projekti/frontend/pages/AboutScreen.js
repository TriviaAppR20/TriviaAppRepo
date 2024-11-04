import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const AboutScreen = () => {
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
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
        color: '#333',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
    },
});

export default AboutScreen;