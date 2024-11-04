import * as React from "react"
import { View, Text, Button } from "react-native"
import KahootHomeScreen from "./CustomQuizPages/KahootHomeScreen"
import { useNavigation } from '@react-navigation/native';
import { getAuth, onAuthStateChanged, signInAnonymously, deleteUser } from '../../backend/firebase/firebase'


export default function HomeScreen() {

const navigation = useNavigation();
//const auth = getAuth();

const handleGoKahoot = () => {
  navigation.navigate('KahootHomeScreen')
 }


  return (
    <View>
      <Text>
        Go play kahoot yeehaw
      </Text>
      <Button title="gogo" onPress={handleGoKahoot}></Button>
    </View>
  )
}