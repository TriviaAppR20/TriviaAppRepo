import React, { useContext } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { DarkModeContext } from './DarkModeContext';

const DarkMode = () => {
    const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);

    const styles = isDarkMode ? darkStyles : lightStyles;

    return (
        <View style={styles.container}>
            <Text style={styles.question}>App too bright for you? We got you.</Text>
            <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>{isDarkMode ? "Dark Mode" : "Light Mode"}</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleDarkMode}
                    value={isDarkMode}
                />
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
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    switchLabel: {
        fontSize: 18,
        marginRight: 10,
    },
    question: {
        fontSize: 20,
        marginBottom: 20,
    },
};

const lightStyles = StyleSheet.create({
    ...commonStyles,
    container: {
        ...commonStyles.container,
        backgroundColor: '#fff',
    },
    switchLabel: {
        ...commonStyles.switchLabel,
        color: '#000',
    },
    question: {
        ...commonStyles.question,
        color: '#000',
    },
});

const darkStyles = StyleSheet.create({
    ...commonStyles,
    container: {
        ...commonStyles.container,
        backgroundColor: '#121212',
    },
    switchLabel: {
        ...commonStyles.switchLabel,
        color: '#fff',
    },
    question: {
        ...commonStyles.question,
        color: '#fff',
    },
});

export default DarkMode;