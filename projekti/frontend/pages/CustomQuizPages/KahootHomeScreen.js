import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, onAuthStateChanged, signInAnonymously, deleteUser } from 'firebase/auth';

const KahootHomeScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const auth = getAuth();

  // this screen was used for prototyping and navigation testing

  // easily reusable code if needed.

  // create "lobby", checks if user is logged in, if not, redirects to login
  const handleCreateLobby = () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.isAnonymous) {
          navigation.navigate('Login', { redirect: 'LoginScreen' });
          alert("Please log in to create a lobby.");
        } else {
          console.log("non anonymous");
          navigation.navigate('SelectQuiz', { redirect: 'SelectQuiz' });
        }
      } else {
        console.log("No user detected. Redirecting to Login.");
        navigation.navigate('Login', { redirect: 'SelectQuiz' });
      }
    });
  };

  // handles join lobby and directs to screen where code can be entered
  const handleJoinLobby = () => {
    navigation.navigate('Lobby', { join: true });
  };

  // this was originally used for deleting anonymous sessions
  // not sure if it works anymore, closing app should delete anonymous uid anyways.
  const deleteSession = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      if (user.isAnonymous) {
        try {
          await deleteUser(user);
          console.log("Anonymous session deleted.");
          alert("Anonymous session deleted successfully.");
          const newUser = await signInAnonymously(auth);
          setUser(newUser.user);
          console.log("New anonymous session created.");
          navigation.navigate('Home'); // Redirect to ensure cleanup
        } catch (error) {
          console.error("Error deleting anonymous session:", error);
          alert("Failed to delete session. Try again.");
        }
      } else {
        alert("This session is not anonymous.");
      }
    } else {
      alert("No active session to delete.");
    }
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Welcome to Kahoot Replica</Text>
      <Text style={styles.buttonText}>Want to play with friends? Create a Lobby!</Text>
      <TouchableOpacity style={styles.button} onPress={handleCreateLobby}>
        <Text style={styles.buttonText}>Create Lobby</Text>
        </TouchableOpacity>
        <Text style={styles.buttonText}>Join your friends lobby using game code!</Text>
      <TouchableOpacity style={styles.button} onPress={handleJoinLobby}>
        <Text style={styles.buttonText}>Join Lobby</Text>
      </TouchableOpacity>
      <Text style={styles.buttonText}>Delete Anonymous session!</Text>
      <TouchableOpacity style={styles.button} onPress={deleteSession}>
        <Text style={styles.buttonText}>Delete Session</Text>
      </TouchableOpacity>
      </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDEDED',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  button: {
    backgroundColor: '#f87609',
    paddingVertical: 18,
    paddingHorizontal: 38,
    borderWidth: 1,
    borderRadius: 24,
    borderColor: '#f87609',
    marginVertical: 35,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default KahootHomeScreen;
