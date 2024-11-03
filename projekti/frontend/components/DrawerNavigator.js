import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "../pages/HomeScreen";
import GenerateQuizScreen from "../pages/GenerateQuizScreen";

const Drawer = createDrawerNavigator();

// Place any screens you want to be accessible through the burger menu drawer into this navigator
export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{ headerTitleAlign: "center" }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Generate Quiz" component={GenerateQuizScreen} />
    </Drawer.Navigator>
  );
}
