import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { auth } from '../../backend/firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';


const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

//handles log in

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await AsyncStorage.setItem('email', email);
      await AsyncStorage.setItem('password', password);
      console.log("email/password Logged in:", userCredential.user.uid);
      navigation.navigate('SelectQuiz') 
    } catch (error) {
      console.error("Login error:", error);
    }
  };


  //redirects to Sign up screen
  const handleSignUp = () => {
    navigation.navigate('SignUpScreen'); // Correct navigation call
  };

  return (
    <View>
      <Text>Login</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Login" onPress={handleLogin} />
      <Text>Don't have an account? Sign up <Text onPress={handleSignUp}>here</Text>.</Text>
    </View>
  );
};

export default LoginScreen;
