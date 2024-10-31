import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

function MainScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('MenuScreen')}>
          <MaterialIcons name="menu" size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => console.log("Kirjaudu sisään")}>
          <FontAwesome name="user" size={28} color="black" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Trivia Quiz</Text>

      <View style={styles.buttonContainer}>
        <View style={styles.buttonSpacing}>
          <Button title="Play!" onPress={() => console.log("Peli alkaa")} />
        </View>
        <View style={styles.buttonSpacing}>
          <Button title="Host a game" onPress={() => console.log("Isännöi peliä")} />
        </View>
        <View style={styles.buttonSpacing}>
          <Button title="Join" onPress={() => console.log("Liity peliin")} />
        </View>
      </View>
    </View>
  );
}

function MenuScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.menuTitle}>Menu</Text>
      <View style={styles.menuButtonContainer}>
        <Button title="How to play?" onPress={() => console.log("Näytetään peliohjeet")} />
      </View>
      <View style={styles.menuButtonContainer}>
        <Button title="Popular categories" onPress={() => console.log("Näytetään suosituimmat kategoriat")} />
      </View>
      <View style={styles.menuButtonContainer}>
        <Button title="About" onPress={() => console.log("Näytetään tietoja sovelluksesta")} />
      </View>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainScreen" component={MainScreen} />
        <Stack.Screen name="MenuScreen" component={MenuScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: 50,
    alignItems: 'center',
  },
  iconContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  menuTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '60%',
    marginTop: 20,
  },
  buttonSpacing: {
    marginBottom: 15,
  },
  menuButtonContainer: {
    width: '60%',
    marginBottom: 15,
  },
});
