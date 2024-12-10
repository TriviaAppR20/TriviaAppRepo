import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { DarkModeContext } from './DarkModeContext';

const orange = "#f87609";

export default function HomeScreen() {
    const navigation = useNavigation();
    const { isDarkMode } = useContext(DarkModeContext);

    const styles = isDarkMode ? darkStyles : lightStyles;

    return (
        <View style={styles.container}>

            <View>
                <Text style={styles.title}>
                    Singleplayer
                </Text>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Generate Quiz')}>
                    <Text style={styles.buttonText}>Generate Quiz 🎲</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Math Challenge')}>
                    <Text style={styles.buttonText}>Math Challenge 📐</Text>
                </TouchableOpacity>
            </View>

            <View>
                <Text style={styles.title}>
                    Multiplayer
                </Text>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('KahootHomeScreen')}>
                    <Text style={styles.buttonText}>Kähööt 🤝</Text>
                </TouchableOpacity>
            </View>

            <View>
                <Text style={styles.title}>
                    Other
                </Text>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Statistics')}>
                    <Text style={styles.buttonText}>Statistics 📈</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('How To Play')}>
                    <Text style={styles.buttonText}>How to Play 📖</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('About')}>
                    <Text style={styles.buttonText}>About ℹ️</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}

const commonStyles = {
    container: {
        flex: 1,
        padding: 32,
        display: "flex",
        justifyContent: "start",
        alignItems: "start",
        gap: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    button: {
        paddingVertical: 5,
        paddingHorizontal: 20,
        height: 60,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: orange,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    buttonText: {
        fontSize: 24,
        fontWeight: "bold",
    },
};

const lightStyles = StyleSheet.create({
    ...commonStyles,
    container: {
        ...commonStyles.container,
        backgroundColor: '#EDEDED',
    },
    title: {
        ...commonStyles.title,
        color: '#000',
    },
    button: {
        ...commonStyles.button,
        backgroundColor: "#FFF",
    },
    buttonText: {
        ...commonStyles.buttonText,
        color: '#000',
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
    button: {
        ...commonStyles.button,
        backgroundColor: "#000",
    },
    buttonText: {
        ...commonStyles.buttonText,
        color: '#fff',
    },
});