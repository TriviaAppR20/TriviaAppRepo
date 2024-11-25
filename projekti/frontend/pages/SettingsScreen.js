import React, { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, TextInput, View, Button, Alert } from "react-native";
import { 
  getAuth, 
  onAuthStateChanged, 
  updateProfile, 
  signInWithCredential, 
  signOut, 
  signInAnonymously
} from "firebase/auth";
import { CommonActions } from "@react-navigation/native";
import performanceService from "../components/PerformanceService";

const SettingsScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [user, setUser] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [stats, setStats] = useState(null); // Initialize stats as null

  const auth = getAuth();

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAnonymous(currentUser.isAnonymous);
        if (!currentUser.isAnonymous && currentUser.displayName) {
          setName(currentUser.displayName); // Display name if it exists
        }
      } else {
        setUser(null);
        setIsAnonymous(false);
      }
    });

    return unsubscribe; // Cleanup the listener on unmount
  }, []);

  
// Loads stats after ensuring the user is authenticated
useEffect(() => {
  const fetchStats = async () => {
    if (!user || !user.uid) return;
    performanceService.setUserId(user.uid); // Ensure the userId is set
    await performanceService.loadStats(); // Load stats from Firestore
    setStats(performanceService.getStats()); // Update state with latest stats
  };

  fetchStats();
}, [user]); // Ensure this re-runs if user changes

  const handleSave = async () => {
    if (!user) {
      Alert.alert("Error", "No user is logged in.");
      return;
    }

    try {
      await updateProfile(user, { displayName: name });
      Alert.alert("Success", "Your name has been updated!");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      Alert.alert("Success", "You have been signed out.");

      await AsyncStorage.removeItem("email");
      await AsyncStorage.removeItem("password");

      // Reset the navigation stack
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Home" }],
        })
      );

      // Sign in anonymously
      const anonymousUser = await signInAnonymously(auth);
      console.log("Signed in anonymously:", anonymousUser.user.uid);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleLogIn = () => {
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      {user ? (
        <>
          {isAnonymous ? (
            <>
              <Text style={styles.message}>
                You are currently using an anonymous account. Log in to save
                your data.
              </Text>
              <Button title="Log In" onPress={handleLogIn} />
            </>
          ) : (
            <>
              <Text style={styles.label}>Your current name:</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
              />
              <Button title="Save" onPress={handleSave} />
              <View style={styles.statsContainer}>
                <Text style={styles.label}>Your Multiplayer Stats:</Text>
                {stats ? (
                  <>
                    <Text>Total Answers: {stats.totalAnswers}</Text>
                    <Text>Correct Answers: {stats.correctAnswers}</Text>
                    <Text>
                      Correct Percentage:{" "}
                      {stats.correctPercentage
                        ? stats.correctPercentage.toFixed(2)
                        : 0}
                      %
                    </Text>
                    <Text>Games Won: {stats.gamesWon}</Text>
                  </>
                ) : (
                  <Text>Loading stats...</Text>
                )}
              </View>
              <View style={styles.signOutContainer}>
                <Button
                  title="Sign Out"
                  onPress={handleLogOut}
                  color="#d9534f"
                />
              </View>
            </>
          )}
        </>
      ) : (
        <>
          <Text style={styles.message}>
            You must be logged in to edit your name.
          </Text>
          <Button title="Login" onPress={() => navigation.navigate("Login")} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  statsContainer: {
    marginTop: 16,
  },
  signOutContainer: {
    marginTop: 16,
  },
  message: {
    fontSize: 16,
    marginBottom: 16,
  },
});

export default SettingsScreen;