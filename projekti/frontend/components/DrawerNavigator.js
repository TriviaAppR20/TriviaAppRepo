import React, { useContext } from 'react';
import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "../pages/HomeScreen";
import GenerateQuizScreen from "../pages/GenerateQuizScreen";
import AboutScreen from "../pages/AboutScreen";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import HowToPlayScreen from "../pages/HowToPlayScreen";
import DarkMode from "../pages/DarkMode";
import { DarkModeContext } from '../pages/DarkModeContext';
import { StatusBar } from 'react-native';
import MathChallenge from '../pages/MathChallenge';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const navigation = useNavigation();
  const { isDarkMode } = useContext(DarkModeContext);

  const styles = isDarkMode ? darkStyles : lightStyles;

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerTitleAlign: "center",
        swipeEnabled: false, // Disables drawer opening by swiping, only opens on burger menu icon press
        drawerInactiveTintColor: styles.inactiveTintColor,
        drawerActiveTintColor: styles.activeTintColor,
        drawerStyle: styles.drawerStyle,
        headerStyle: styles.headerStyle,
        headerTintColor: styles.headerTintColor,
        headerRight: () => (
          <Icon
            name="settings"
            size={24}
            color={isDarkMode ? "#fff" : "#000"}
            style={{ marginRight: 15 }}
            onPress={() => navigation.navigate("Settings")}
          />
        ),
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Generate Quiz" component={GenerateQuizScreen} />
      <Drawer.Screen name="How To Play" component={HowToPlayScreen} />
      <Drawer.Screen name="About" component={AboutScreen} />
      <Drawer.Screen name="Dark Mode" component={DarkMode} />
      <Drawer.Screen name="Math Challenge" component={MathChallenge} />
    </Drawer.Navigator>
  );
}

const lightStyles = {
  inactiveTintColor: "#001011ff",
  activeTintColor: "#001011ff",
  drawerStyle: {
    backgroundColor: '#fff',
  },
  headerStyle: {
    backgroundColor: "#FFF",
    elevation: 20,
    shadowColor: "#f87609",
  },
  headerTintColor: "#000",
};

const darkStyles = {
  inactiveTintColor: "#ffffff",
  activeTintColor: "#ffffff",
  drawerStyle: {
    backgroundColor: '#121212',
  },
  headerStyle: {
    backgroundColor: "#000",
    elevation: 20,
    shadowColor: "#f87609",
  },
  headerTintColor: "#FFF",
};