import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
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
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 8,
    width: '100%',
  },
  button: {
    backgroundColor: 'orange',
    paddingVertical: 10,
    paddingHorizontal: 20,
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
});

export default SignUpScreen;
