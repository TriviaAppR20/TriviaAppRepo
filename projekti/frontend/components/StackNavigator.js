import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrawerNavigator from './DrawerNavigator';
import GameScreen from '../pages/GameScreen';

const Stack = createNativeStackNavigator()

// Place any screens you want to only be accessible through the use of navigation.navigate here
export default function StackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen
        name="Main"
        component={DrawerNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Game" component={GameScreen} />
    </Stack.Navigator>
  )
}