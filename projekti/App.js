import React, { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './backend/firebase/firebase';
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./frontend/components/StackNavigator";
import { DarkModeProvider } from './frontend/pages/DarkModeContext';
import { 
  signInAnonymously, 
  onAuthStateChanged, 
  deleteUser, 
  signOut, 
  signInWithEmailAndPassword 
} from 'firebase/auth';


// The app handles user authentication and manages inactivity using Firebase Auth and AsyncStorage.
// 
// On app startup:
// - Checks if the user has been inactive for too long.
//   - If yes, logs out email/password users and deletes anonymous user accounts.
//   - Clears saved user credentials from storage.
// - If a valid session exists, the user is resumed (email/password or anonymous).
// - If no session exists, a new anonymous user session is created.
// 
// While the app is running:
// - Tracks when the app goes into the background, saving the current time as the "last active" time.
// - On returning to the foreground, checks if the inactivity threshold has been exceeded.
//   - If exceeded, logs out the current user and clears user data from storage.
//   - New anonymous user is created, if exceeded atleast it should, from my testing it always did
// A navigation stack is rendered, and the authenticated user is passed as a prop to manage user-specific navigation.



// so:
// This component handles user authentication and inactivity logic. 
// It uses Firebase Auth for login (anonymous or email/password) 
// and AsyncStorage for local data persistence.


export default function App() {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const INACTIVITY_THRESHOLD = 1000 * 60 * 30; // 30 minute threshold for inactivity

  useEffect(() => {
    // This function initializes the authentication state when the app loads.
    // It handles checking for existing sessions, inactivity, and logging in users.
    const initializeAuth = async () => {
      try {
        // Fetch the time of the last user activity from AsyncStorage
        const storedLastActive = await AsyncStorage.getItem('lastActive');
        const timeElapsed = Date.now() - (storedLastActive ? parseInt(storedLastActive) : Date.now());

        // If the user has been inactive for too long, log them out
        if (timeElapsed > INACTIVITY_THRESHOLD) {
          if (auth.currentUser) {
            if (auth.currentUser.isAnonymous) {
              // Delete anonymous user session
              await deleteUser(auth.currentUser);
              console.log("Old anonymous user deleted after inactivity.");
            } else {
              // Log out email/password user
              await signOut(auth);
              console.log("Email/password user logged out after inactivity.");
            }
          }
          // Clear stored credentials and last active time
          await AsyncStorage.removeItem('email');
          await AsyncStorage.removeItem('password');
          await AsyncStorage.removeItem('lastActive');
        }

        // Check for stored email/password credentials
        const storedEmail = await AsyncStorage.getItem('email');
        const storedPassword = await AsyncStorage.getItem('password');

        if (storedEmail && storedPassword) {
          // Sign in using email/password credentials if available
          const emailUser = await signInWithEmailAndPassword(auth, storedEmail, storedPassword);
          console.log("Signed in with email/password:", emailUser.user.uid);
          setUser(emailUser.user);
        } else if (auth.currentUser) {
          // Resume existing session if user is already logged in
          console.log("Resuming user session:", auth.currentUser.uid);
          setUser(auth.currentUser); 
        } else {
          // Sign in anonymously if no session exists
          const anonymousUser = await signInAnonymously(auth);
          console.log("Signed in anonymously:", anonymousUser.user.uid);
          setUser(anonymousUser.user);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        // Mark initialization as complete
        setIsInitializing(false);
      }
    };

    // Run the initialization function
    initializeAuth();

    // Listen for changes in the authentication state
    // has some logging, can be commented out later, maybe
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!isInitializing) {
        setUser(currentUser);
        if (currentUser) {
          console.log(currentUser.isAnonymous 
            ? `Anonymous user: ${currentUser.uid}` 
            : `Email/password user: ${currentUser.uid}`);
        } else {
          console.log("No user currently signed in.");
        }
      }
    });

    // Cleanup the auth state listener when the component unmounts
    return () => unsubscribe();
  }, [isInitializing]);


    // This effect tracks the app's state changes (foreground/background) 
    // to update the last activity time or handle inactivity.
  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (nextAppState === 'background') {
        // Save the current time as the last active time when the app goes to the background
        const currentTime = Date.now();
        await AsyncStorage.setItem('lastActive', currentTime.toString());
      }


      // Check inactivity when the app returns to the foreground
      if (nextAppState === 'active') {
        //we take lastactive and start comparing
        const storedLastActive = await AsyncStorage.getItem('lastActive');
        const timeElapsed = Date.now() - (storedLastActive ? parseInt(storedLastActive) : Date.now());//otherwise, date now is now

        //if timeElapsed is greater than the threshold, log out the user
        //and clear stored user data
        //if user is anonymous, delete the user
        //new one is generated, not here but
        if (timeElapsed > INACTIVITY_THRESHOLD) {
          console.log('User has been inactive for too long. Logging out...');
          if (auth.currentUser) {
            if (auth.currentUser.isAnonymous) {
              await deleteUser(auth.currentUser);
              console.log("Anonymous user deleted after inactivity.");
            } else {
              await signOut(auth);
              console.log("Email/password user logged out after inactivity.");
            }
          }
          // Clear stored user data after inactivity logout
          //wouldnt want to overload the storage lol
          await AsyncStorage.removeItem('email');
          await AsyncStorage.removeItem('password');
          await AsyncStorage.removeItem('lastActive');
        }
      }
    };

    // Subscribe to app state changes, these are used all over the app
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Clean up the subscription when the component unmounts
    return () => subscription.remove();
  }, []);


    // Render nothing (or a loading spinner) until initialization is complete
  if (isInitializing) {
    return null;
  }

  //user is passed as a prop
  return (
    <DarkModeProvider>
    <NavigationContainer>
      <StackNavigator user={user} />
    </NavigationContainer>
    </DarkModeProvider>
  );
}