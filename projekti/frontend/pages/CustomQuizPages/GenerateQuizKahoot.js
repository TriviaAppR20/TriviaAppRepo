import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, Alert } from "react-native";
import Slider from "@react-native-community/slider";
import { Picker } from "@react-native-picker/picker";
import { db, auth } from "../../../backend/firebase/firebase";
import { decode } from "html-entities";
import {
  collection,
  addDoc,
  setDoc,
  doc,
} from "firebase/firestore";

export default function GenerateQuizKahoot({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [amountOfQuestions, setAmountOfQuestions] = useState(10);
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [type, setType] = useState("");
  const [questions, setQuestions] = useState([]);


    //this is used to generate a quiz based on the options selected by the user
    //fetches the questions from the API and takes the data and 
    //parses it into a format that can be saved in the firestore database
    //few tags are applied to differentiate this generated quiz
    //from user created quizzes.
    //after the game is finished, the generated quiz is deleted
    //unless the saved = false is tagged as true

    //lobby is also created with a random game code
    // and host added as a player in the subcollection, initializing players



  const apiUrl = "https://opentdb.com/api.php";

  //takes base url and adds the query parameters based on the options selected by the user
  // the link to API documentation is in the discord channel
  const generateQueryUrl = () => {
    const queryParams = [`amount=${amountOfQuestions}`];
    if (category) queryParams.push(`category=${category}`);
    if (difficulty) queryParams.push(`difficulty=${difficulty}`);
    if (type) queryParams.push(`type=${type}`);
    return `${apiUrl}?${queryParams.join("&")}`;
  };

  //fecthes the categories from the API
  const fetchCategories = async () => {
    try {
      const response = await fetch("https://opentdb.com/api_category.php");
      const data = await response.json();
      setCategories(data.trivia_categories); //boom
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);


  //fetches random questions from the API based on the options selected by the user
  //repeated question can be avoided, if we used the token provided by the API
  //but for now, we are not using it
  const fetchQuestions = async () => {
    try {
      const url = generateQueryUrl();
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.results) {
        return data;
      } else {
        console.error("Error in API response", data.response_code);
        return null;
      }
    } catch (error) {
      console.error("Error fetching questions", error);
    }
  };


  //this badboy parses the recieved data from the response

  //it maps out the items, and collects incorrect and correct answers in to an array
  // then shuffles the answers and returns the question text, answers and correct answer
  // this fits the format of the firestore database!
  const parseTriviaData = (triviaData) => {
    return triviaData.results.map((item) => {
      const allAnswers = [...item.incorrect_answers, item.correct_answer];
      const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5);

      return {
        questionText: decode(item.question),
        answers: shuffledAnswers.map(answer => decode(answer)), //decoding is applied,
        correctAnswer: decode(item.correct_answer),            //because its buggy
      };
    });
  };

    //fetches the questions and sets them to the state
  const fetchAndSetQuestions = async () => {
    const data = await fetchQuestions();
    if (data) {
      const parsedQuestions = parseTriviaData(data); //data here is the parseTirviaData return!
      setQuestions(parsedQuestions);
      return parsedQuestions;
    }
  };


  //creates a game with the fetched questions
  //same as the SelectQuiz
  const createGame = async () => {
    const quizData = await fetchAndSetQuestions(); //quizz data finally is the parsed quizz
    if (!quizData) {
      Alert.alert("Failed to fetch quiz questions.");
      return;
    }

    const quizTitle = "Generated Quiz";

    try { //this adds the parsed and processed quiz in to the database
      const quizRef = await addDoc(collection(db, "quizzes"), {
        quizTitle,
        questions: quizData,
        creatorId: auth.currentUser.uid,
        generateTag: true,
        saved: false //tags are added, these are used to differentiate the generated quiz
      });

      //this creates a lobby with a random game code
      //and adds the host as a player in the subcollection, initializing players
      //users navigate to the lobby using the gameCode.
      //corresponding data is loaded in the KahootGameScreen
      const gameCode = Math.floor(100000 + Math.random() * 900000).toString();
      const gameDocRef = await addDoc(collection(db, "games"), {
        gameCode,
        status: "open",
        quizId: quizRef.id,
        quizTitle: quizTitle,
        creatorId: auth.currentUser?.uid,
        roundTime: 20,
      });

      const playerId = auth.currentUser?.uid;
      const playerName = auth.currentUser?.displayName || 'Anonymous';
      if (playerId) {
        await setDoc(doc(db, 'games', gameDocRef.id, 'players', playerId), {
          uid: playerId,
          playerName: playerName,
          score: 0,
        });
        console.log('Player added to the game:', playerId, playerName);
      }

      Alert.alert("Lobby created with code:", gameCode);
      navigation.navigate("KahootGameScreen", {
        gameCode,
        quizTitle,
        gameId: gameDocRef.id,
      });
    } catch (error) {
      console.error("Error creating lobby:", error);
      Alert.alert("There was an error creating the lobby. Please try again.");
    }
  };



  //return is a older version from GenerateQuizScreen
  //this can and should be modified when needed!
  return (
    <View style={styles.page}>
      <Text style={styles.header}>Select quiz options</Text>
      <Text style={styles.genericLabel}>Number of questions</Text>
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>{amountOfQuestions}</Text>
        <Slider
          style={styles.slider}
          minimumValue={5}
          maximumValue={50}
          step={1}
          value={amountOfQuestions}
          onValueChange={(value) => setAmountOfQuestions(value)}
          minimumTrackTintColor="#000"
          maximumTrackTintColor="#444"
          thumbTintColor="#000"
        />
      </View>

      <Text style={styles.genericLabel}>Category</Text>
      <Picker
        selectedValue={category}
        onValueChange={(itemValue) => setCategory(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="All categories" value="" />
        {categories.map((cat) => (
          <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
        ))}
      </Picker>

      <Text style={styles.genericLabel}>Difficulty</Text>
      <Picker
        selectedValue={difficulty}
        onValueChange={(itemValue) => setDifficulty(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Any difficulty" value="" />
        <Picker.Item label="Easy" value="easy" />
        <Picker.Item label="Medium" value="medium" />
        <Picker.Item label="Hard" value="hard" />
      </Picker>

      <Text style={styles.genericLabel}>Question type</Text>
      <Picker
        selectedValue={type}
        onValueChange={(itemValue) => setType(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Any type" value="" />
        <Picker.Item label="Multiple choice" value="multiple" />
        <Picker.Item label="True / False" value="boolean" />
      </Picker>

      <Text>{generateQueryUrl()}</Text>
      <View style={styles.buttonContainer}>
        <Button title="START QUIZ" onPress={createGame} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    display: "flex",
    justifyContent: "start",
    alignItems: "center",
    padding: 24,
  },
  genericLabel: {
    marginBottom: 8,
  },
  header: {
    fontSize: 24,
    marginBottom: 24,
  },
  sliderContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: "auto",
    width: "100%",
    marginBottom: 24,
  },
  slider: {
    width: "80%",
  },
  sliderLabel: {
    fontSize: 16,
  },
  picker: {
    marginBottom: 24,
    height: 50,
    width: "100%",
    backgroundColor: "#fff",
  },
  selection: {
    marginTop: 20,
    fontSize: 18,
  },
  buttonContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
