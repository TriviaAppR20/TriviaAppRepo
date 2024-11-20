import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { auth } from "../../backend/firebase/firebase";
import { signInWithEmailAndPassword, deleteUser } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  //handles log in
  //saves email and password to async storage
  const handleLogin = async () => {
    try {
      const currentUser = auth.currentUser;
      // Check if the current user is anonymous
      if (currentUser?.isAnonymous) {
        const anonymousUid = currentUser.uid;
        
        // Delete the anonymous user
        await deleteUser(currentUser);
        console.log("Anonymous user deleted:", anonymousUid);
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      await AsyncStorage.setItem("email", email);
      await AsyncStorage.setItem("password", password);
      console.log("email/password Logged in:", userCredential.user.uid);
      Alert.alert("Logged in successfully");
      navigation.navigate("Home");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  //redirects to Sign up screen
  const handleSignUp = () => {
    navigation.navigate("SignUpScreen");
  };

  return (
    <View>
      <Text>Login</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
      <Text>
        Don't have an account? Sign up <Text onPress={handleSignUp}>here</Text>.
      </Text>
    </View>
  );
};

export default LoginScreen;
