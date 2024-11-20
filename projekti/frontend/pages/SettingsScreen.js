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



// saves the name to the user profile, the firebase uses displayName to store the name, this cant be changed
//unless you want to save it to the database seperately
// it saves it to the authentication profile, not the database
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



// here you can logout, it will remove the email and password from the async storage
// and reset the navigation stack to the home screen
// it will also sign in anonymously after logging out, this gave alot of trouble,
// as the app.js also tries to handle stuff so... but it works now so.
  const handleLogOut = async () => {
    try {
      await signOut(auth);
      Alert.alert("Success", "You have been signed out.");
  
      await AsyncStorage.removeItem('email');
      await AsyncStorage.removeItem('password');
  
      // Reset the navigation stack first
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Home" }],
        })
      );
  
      // Sign in anonymously after resetting navigation
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
                You are currently using an anonymous account. Log in to save your data.
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
              <View style={styles.signOutContainer}>
                <Button title="Sign Out" onPress={handleLogOut} color="#d9534f" />
              </View>
            </>
          )}
        </>
      ) : (
        <>
          <Text style={styles.message}>You must be logged in to edit your name.</Text>
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
    borderRadius: 5,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  message: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  signOutContainer: {
    marginTop: 20,
    alignItems: "center",
  },
});

export default SettingsScreen;
