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

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const navigation = useNavigation();
  const { isDarkMode } = useContext(DarkModeContext);

  const drawerStyles = isDarkMode ? darkDrawerStyles : lightDrawerStyles;

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerTitleAlign: "center",
        drawerInactiveTintColor: drawerStyles.inactiveTintColor,
        drawerActiveTintColor: drawerStyles.activeTintColor,
        drawerStyle: drawerStyles.drawerStyle,
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
    </Drawer.Navigator>
  );
}

const lightDrawerStyles = {
  inactiveTintColor: "#001011ff",
  activeTintColor: "#001011ff",
  drawerStyle: {
    backgroundColor: "#fff",
  },
};

const darkDrawerStyles = {
  inactiveTintColor: "#ffffff",
  activeTintColor: "#ffffff",
  drawerStyle: {
    backgroundColor: "#121212",
  },
};