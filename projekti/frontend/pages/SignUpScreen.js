import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet, Text } from "react-native";
import { auth } from "../../backend/firebase/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  deleteUser,
  updateProfile,
} from "firebase/auth";

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");


  //handles sign up
  //now saves the name to the user profile
  const handleSignUp = async () => {
    try {
      const currentUser = auth.currentUser;

      // Save the current UID if the user is anonymous
      //allows to associate any data or state tied to the anonymous user with
      //newly created account
      //this isnt even nessessary as of now,

      //for example:: if you are adding things to a cart, but in the process are required to log in
      //you can save the cart to the anonymous user, and then when the user logs in, you can transfer the cart to the new user
      const anonymousUid = currentUser?.isAnonymous ? currentUser.uid : null;
      //apparently a common best practise in Firebase apps to handle transitions from anonymous to permanent users



      // Create the new user account
      const newUser = await createUserWithEmailAndPassword(auth, email, password);

      // Update the profile with the name
      await updateProfile(newUser.user, { displayName: name });


      //no need to delete anonymous user here since you are not signed in as you create a new account!
      //wait, you actually are signed in, hmm needs more testing

      
      Alert.alert("Success", "Account created!");
      navigation.navigate("Home"); //change if needed
    } catch (error) {
      Alert.alert("Error", error.message);
      console.error("Sign-up error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Sign Up" onPress={handleSignUp} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 15,
    padding: 8,
  },
});

export default SignUpScreen;
