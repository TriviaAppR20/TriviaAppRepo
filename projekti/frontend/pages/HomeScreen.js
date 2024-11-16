import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { DarkModeContext } from './DarkModeContext';

export default function HomeScreen() {
    const navigation = useNavigation();
    const { isDarkMode } = useContext(DarkModeContext);

    const styles = isDarkMode ? darkStyles : lightStyles;

    const handleGoKahoot = () => {
        navigation.navigate('KahootHomeScreen');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Go play kahoot yeehaw
            </Text>
            <TouchableOpacity style={styles.button} onPress={handleGoKahoot}>
                <Text style={styles.buttonText}>GOGO</Text>
            </TouchableOpacity>
        </View>
    );
}

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
    button: {
        backgroundColor: 'orange',
        paddingVertical: 5,
        paddingHorizontal: 20,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        fontFamily: 'Copperplate',
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
    button: {
        ...commonStyles.button,
        backgroundColor: 'orange',
    },
    buttonText: {
        ...commonStyles.buttonText,
        color: '#fff',
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
        backgroundColor: 'orange',
    },
    buttonText: {
        ...commonStyles.buttonText,
        color: '#fff',
    },
});