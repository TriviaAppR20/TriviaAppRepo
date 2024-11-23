import React, { useState, useCallback } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const Statistics = () => {
  const [stats, setStats] = useState(null);

  const loadStats = async () => {
    try {
      const statsString = await AsyncStorage.getItem("SP_STATS");
      if (statsString) {
        setStats(JSON.parse(statsString));
      } else {
        setStats(null); // No stats found
      }
    } catch (error) {
      console.error("Error loading statistics:", error);
      setStats(null);
    }
  };

  const clearStats = async () => {
    try {
      await AsyncStorage.removeItem("SP_STATS");
      setStats(null); // Clear the local state as well
      alert("All stats have been deleted.");
    } catch (error) {
      console.error("Error deleting stats:", error);
      alert("Failed to delete stats.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No statistics available.</Text>
        <Button title="Delete All Stats" onPress={clearStats} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView}>
      {Object.keys(stats).map((category) => {
        const categoryStats = stats[category];

        const totalCorrect = Object.values(categoryStats).reduce(
          (sum, { correct }) => sum + correct,
          0
        );
        const totalIncorrect = Object.values(categoryStats).reduce(
          (sum, { incorrect }) => sum + incorrect,
          0
        );
        const totalGuesses = totalCorrect + totalIncorrect;

        return (
          <View key={category} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <Text style={styles.summaryText}>
              Total: {totalGuesses} -{' '}
              <Text style={styles.correct}>{totalCorrect}</Text> -{' '}
              <Text style={styles.incorrect}>{totalIncorrect}</Text>
            </Text>
            {Object.keys(categoryStats).map((difficulty) => {
              const { correct, incorrect } = categoryStats[difficulty];
              const totalDifficultyGuesses = correct + incorrect;

              // Skip difficulties with 0 total guesses
              if (totalDifficultyGuesses === 0) return null;

              return (
                <Text key={difficulty} style={styles.difficultyText}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}:{' '}
                  <Text style={styles.correct}>{correct}</Text> -{' '}
                  <Text style={styles.incorrect}>{incorrect}</Text>
                </Text>
              );
            })}
          </View>
        );
      })}
      <Button title="Delete All Stats" onPress={clearStats} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontSize: 18,
    color: '#666',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  categoryContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  difficultyText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
    marginBottom: 5,
  },
  correct: {
    color: 'green',
    fontWeight: 'bold',
  },
  incorrect: {
    color: 'red',
    fontWeight: 'bold',
  },
});

export default Statistics;
