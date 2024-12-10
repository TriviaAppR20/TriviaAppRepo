import React, { useEffect, useState } from 'react';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, onAuthStateChanged, signInAnonymously, deleteUser } from 'firebase/auth';

const KahootHomeScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const auth = getAuth();


    //this screen was used for prototyping and navigation testing
    //easily reusable code if needed.



    //create "lobby", checks if user is logged in, if not, redirects to login
    const handleCreateLobby = () => {
      const user = auth.currentUser;
      if (user) {
        if (user.isAnonymous) {
          alert("Please log in to create a lobby.");
          navigation.navigate('Login', { redirect: 'LoginScreen' });
        } else {
          console.log("non anonymous");
          navigation.navigate('SelectQuiz', { redirect: 'SelectQuiz' });
        }
      } else {
        console.log("No user detected.");
      }
    };
  //handles join lobby and directs to screen where code can be entered
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
    <View style={commonStyles.container}>
      <Text style={commonStyles.title}>Welcome to Kahoot Replica</Text>
      <TouchableOpacity style={commonStyles.button} onPress={handleCreateLobby}>
        <Text style={commonStyles.buttonText}>Create Lobby</Text>
      </TouchableOpacity>
      <TouchableOpacity style={commonStyles.button} onPress={handleJoinLobby}>
        <Text style={commonStyles.buttonText}>Join Lobby</Text>
      </TouchableOpacity>
      <TouchableOpacity style={commonStyles.button} onPress={deleteSession}>
        <Text style={commonStyles.buttonText}>Delete Session</Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: 'orange',
    width: '50%', 
    height: 50, 
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Copperplate',
  },
};
export default KahootHomeScreen;