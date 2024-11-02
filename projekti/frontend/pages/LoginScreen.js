import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../backend/firebase';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

//handles log in

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('SelectQuiz') 
    } catch (error) {
      console.error("Login error:", error);
    }
  };


  //redirects to Sign up screen
  const handleSignUp = () => {
    navigation.navigate('SignUp'); // Correct navigation call
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
