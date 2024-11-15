import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const loadDarkMode = async () => {
            try {
                const savedDarkMode = await AsyncStorage.getItem('darkMode');
                if (savedDarkMode !== null) {
                    const isDark = JSON.parse(savedDarkMode);
                    setIsDarkMode(isDark);
                }
            } catch (error) {
                console.error('Failed to load dark mode setting:', error);
            }
        };

        loadDarkMode();
    }, []);

    useEffect(() => {
        const saveDarkMode = async () => {
            try {
                await AsyncStorage.setItem('darkMode', JSON.stringify(isDarkMode));
            } catch (error) {
                console.error('Failed to save dark mode setting:', error);
            }
        };

        saveDarkMode();
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode(prevState => !prevState);
    };

    return (
        <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    );
};
