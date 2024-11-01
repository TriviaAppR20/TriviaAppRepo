import React from 'react';
import { View, Text, Button, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RadioButton } from 'react-native-paper';

// Luo navigaatiopino
const Stack = createNativeStackNavigator();

// Päänäkymä
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
          <Button title="Host a game" onPress={() => navigation.navigate('HostScreen')} />
        </View>
        <View style={styles.buttonSpacing}>
          <Button title="Join" onPress={() => navigation.navigate('JoinScreen')} />
        </View>
      </View>
    </View>
  );
}

// Menu-näkymä
function MenuScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back" size={28} color="black" />
      </TouchableOpacity>
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

// Join-näkymä
function JoinScreen({ navigation }) {
  const [code, setCode] = React.useState('');

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back" size={28} color="black" />
      </TouchableOpacity>
      <Text style={styles.joinTitle}>Enter code:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter code here"
        keyboardType="numeric"
        value={code}
        onChangeText={setCode}
      />
    </View>
  );
}

// Host-näkymä
function HostScreen({ navigation }) {
  const [question, setQuestion] = React.useState('');
  const [answer1, setAnswer1] = React.useState('');
  const [answer2, setAnswer2] = React.useState('');
  const [answer3, setAnswer3] = React.useState('');
  const [answer4, setAnswer4] = React.useState('');
  const [checked, setChecked] = React.useState('');

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back" size={28} color="black" />
      </TouchableOpacity>
      <Text style={styles.hostTitle}>Enter your question:</Text>
      <TextInput
        style={[styles.input, styles.inputSpacing]}
        placeholder="Enter question here..."
        value={question}
        onChangeText={setQuestion}
      />
      <View style={styles.answerContainer}>
        <RadioButton
          value="answer1"
          status={checked === 'answer1' ? 'checked' : 'unchecked'}
          onPress={() => setChecked('answer1')}
        />
        <TextInput
          style={[styles.input, styles.inputSpacing, styles.answerInput]}
          placeholder="Enter answer 1 here"
          value={answer1}
          onChangeText={setAnswer1}
        />
      </View>
      <View style={styles.answerContainer}>
        <RadioButton
          value="answer2"
          status={checked === 'answer2' ? 'checked' : 'unchecked'}
          onPress={() => setChecked('answer2')}
        />
        <TextInput
          style={[styles.input, styles.inputSpacing, styles.answerInput]}
          placeholder="Enter answer 2 here"
          value={answer2}
          onChangeText={setAnswer2}
        />
      </View>
      <View style={styles.answerContainer}>
        <RadioButton
          value="answer3"
          status={checked === 'answer3' ? 'checked' : 'unchecked'}
          onPress={() => setChecked('answer3')}
        />
        <TextInput
          style={[styles.input, styles.inputSpacing, styles.answerInput]}
          placeholder="Enter answer 3 here"
          value={answer3}
          onChangeText={setAnswer3}
        />
      </View>
      <View style={styles.answerContainer}>
        <RadioButton
          value="answer4"
          status={checked === 'answer4' ? 'checked' : 'unchecked'}
          onPress={() => setChecked('answer4')}
        />
        <TextInput
          style={[styles.input, styles.inputSpacing, styles.answerInput]}
          placeholder="Enter answer 4 here"
          value={answer4}
          onChangeText={setAnswer4}
        />
      </View>
      <View style={styles.startButtonContainer}>
        <Button title="Start the game" onPress={() => console.log("Peli alkaa", { question, answer1, answer2, answer3, answer4, correctAnswer: checked })} />
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
        <Stack.Screen name="JoinScreen" component={JoinScreen} />
        <Stack.Screen name="HostScreen" component={HostScreen} />
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
  joinTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  hostTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    width: '80%',
    textAlign: 'center',
  },
  inputSpacing: {
    marginBottom: 15,
  },
  startButtonContainer: {
    marginTop: 20,
    width: '60%',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  answerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
  },
  answerInput: {
    flex: 1,
  },
});
