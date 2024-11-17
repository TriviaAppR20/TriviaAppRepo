import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "../pages/HomeScreen";
import GenerateQuizScreen from "../pages/GenerateQuizScreen";
import AboutScreen from "../pages/AboutScreen";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const Drawer = createDrawerNavigator();

// Place any screens you want to be accessible through the burger menu drawer into this navigator
export default function DrawerNavigator() {
  const navigation = useNavigation();


  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={({ navigation }) => ({
        headerTitleAlign: 'center',
        headerRight: () => (
          <Icon
            name="settings"
            size={24}
            color="black"
            style={{ marginRight: 15 }}
            onPress={() => navigation.navigate('Settings')} 
          />
        ),
      })}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Generate Quiz" component={GenerateQuizScreen} />
      <Drawer.Screen name="About" component={AboutScreen} />
    </Drawer.Navigator>
  );
}
