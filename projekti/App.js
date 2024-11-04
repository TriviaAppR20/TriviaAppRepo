import React, { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { auth } from './backend/firebase/firebase';
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./frontend/components/StackNavigator";
import { signInAnonymously, deleteUser } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Sign in the user anonymously on app start
    const checkAuth = async () => {
      try {
        const userCredential = await signInAnonymously(auth);
        setUser(userCredential.user);
        console.log("Signed in anonymously:", userCredential.user);
      } catch (error) {
        console.error("Error signing in anonymously:", error);
      }
    };

    checkAuth();

    // Function to handle app state changes
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'inactive' || nextAppState === 'background') {
        if (auth.currentUser && auth.currentUser.isAnonymous) {
          deleteUser(auth.currentUser)
            .then(() => console.log("Anonymous user deleted."))
            .catch((error) => console.error("Error deleting anonymous user:", error));
        }
      }
    };

    // Add the AppState change listener
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Clean up the listener on component unmount
    return () => {
      subscription.remove();  // Correct cleanup for newer versions of React Native
    };
  }, []);

  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
}
