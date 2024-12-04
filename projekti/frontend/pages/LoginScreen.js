import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, TouchableOpacity } from "react-native";
import { auth } from "../../backend/firebase/firebase";
import { signInWithEmailAndPassword, deleteUser } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

// This screen manages user authentication for the mobile application.
//
// Key functionalities:
// - Allows existing users to log in with email and password
// - Handles deletion of anonymous users before login
// - Stores login credentials in AsyncStorage for potential future use
// - Provides navigation to the SignUp screen for new users
// - Implements error handling for login attempts



  // Handles the login process for users
  //
  // Primary operations:
  // - Checks and removes any existing anonymous user
  // - Authenticates user with Firebase credentials
  // - Stores login information in AsyncStorage
  // - Navigates to Home screen upon successful authentication
  const handleLogin = async () => {
    try {
      const currentUser = auth.currentUser;
      
      // Remove anonymous user if present before logging in
      if (currentUser?.isAnonymous) {
        const anonymousUid = currentUser.uid;
        // Delete the anonymous user
        await deleteUser(currentUser);
        console.log("Anonymous user deleted:", anonymousUid);
      }

       // Authenticate user with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Store login credentials for potential future use
      await AsyncStorage.setItem("email", email);
      await AsyncStorage.setItem("password", password);


      console.log("email/password Logged in:", userCredential.user.uid);
      Alert.alert("Logged in successfully");
      navigation.navigate("Home");
    } catch (error) {
      console.error("Login error:", error);
    }
  };


  // Navigates user to the SignUp screen
  //
  // Allows new users to create an account by redirecting to the registration page
  const handleSignUp = () => {
    navigation.navigate("SignUpScreen");
  };

  return (
    <View style={commonStyles.container}>
      <Text style={commonStyles.title}>Login</Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 8, width: '100%' }}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingHorizontal: 8, width: '100%' }}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={commonStyles.button} onPress={handleLogin}>
        <Text style={commonStyles.buttonText}>Login</Text>
      </TouchableOpacity>
      <Text style={{ marginTop: 20 }}>
        Don't have an account? Sign up{' '}
        <Text style={{ color: 'blue', textDecorationLine: 'underline' }} onPress={handleSignUp}>
          here
        </Text>.
      </Text>
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
    fontFamily: 'Copperplate',
  },
};

export default LoginScreen;