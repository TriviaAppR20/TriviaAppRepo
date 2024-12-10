import React, { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, TextInput, View, Button, Alert, TouchableOpacity } from "react-native";
import { 
  getAuth, 
  onAuthStateChanged, 
  updateProfile, 
  signInWithCredential, 
  signOut, 
  signInAnonymously
} from "firebase/auth";
import { CommonActions } from "@react-navigation/native";


const SettingsScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [user, setUser] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);


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
      const auth = getAuth();
      const currentUser = auth.currentUser;
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
      const anonymousUserId = await AsyncStorage.getItem('ANONYMOUS_USER_ID');
      if (anonymousUserId) {
        // Sign in anonymously and set the anonymous user ID
        const userCredential = await signInAnonymously(auth);
        if (userCredential.user.uid !== anonymousUserId) {
          console.log("Reassigned anonymous user ID:", anonymousUserId);

          //this broke for some reason, code still works just gives errors
         // await updateCurrentUser(auth, { ...userCredential.user, uid: anonymousUserId });
        }
      } else {
        // If no anonymous user ID is saved, sign in anonymously
        await signInAnonymously(auth);
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleLogIn = () => {
    navigation.replace("Login");
  };

  return (
    <View style={commonStyles.container}>
      {user ? (
        <>
          {isAnonymous ? (
            <>
              <Text style={styles.message}>
                You are currently using an anonymous account. Log in to save your data.
              </Text>
              <TouchableOpacity style={commonStyles.button} onPress={handleLogIn}>
                <Text style={commonStyles.buttonText}>Log In</Text>
              </TouchableOpacity>
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
              <TouchableOpacity style={commonStyles.button} onPress={handleSave}>
                <Text style={commonStyles.buttonText}>Save</Text>
              </TouchableOpacity>
              <View style={styles.signOutContainer}>
                <TouchableOpacity
                  style={[commonStyles.button, { backgroundColor: "#d9534f" }]}
                  onPress={handleLogOut}
                >
                  <Text style={commonStyles.buttonText}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </>
      ) : (
        <>
          <Text style={styles.message}>
            You must be logged in to edit your name.
          </Text>
          <TouchableOpacity
            style={commonStyles.button}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={commonStyles.buttonText}>Login</Text>
          </TouchableOpacity>
        </>
      )}
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
    paddingVertical: 5,
    paddingHorizontal: 20,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
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