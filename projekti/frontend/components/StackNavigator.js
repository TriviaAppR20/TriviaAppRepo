import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DrawerNavigator from "./DrawerNavigator";
import GameScreen from "../pages/GameScreen";
import KahootHomeScreen from "../pages/CustomQuizPages/KahootHomeScreen";
import LoginScreen from "../pages/LoginScreen";
import Lobby from "../pages/CustomQuizPages/Lobby";
import SelectQuiz from "../pages/CustomQuizPages/SelectQuiz";
import KahootGameScreen from "../pages/CustomQuizPages/KahootGameScreen";
import QuizzScreen from "../pages/CustomQuizPages/QuizzScreen";
import CreateQuiz from "../pages/CustomQuizPages/CreateQuiz";
import SignUpScreen from "../pages/SignUpScreen";
import GenerateQuizKahoot from "../pages/CustomQuizPages/GenerateQuizKahoot";
import { StatusBar } from 'react-native';
import { DarkModeContext } from "../pages/DarkModeContext";
import { useContext } from "react";
import SettingsScreen from '../pages/SettingsScreen';

const Stack = createNativeStackNavigator();

// Place any screens you want to only be accessible through the use of navigation.navigate here
export default function StackNavigator() {
  const { isDarkMode } = useContext(DarkModeContext);
  const styles = isDarkMode ? darkStyles : lightStyles;

  return (
    <>
    <StatusBar barStyle={styles.barStyle} backgroundColor={styles.backgroundColor}/>
    <Stack.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen
        name="Main"
        component={DrawerNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Game" component={GameScreen} />

      {/*Temporary, for accessing Kahoot stuff, can be relocated or deleted later etc*/}
      <Stack.Screen name="KahootHomeScreen" component={KahootHomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Lobby" component={Lobby} />
      <Stack.Screen name="SelectQuiz" component={SelectQuiz} />
      <Stack.Screen
        name="KahootGameScreen"
        component={KahootGameScreen}
        options={{ headerLeft: null }}
      />
      <Stack.Screen
        name="QuizzScreen"
        component={QuizzScreen}
        options={{ headerLeft: null }}
      />
      <Stack.Screen name="CreateQuiz" component={CreateQuiz} />
      <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
      <Stack.Screen name="GenerateQuizKahoot" component={GenerateQuizKahoot} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
    </>
  );
}

const lightStyles = {
  barStyle: "dark-content",
  backgroundColor: "#FFF"
}

const darkStyles = {
  barStyle: "light-content",
  backgroundColor: "#000"
}